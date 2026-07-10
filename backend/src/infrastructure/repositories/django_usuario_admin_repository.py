import os
import uuid
from math import ceil
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.db.models import Q

from src.application.dto.usuario_admin_dto import UsuarioAdminDTO
from src.application.ports.usuario_admin_repository import UsuarioAdminRepositoryPort
from src.domain.auditorias.models import Auditoria
from src.domain.roles.helpers import ROLES_PANEL, ROL_VISITANTE, rol_principal_de_usuario, sincronizar_roles_usuario
from src.domain.roles.models import Rol
from src.domain.usuarios.models import Usuario
from src.domain.usuarios.rules import UsuarioRules

ROLES_FORMULARIO = (*ROLES_PANEL, ROL_VISITANTE)


class DjangoUsuarioAdminRepository(UsuarioAdminRepositoryPort):

    @staticmethod
    def _media_url(path: Optional[str]) -> Optional[str]:
        if not path:
            return None
        if path.startswith('http://') or path.startswith('https://'):
            return path
        base = settings.MEDIA_URL.rstrip('/')
        clean = path.lstrip('/')
        return f'{base}/{clean}'

    @staticmethod
    def _iniciales(usuario: Usuario) -> str:
        n = (usuario.nombres or '').strip()
        a = (usuario.apellidos or '').strip()
        parts = []
        if n:
            parts.append(n[0].upper())
        if a:
            parts.append(a[0].upper())
        return ''.join(parts) or (usuario.username[:2].upper() if usuario.username else '?')

    @staticmethod
    def _roles_usuario(usuario: Usuario) -> List[dict]:
        rol = rol_principal_de_usuario(usuario)
        return [{'id': rol.id, 'nombre': rol.nombre}]

    @staticmethod
    def _snapshot_usuario(usuario: Usuario) -> dict:
        return {
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'username': usuario.username,
            'email': usuario.email,
            'telefono': usuario.telefono,
            'foto_perfil': usuario.foto_perfil,
            'activo': usuario.activo,
            'roles': [r['nombre'] for r in DjangoUsuarioAdminRepository._roles_usuario(usuario)],
        }

    @staticmethod
    def _registrar_auditoria(
        actor_id: Optional[int],
        usuario_id: int,
        accion: str,
        datos_anteriores: Optional[dict] = None,
        datos_nuevos: Optional[dict] = None,
    ) -> None:
        Auditoria.objects.create(
            usuario_id=actor_id,
            tabla_afectada='usuarios',
            entidad_id=usuario_id,
            accion=accion,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
        )

    def _serializar_lista(self, usuario: Usuario) -> dict:
        return {
            'id': usuario.id,
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'nombre_completo': usuario.nombre_completo,
            'username': usuario.username,
            'email': usuario.email,
            'telefono': usuario.telefono,
            'foto_perfil': usuario.foto_perfil,
            'foto_url': self._media_url(usuario.foto_perfil),
            'iniciales': self._iniciales(usuario),
            'roles': self._roles_usuario(usuario),
            'ultimo_acceso': usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None,
            'activo': usuario.activo,
        }

    def _validar_roles(self, rol_ids: List[int]) -> List[int]:
        from src.domain.roles.helpers import normalizar_rol_ids
        rol_id = normalizar_rol_ids(rol_ids or [])
        return [rol_id] if rol_id else []

    def _sincronizar_roles(self, usuario: Usuario, rol_ids: List[int]) -> None:
        sincronizar_roles_usuario(usuario, rol_ids)

    def listar_para_admin(
        self,
        search: Optional[str] = None,
        rol_id: Optional[int] = None,
        estado: str = 'todos',
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        queryset = (
            Usuario.objects.filter(eliminado_en__isnull=True)
            .prefetch_related('usuario_roles__rol')
            .order_by('-creado_en')
        )

        if search:
            term = search.strip()
            queryset = queryset.filter(
                Q(nombres__icontains=term)
                | Q(apellidos__icontains=term)
                | Q(username__icontains=term)
                | Q(email__icontains=term)
            )

        if estado == 'activo':
            queryset = queryset.filter(activo=True)
        elif estado == 'inactivo':
            queryset = queryset.filter(activo=False)

        if rol_id:
            queryset = queryset.filter(usuario_roles__rol_id=rol_id).distinct()

        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])

        roles = list(
            Rol.objects.filter(nombre__in=ROLES_FORMULARIO).order_by('nombre').values('id', 'nombre')
        )

        return {
            'results': [self._serializar_lista(u) for u in items],
            'roles': roles,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': max(1, ceil(total / page_size)) if total else 1,
        }

    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        roles = list(
            Rol.objects.filter(nombre__in=ROLES_FORMULARIO).order_by('nombre').values('id', 'nombre', 'descripcion')
        )
        return {'roles': roles}

    def obtener_para_edicion(self, usuario_id: int) -> Optional[Dict[str, Any]]:
        usuario = (
            Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True)
            .prefetch_related('usuario_roles__rol')
            .first()
        )
        if not usuario:
            return None
        return {
            'id': usuario.id,
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'username': usuario.username,
            'email': usuario.email,
            'telefono': usuario.telefono or '',
            'foto_perfil': usuario.foto_perfil,
            'foto_url': self._media_url(usuario.foto_perfil),
            'iniciales': self._iniciales(usuario),
            'rol_ids': [rol_principal_de_usuario(usuario).id],
            'activo': usuario.activo,
        }

    def guardar_completo(self, data: UsuarioAdminDTO, actor_id: int) -> Dict[str, Any]:
        nombres = (data.nombres or '').strip()
        apellidos = (data.apellidos or '').strip()
        username = (data.username or '').strip()
        email = (data.email or '').strip()

        UsuarioRules.validar_nombre(nombres)
        UsuarioRules.validar_nombre(apellidos)
        UsuarioRules.validar_username(username)
        UsuarioRules.validar_email_institucional(email)

        rol_ids = self._validar_roles(data.rol_ids or [])

        if data.id:
            usuario = Usuario.objects.filter(id=data.id, eliminado_en__isnull=True).first()
            if not usuario:
                raise ValueError('Usuario no encontrado.')
            anterior = self._snapshot_usuario(usuario)

            duplicado = Usuario.objects.filter(username__iexact=username).exclude(id=usuario.id).exists()
            if duplicado:
                raise ValueError('El username ya está en uso.')
            duplicado = Usuario.objects.filter(email__iexact=email).exclude(id=usuario.id).exists()
            if duplicado:
                raise ValueError('El email ya está registrado.')

            usuario.nombres = nombres
            usuario.apellidos = apellidos
            usuario.username = username
            usuario.email = email
            usuario.telefono = (data.telefono or '').strip() or None
            usuario.activo = bool(data.activo)
            if data.foto_perfil is not None:
                usuario.foto_perfil = (data.foto_perfil or '').strip() or None
            usuario.save()
            self._sincronizar_roles(usuario, rol_ids)
            usuario.refresh_from_db()

            self._registrar_auditoria(
                actor_id, usuario.id, 'EDITAR',
                datos_anteriores=anterior,
                datos_nuevos=self._snapshot_usuario(usuario),
            )
        else:
            if not data.password:
                raise ValueError('La contraseña es obligatoria al crear un usuario.')
            UsuarioRules.validar_password(data.password)

            if Usuario.objects.filter(username__iexact=username).exists():
                raise ValueError('El username ya está en uso.')
            if Usuario.objects.filter(email__iexact=email).exists():
                raise ValueError('El email ya está registrado.')

            usuario = Usuario(
                nombres=nombres,
                apellidos=apellidos,
                username=username,
                email=email,
                telefono=(data.telefono or '').strip() or None,
                foto_perfil=(data.foto_perfil or '').strip() or None,
                activo=bool(data.activo),
            )
            usuario.set_password(data.password)
            usuario.save()
            self._sincronizar_roles(usuario, rol_ids)

            self._registrar_auditoria(
                actor_id, usuario.id, 'CREAR',
                datos_nuevos=self._snapshot_usuario(usuario),
            )

        return self._serializar_lista(
            Usuario.objects.prefetch_related('usuario_roles__rol').get(id=usuario.id)
        )

    def cambiar_activo(self, usuario_id: int, activo: bool, actor_id: int) -> bool:
        usuario = Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True).first()
        if not usuario:
            return False
        anterior = self._snapshot_usuario(usuario)
        usuario.activo = bool(activo)
        usuario.save(update_fields=['activo', 'actualizado_en'])
        self._registrar_auditoria(
            actor_id, usuario.id, 'EDITAR',
            datos_anteriores=anterior,
            datos_nuevos=self._snapshot_usuario(usuario),
        )
        return True

    def eliminar_logico(self, usuario_id: int, actor_id: int) -> bool:
        usuario = Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True).first()
        if not usuario:
            return False
        anterior = self._snapshot_usuario(usuario)
        usuario.soft_delete()
        self._registrar_auditoria(
            actor_id, usuario.id, 'ELIMINAR',
            datos_anteriores=anterior,
        )
        return True

    def guardar_foto_perfil(self, usuario_id: int, archivo) -> Dict[str, Any]:
        usuario = Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True).first()
        if not usuario:
            raise ValueError('Usuario no encontrado.')
        if not archivo:
            raise ValueError('Debe enviar un archivo de imagen.')

        ext = os.path.splitext(archivo.name)[1].lower() or '.jpg'
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            raise ValueError('Formato de imagen no permitido.')

        perfiles_dir = settings.MEDIA_ROOT / 'perfiles'
        perfiles_dir.mkdir(parents=True, exist_ok=True)
        filename = f'usuario_{usuario_id}_{uuid.uuid4().hex[:8]}{ext}'
        filepath = perfiles_dir / filename

        with open(filepath, 'wb+') as dest:
            for chunk in archivo.chunks():
                dest.write(chunk)

        rel_path = f'perfiles/{filename}'
        usuario.foto_perfil = rel_path
        usuario.save(update_fields=['foto_perfil', 'actualizado_en'])

        return {
            'foto_perfil': rel_path,
            'foto_url': self._media_url(rel_path),
        }

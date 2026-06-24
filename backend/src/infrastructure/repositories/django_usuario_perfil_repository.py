import os
import uuid
from typing import Any, Dict, Optional

from django.conf import settings

from src.application.ports.usuario_perfil_repository import UsuarioPerfilRepositoryPort
from src.domain.usuarios.models import Usuario
from src.domain.usuarios.rules import UsuarioRules

ROL_LABELS = {
    'administrador': 'Administrador',
    'gestor_turistico': 'Gestor turístico',
    'visitante': 'Visitante',
}


class DjangoUsuarioPerfilRepository(UsuarioPerfilRepositoryPort):

    @staticmethod
    def _media_url(path: Optional[str]) -> Optional[str]:
        if not path:
            return None
        if path.startswith('http://') or path.startswith('https://'):
            return path
        base = settings.MEDIA_URL.rstrip('/')
        return f'{base}/{path.lstrip("/")}'

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

    def _serializar(self, usuario: Usuario) -> Dict[str, Any]:
        roles = [
            {'nombre': ur.rol.nombre, 'label': ROL_LABELS.get(ur.rol.nombre, ur.rol.nombre)}
            for ur in usuario.usuario_roles.select_related('rol').all()
        ]
        return {
            'id': usuario.id,
            'nombres': usuario.nombres,
            'apellidos': usuario.apellidos,
            'nombre_completo': usuario.nombre_completo,
            'username': usuario.username,
            'email': usuario.email,
            'telefono': usuario.telefono or '',
            'foto_perfil': usuario.foto_perfil,
            'foto_url': self._media_url(usuario.foto_perfil),
            'iniciales': self._iniciales(usuario),
            'roles': roles,
            'ultimo_acceso': usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None,
            'creado_en': usuario.creado_en.isoformat() if usuario.creado_en else None,
        }

    def _get_usuario(self, usuario_id: int) -> Usuario:
        usuario = (
            Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True)
            .prefetch_related('usuario_roles__rol')
            .first()
        )
        if not usuario:
            raise ValueError('Usuario no encontrado.')
        return usuario

    def obtener_perfil(self, usuario_id: int) -> Optional[Dict[str, Any]]:
        usuario = (
            Usuario.objects.filter(id=usuario_id, eliminado_en__isnull=True)
            .prefetch_related('usuario_roles__rol')
            .first()
        )
        if not usuario:
            return None
        return self._serializar(usuario)

    def actualizar_perfil(
        self,
        usuario_id: int,
        nombres: str,
        apellidos: str,
        telefono: Optional[str],
    ) -> Dict[str, Any]:
        usuario = self._get_usuario(usuario_id)
        nombres = (nombres or '').strip()
        apellidos = (apellidos or '').strip()

        UsuarioRules.validar_nombre(nombres)
        UsuarioRules.validar_nombre(apellidos)

        usuario.nombres = nombres
        usuario.apellidos = apellidos
        usuario.telefono = (telefono or '').strip() or None
        usuario.save(update_fields=['nombres', 'apellidos', 'telefono', 'actualizado_en'])

        return self._serializar(usuario)

    def cambiar_password(
        self,
        usuario_id: int,
        password_actual: str,
        password_nueva: str,
        password_confirmacion: str,
    ) -> None:
        if not password_actual:
            raise ValueError('La contraseña actual es obligatoria.')
        if not password_nueva:
            raise ValueError('La nueva contraseña es obligatoria.')
        if password_nueva != password_confirmacion:
            raise ValueError('Las contraseñas nuevas no coinciden.')

        UsuarioRules.validar_password(password_nueva)

        usuario = self._get_usuario(usuario_id)
        if not usuario.check_password(password_actual):
            raise ValueError('La contraseña actual no es correcta.')

        usuario.set_password(password_nueva)
        usuario.save(update_fields=['password', 'actualizado_en'])

    def guardar_foto_perfil(self, usuario_id: int, archivo) -> Dict[str, Any]:
        usuario = self._get_usuario(usuario_id)
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
            'perfil': self._serializar(usuario),
        }

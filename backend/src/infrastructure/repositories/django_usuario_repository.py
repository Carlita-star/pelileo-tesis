from typing import List, Optional

from django.db.models import Q
from django.utils import timezone

from src.application.ports.usuario_repository import UsuarioRepositoryPort
from src.domain.usuarios.entities import UsuarioEntity
from src.domain.usuarios.models import Usuario as UsuarioModel


class DjangoUsuarioRepository(UsuarioRepositoryPort):
    def _map(self, usuario: UsuarioModel) -> UsuarioEntity:
        roles = []
        if hasattr(usuario, 'usuario_roles'):
            roles = list(usuario.usuario_roles.values_list('rol__nombre', flat=True))

        return UsuarioEntity(
            id=usuario.id,
            username=usuario.username,
            email=usuario.email,
            nombres=usuario.nombres,
            apellidos=usuario.apellidos,
            activo=usuario.activo,
            foto_perfil=usuario.foto_perfil,
            telefono=usuario.telefono,
            ultimo_acceso=usuario.ultimo_acceso,
            roles=roles,
        )

    def guardar(self, usuario: UsuarioEntity, password_plano: Optional[str] = None) -> UsuarioEntity:
        if usuario.id is None:
            model = UsuarioModel()
        else:
            model = UsuarioModel.objects.get(pk=usuario.id)

        model.username = usuario.username
        model.email = usuario.email
        model.nombres = usuario.nombres
        model.apellidos = usuario.apellidos
        model.activo = usuario.activo
        model.foto_perfil = usuario.foto_perfil
        model.telefono = usuario.telefono

        if password_plano:
            model.set_password(password_plano)

        model.save()
        return self._map(model)

    def obtener_por_id(self, usuario_id: int) -> Optional[UsuarioEntity]:
        usuario = UsuarioModel.objects.filter(id=usuario_id).first()
        return self._map(usuario) if usuario else None

    def obtener_por_username(self, username: str) -> Optional[UsuarioEntity]:
        usuario = UsuarioModel.objects.filter(username=username).first()
        return self._map(usuario) if usuario else None

    def obtener_por_email(self, email: str) -> Optional[UsuarioEntity]:
        usuario = UsuarioModel.objects.filter(email=email).first()
        return self._map(usuario) if usuario else None

    def listar_activos(self) -> List[UsuarioEntity]:
        usuarios = UsuarioModel.objects.filter(activo=True, eliminado_en__isnull=True)
        return [self._map(usuario) for usuario in usuarios]

    def eliminar_logico(self, usuario_id: int) -> bool:
        usuario = UsuarioModel.objects.filter(id=usuario_id).first()
        if not usuario:
            return False
        usuario.activo = False
        usuario.eliminado_en = timezone.now()
        usuario.save(update_fields=['activo', 'eliminado_en'])
        return True

    def actualizar_ultimo_acceso(self, usuario_id: int) -> None:
        usuario = UsuarioModel.objects.filter(id=usuario_id).first()
        if usuario:
            usuario.ultimo_acceso = timezone.now()
            usuario.save(update_fields=['ultimo_acceso'])

    def guardar_token_recuperacion(self, usuario_id: int, token: str, expira_en) -> None:
        usuario = UsuarioModel.objects.filter(id=usuario_id).first()
        if usuario:
            usuario.token_recuperacion = token
            usuario.token_expira_en = expira_en
            usuario.save(update_fields=['token_recuperacion', 'token_expira_en'])

    def obtener_por_token_recuperacion(self, token: str) -> Optional[UsuarioEntity]:
        usuario = UsuarioModel.objects.filter(
            token_recuperacion=token,
            token_expira_en__gt=timezone.now(),
            activo=True,
            eliminado_en__isnull=True,
        ).first()
        return self._map(usuario) if usuario else None

    def limpiar_token_recuperacion(self, usuario_id: int) -> None:
        usuario = UsuarioModel.objects.filter(id=usuario_id).first()
        if usuario:
            usuario.token_recuperacion = None
            usuario.token_expira_en = None
            usuario.save(update_fields=['token_recuperacion', 'token_expira_en'])

    def autenticar(self, username_or_email: str, password: str) -> Optional[UsuarioEntity]:
        usuario = UsuarioModel.objects.filter(
            Q(username=username_or_email) | Q(email=username_or_email)
        ).first()
        if not usuario:
            return None

        if not usuario.check_password(password):
            return None

        if not usuario.activo or usuario.eliminado_en is not None:
            return None

        return self._map(usuario)

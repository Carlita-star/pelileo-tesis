from src.application.ports.usuario_repository import UsuarioRepositoryPort
from src.domain.usuarios.entities import UsuarioEntity


class RestablecerPasswordUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryPort):
        self.usuario_repository = usuario_repository

    def execute(self, token: str, password: str, confirm_password: str) -> str:
        if not token or not token.strip():
            raise ValueError('El token es requerido.')
        if not password or not confirm_password:
            raise ValueError('Ambos campos de contraseña son requeridos.')
        if password != confirm_password:
            raise ValueError('Las contraseñas no coinciden.')
        if len(password) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres.')

        usuario = self.usuario_repository.obtener_por_token_recuperacion(token.strip())
        if not usuario:
            raise ValueError('Token inválido o expirado.')

        self.usuario_repository.guardar(usuario, password_plano=password)
        self.usuario_repository.limpiar_token_recuperacion(usuario.id)

        return 'Tu contraseña ha sido restablecida correctamente. Inicia sesión con tu nueva contraseña.'

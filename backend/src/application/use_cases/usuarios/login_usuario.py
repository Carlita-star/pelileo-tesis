from src.application.dto.usuario_dto import LoginCredentialsDTO, UsuarioDTO
from src.application.ports.usuario_repository import UsuarioRepositoryPort
from src.application.services.jwt_service import JwtService


class LoginUsuarioUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryPort, jwt_service: JwtService):
        self.usuario_repository = usuario_repository
        self.jwt_service = jwt_service

    def execute(self, credentials: LoginCredentialsDTO) -> dict:
        usuario = self.usuario_repository.autenticar(
            credentials.username_or_email,
            credentials.password,
        )

        if not usuario:
            raise ValueError('Usuario o contraseña incorrectos.')

        if not usuario.activo:
            raise ValueError('Usuario inactivo o eliminado.')

        token_payload = {
            'sub': usuario.id,
            'username': usuario.username,
            'roles': usuario.roles,
        }
        token = self.jwt_service.generate_token(token_payload)

        self.usuario_repository.actualizar_ultimo_acceso(usuario.id)

        return {
            'usuario': UsuarioDTO(
                id=usuario.id,
                username=usuario.username,
                email=usuario.email,
                nombres=usuario.nombres,
                apellidos=usuario.apellidos,
                nombre_completo=usuario.nombre_completo,
                roles=usuario.roles,
            ),
            'token': token,
        }

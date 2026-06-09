import secrets
from datetime import timedelta
from django.utils import timezone

from src.application.ports.usuario_repository import UsuarioRepositoryPort
from src.application.services.email_service import EmailService


class RecuperarPasswordUseCase:
    def __init__(self, usuario_repository: UsuarioRepositoryPort, email_service: EmailService, frontend_url: str):
        self.usuario_repository = usuario_repository
        self.email_service = email_service
        self.frontend_url = frontend_url

    def execute(self, email: str) -> str:
        if not email or not email.strip():
            raise ValueError('El correo electrónico es requerido.')

        usuario = self.usuario_repository.obtener_por_email(email.strip())
        if not usuario:
            return 'Si el correo existe en el sistema, te hemos enviado un enlace para restablecer tu contraseña.'

        token = secrets.token_urlsafe(32)
        expira_en = timezone.now() + timedelta(hours=2)
        self.usuario_repository.guardar_token_recuperacion(usuario.id, token, expira_en)

        reset_link = f'{self.frontend_url}/?token={token}'
        self.email_service.send_password_reset(email.strip(), reset_link)

        return 'Si el correo existe en el sistema, te hemos enviado un enlace para restablecer tu contraseña.'

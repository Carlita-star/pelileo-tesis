import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


class EmailService:
    def send_password_reset(self, to_email: str, reset_link: str) -> None:
        subject = 'Recuperar contraseña - GAD Pelileo'
        body = (
            'Hola,\n\n'
            'Hemos recibido una solicitud para restablecer tu contraseña.\n'
            f'Por favor, utiliza el siguiente enlace:\n\n{reset_link}\n\n'
            'Si no solicitaste este correo, ignora este mensaje.\n\n'
            'GAD Pelileo'
        )
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@pelileo.gob.ec')

        try:
            send_mail(subject, body, from_email, [to_email], fail_silently=False)
        except Exception as error:
            logger.warning('No se pudo enviar correo de restablecimiento: %s', error)
            logger.info('Enlace de restablecimiento para %s: %s', to_email, reset_link)

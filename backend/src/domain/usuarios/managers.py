from django.contrib.auth.models import BaseUserManager
from django.utils import timezone
 
 
class UsuarioManager(BaseUserManager):
    """
    Manager personalizado para Usuario.
    Separa la lógica de creación del modelo, cumpliendo
    el principio de responsabilidad única (SRP).
    """
 
    def get_queryset_activos(self):
        """Retorna solo usuarios activos y no eliminados."""
        return self.get_queryset().filter(activo=True, eliminado_en__isnull=True)
 
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('El username es obligatorio')
        if not email:
            raise ValueError('El email es obligatorio')
 
        email = self.normalize_email(email)
        extra_fields.setdefault('activo', True)
 
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # hashing automático de Django
        user.save(using=self._db)
        return user
 
    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('activo', True)
        return self.create_user(username, email, password, **extra_fields)
 
    def buscar_por_token_recuperacion(self, token: str):
        """
        Busca un usuario con token de recuperación válido (no expirado).
        Usado en el caso de uso recuperar_password.
        """
        return self.get_queryset().filter(
            token_recuperacion=token,
            token_expira_en__gt=timezone.now(),
            activo=True,
            eliminado_en__isnull=True,
        ).first()
 
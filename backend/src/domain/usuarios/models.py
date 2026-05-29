from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from src.domain.usuarios.managers import UsuarioManager
 
 
class Usuario(AbstractBaseUser):
    """
    Usuario administrativo del sistema turístico.
    Extiende AbstractBaseUser para control total sobre autenticación.
    Los roles se asignan desde src/domain/roles (UsuarioRol).
    """
    nombres = models.CharField(max_length=150)
    apellidos = models.CharField(max_length=150)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=128, db_column='password_hash')
    # AbstractBaseUser provee el campo 'password' con hashing automático
    token_recuperacion = models.TextField(blank=True, null=True)
    token_expira_en = models.DateTimeField(blank=True, null=True)
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    ultimo_acceso = models.DateTimeField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    eliminado_en = models.DateTimeField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
 
    objects = UsuarioManager()
 
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'nombres', 'apellidos']
 
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
 
    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.username})"
 
    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"
 
    @property
    def is_active(self):
        """Requerido por AbstractBaseUser. Combina activo + no eliminado."""
        return self.activo and self.eliminado_en is None
 
    def soft_delete(self):
        """Eliminación lógica: no borra el registro, conserva trazabilidad."""
        from django.utils import timezone
        self.eliminado_en = timezone.now()
        self.activo = False
        self.save(update_fields=['eliminado_en', 'activo'])
 
    def tiene_rol(self, nombre_rol: str) -> bool:
        """Verifica si el usuario tiene un rol específico."""
        return self.usuario_roles.filter(rol__nombre=nombre_rol).exists()
 
    def get_permisos(self):
        """Devuelve todos los códigos de permiso del usuario según sus roles."""
        return (
            self.usuario_roles
            .values_list('rol__rol_permisos__permiso__codigo', flat=True)
            .distinct()
        )
 
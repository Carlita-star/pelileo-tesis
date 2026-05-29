from django.db import models
 
 
class Rol(models.Model):
    """
    Roles del sistema: administrador, gestor_turistico, visitante.
    Define qué puede hacer cada tipo de usuario en el panel y la API.
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'roles'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
 
    def __str__(self):
        return self.nombre
 
 
class Permiso(models.Model):
    """
    Permisos atómicos del sistema.
    El código sigue convención: modulo.accion  → ej: atractivos.crear
    Permite construir RBAC granular por endpoint o funcionalidad.
    """
    codigo = models.CharField(max_length=100, unique=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'permisos'
        verbose_name = 'Permiso'
        verbose_name_plural = 'Permisos'
 
    def __str__(self):
        return f"{self.codigo} — {self.nombre}"
 
 
class UsuarioRol(models.Model):
    """
    Relación muchos a muchos entre usuarios y roles.
    Un usuario puede tener múltiples roles simultáneos.
    Se importan con strings para evitar imports circulares entre dominios.
    """
    usuario = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.CASCADE,
        related_name='usuario_roles'
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.CASCADE,
        related_name='usuario_roles'
    )
 
    class Meta:
        db_table = 'usuario_roles'
        verbose_name = 'Usuario-Rol'
        verbose_name_plural = 'Usuarios-Roles'
        unique_together = ('usuario', 'rol')  # evita duplicados
 
    def __str__(self):
        return f"{self.usuario.username} → {self.rol.nombre}"
 
 
class RolPermiso(models.Model):
    """
    Relación muchos a muchos entre roles y permisos.
    Permite asignar permisos granulares a cada rol sin tocar código.
    """
    rol = models.ForeignKey(
        Rol,
        on_delete=models.CASCADE,
        related_name='rol_permisos'
    )
    permiso = models.ForeignKey(
        Permiso,
        on_delete=models.CASCADE,
        related_name='rol_permisos'
    )
 
    class Meta:
        db_table = 'rol_permisos'
        verbose_name = 'Rol-Permiso'
        verbose_name_plural = 'Roles-Permisos'
        unique_together = ('rol', 'permiso')  # evita duplicados
 
    def __str__(self):
        return f"{self.rol.nombre} → {self.permiso.codigo}"
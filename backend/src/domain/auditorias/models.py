from django.db import models
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.usuarios.models import Usuario

class HistorialPublicacion(models.Model):
    entidad_tipo = models.CharField(max_length=50, blank=True, null=True)
    entidad_id = models.BigIntegerField(blank=True, null=True)
    estado_anterior = models.ForeignKey(
        EstadoPublicacion, on_delete=models.SET_NULL, null=True, related_name='historial_anterior'
    )
    estado_nuevo = models.ForeignKey(
        EstadoPublicacion, on_delete=models.SET_NULL, null=True, related_name='historial_nuevo'
    )
    cambiado_por = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, related_name='historial_publicaciones'
    )
    observacion = models.TextField(blank=True, null=True)
    cambiado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'historial_publicacion'
        verbose_name = 'Historial de Publicación'
        ordering = ['-cambiado_en']
 
 
class Auditoria(models.Model):
    ACCIONES = [
        ('CREAR', 'Crear'), ('EDITAR', 'Editar'), ('ELIMINAR', 'Eliminar'),
        ('LOGIN', 'Inicio de sesión'), ('LOGOUT', 'Cierre de sesión'),
        ('PUBLICAR', 'Publicar'), ('CONFIGURAR', 'Configurar'),
    ]
    usuario = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, related_name='auditorias'
    )
    nombre_usuario = models.CharField(max_length=255, blank=True, null=True)
    tabla_afectada = models.CharField(max_length=100, blank=True, null=True)
    entidad_id = models.BigIntegerField(blank=True, null=True)
    accion = models.CharField(max_length=50, choices=ACCIONES, blank=True, null=True)
    datos_anteriores = models.JSONField(blank=True, null=True)
    datos_nuevos = models.JSONField(blank=True, null=True)
    ip_address = models.CharField(max_length=100, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'auditorias'
        verbose_name = 'Auditoría'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['tabla_afectada', 'entidad_id']),
            models.Index(fields=['usuario', 'fecha']),
        ]
 
    def __str__(self):
        return f"{self.accion} en {self.tabla_afectada} por {self.nombre_usuario}"
 
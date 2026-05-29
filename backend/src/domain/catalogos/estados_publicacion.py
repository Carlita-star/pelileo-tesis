from django.db import models

class EstadoPublicacion(models.Model):
    """Catálogo: borrador | publicado | inactivo"""
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    visible_publico = models.BooleanField(default=True)

    class Meta:
        db_table = 'catalogo_estados_publicacion'
        verbose_name = 'Estado de Publicación'

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

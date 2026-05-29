from django.db import models
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion

class Evento(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='eventos')
    estado_publicacion = models.ForeignKey(EstadoPublicacion, on_delete=models.PROTECT, related_name='eventos')
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    fecha_fin = models.DateTimeField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    latitud = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    organizador = models.CharField(max_length=255, blank=True, null=True)
    contacto = models.CharField(max_length=100, blank=True, null=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'eventos'
        verbose_name = 'Evento'
        ordering = ['fecha_inicio']
 
    def __str__(self):
        return self.nombre
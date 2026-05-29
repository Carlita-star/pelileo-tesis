from django.db import models
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.servicios import Servicio
from src.domain.atractivos.models import Atractivo


class Ruta(models.Model):
    parroquia = models.ForeignKey(
        Parroquia, on_delete=models.PROTECT, related_name='rutas'
    )
    estado_publicacion = models.ForeignKey(
        EstadoPublicacion, on_delete=models.PROTECT, related_name='rutas'
    )
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    distancia_km = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duracion_estimada = models.CharField(max_length=100, blank=True, null=True)
    dificultad = models.CharField(max_length=50, blank=True, null=True)
    punto_inicio = models.CharField(max_length=255, blank=True, null=True)
    punto_fin = models.CharField(max_length=255, blank=True, null=True)
    lat_inicio = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    lon_inicio = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    lat_fin = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    lon_fin = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    geojson_ruta = models.JSONField(blank=True, null=True)
    destacado = models.BooleanField(default=False)
    visitas = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rutas'
        verbose_name = 'Ruta'
        ordering = ['-creado_en']

    def __str__(self):
        return self.nombre


class RutaAtractivo(models.Model):
    ruta = models.ForeignKey(
        Ruta, on_delete=models.CASCADE, related_name='atractivos'
    )
    atractivo = models.ForeignKey(
        Atractivo, on_delete=models.CASCADE, related_name='rutas'
    )
    orden_recorrido = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ruta_atractivos'
        unique_together = ('ruta', 'atractivo')
        verbose_name = 'Atracción de Ruta'
        ordering = ['orden_recorrido']

    def __str__(self):
        return f"{self.ruta.nombre} - {self.atractivo.nombre}"
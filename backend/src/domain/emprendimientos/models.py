# =========================================================
# ARCHIVO:
# src/domain/emprendimientos/models.py
# =========================================================

from django.db import models

from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.usuarios.models import Usuario
from src.domain.atractivos.models import Atractivo
from src.domain.rutas.models import Ruta


class Emprendimiento(models.Model):
    """
    Modelo principal de emprendimientos turísticos.
    """

    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='emprendimientos',
        null=True,
        blank=True
    )

    parroquia = models.ForeignKey(
        Parroquia,
        on_delete=models.PROTECT,
        related_name='emprendimientos'
    )

    estado_publicacion = models.ForeignKey(
        EstadoPublicacion,
        on_delete=models.PROTECT,
        related_name='emprendimientos'
    )

    creado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emprendimientos_creados'
    )

    nombre = models.CharField(
        max_length=255
    )

    descripcion = models.TextField(
        blank=True,
        null=True
    )

    direccion = models.TextField(
        blank=True,
        null=True
    )

    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    sitio_web = models.URLField(
        blank=True,
        null=True
    )

    horario = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    latitud = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        blank=True,
        null=True
    )

    longitud = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        blank=True,
        null=True
    )

    altitud = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )

    visitas = models.IntegerField(
        default=0
    )

    destacado = models.BooleanField(
        default=False
    )

    activo = models.BooleanField(
        default=True
    )

    creado_en = models.DateTimeField(
        auto_now_add=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = 'emprendimientos'
        verbose_name = 'Emprendimiento'
        verbose_name_plural = 'Emprendimientos'
        ordering = ['-creado_en']

    def __str__(self):
        return self.nombre


class EmprendimientoServicio(models.Model):
    """
    Servicios ofrecidos por el emprendimiento.
    """

    emprendimiento = models.ForeignKey(
        Emprendimiento,
        on_delete=models.CASCADE,
        related_name='servicios'
    )

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE
    )

    observacion = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'emprendimiento_servicios'
        unique_together = (
            'emprendimiento',
            'servicio'
        )

    def __str__(self):
        return f'{self.emprendimiento.nombre} - {self.servicio.nombre}'


class EmprendimientoRedSocial(models.Model):
    """
    Redes sociales del emprendimiento.
    """

    emprendimiento = models.ForeignKey(
        Emprendimiento,
        on_delete=models.CASCADE,
        related_name='redes_sociales'
    )
    nombre_red = models.CharField(max_length=100, blank=True, null=True)
    url = models.TextField()
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'emprendimiento_redes_sociales'
        verbose_name = 'Red Social de Emprendimiento'

    def __str__(self):
        return f'{self.emprendimiento.nombre} - {self.nombre_red or self.url}'


class EmprendimientoRelacion(models.Model):
    """
    Relación entre emprendimientos,
    atractivos y rutas turísticas.
    """

    emprendimiento = models.ForeignKey(
        Emprendimiento,
        on_delete=models.CASCADE,
        related_name='relaciones'
    )

    atractivo = models.ForeignKey(
        Atractivo,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    ruta = models.ForeignKey(
        Ruta,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    descripcion = models.TextField(
        blank=True
    )

    distancia_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'emprendimiento_relaciones'

    def __str__(self):
        return self.emprendimiento.nombre


class EmprendimientoHistorialEstado(models.Model):
    """
    Historial de cambios de publicación.
    """

    emprendimiento = models.ForeignKey(
        Emprendimiento,
        on_delete=models.CASCADE,
        related_name='historial_estados'
    )

    estado_anterior = models.CharField(
        max_length=100
    )

    estado_nuevo = models.CharField(
        max_length=100
    )

    cambiado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    observacion = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'emprendimiento_historial_estados'

    def __str__(self):
        return (
            f'{self.emprendimiento.nombre} - '
            f'{self.estado_nuevo}'
        )
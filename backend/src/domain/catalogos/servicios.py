from django.db import models

class Servicio(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'servicios'
        verbose_name = 'Servicio'

    def __str__(self):
        return self.nombre

from django.db import models

class Actividad(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'actividades'
        verbose_name = 'Actividad'

    def __str__(self):
        return self.nombre

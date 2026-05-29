from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    icono = models.CharField(max_length=100, blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'categorias'
        verbose_name = 'Categoría'

    def __str__(self):
        return self.nombre

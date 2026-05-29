from django.db import models

class Parroquia(models.Model):
    nombre = models.CharField(max_length=150)
    canton = models.CharField(max_length=150, blank=True, null=True)
    provincia = models.CharField(max_length=150, blank=True, null=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'parroquias'
        verbose_name = 'Parroquia'

    def __str__(self):
        return f"{self.nombre} - {self.canton}"

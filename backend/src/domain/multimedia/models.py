from django.db import models
class Multimedia(models.Model):
    TIPOS_ENTIDAD = [
        ('atractivo', 'Atractivo'), ('ruta', 'Ruta'),
        ('emprendimiento', 'Emprendimiento'), ('evento', 'Evento'), ('empresa', 'Empresa'),
    ]
    TIPOS_ARCHIVO = [('imagen', 'Imagen'), ('video', 'Video'), ('documento', 'Documento')]
 
    entidad_tipo = models.CharField(max_length=50, choices=TIPOS_ENTIDAD, blank=True, null=True)
    entidad_id = models.BigIntegerField(blank=True, null=True)
    archivo = models.CharField(max_length=255, blank=True, null=True)
    titulo = models.CharField(max_length=255, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=50, choices=TIPOS_ARCHIVO, blank=True, null=True)
    principal = models.BooleanField(default=False)
    orden = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'multimedia'
        verbose_name = 'Multimedia'
        ordering = ['orden']
        indexes = [models.Index(fields=['entidad_tipo', 'entidad_id'])]
 
    def __str__(self):
        return f"{self.entidad_tipo}:{self.entidad_id} - {self.titulo or self.archivo}"
from django.db import models
from django.db import models
from src.domain.usuarios.models import Usuario

class ReporteGenerado(models.Model):
    usuario = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, related_name='reportes_generados'
    )
    tipo_reporte = models.CharField(max_length=100, blank=True, null=True)
    formato = models.CharField(max_length=20, blank=True, null=True)
    parametros = models.JSONField(blank=True, null=True)
    archivo_generado = models.CharField(max_length=255, blank=True, null=True)
    generado_en = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'reportes_generados'
        verbose_name = 'Reporte Generado'
        ordering = ['-generado_en']
 
    def __str__(self):
        return f"{self.tipo_reporte} ({self.formato}) - {self.generado_en}"
 
 
class ConsultaEstadistica(models.Model):
    entidad_tipo = models.CharField(max_length=50, blank=True, null=True)
    entidad_id = models.BigIntegerField(blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    visitas = models.IntegerField(default=0)
    origen = models.CharField(max_length=100, blank=True, null=True)
 
    class Meta:
        db_table = 'consultas_estadisticas'
        verbose_name = 'Consulta Estadística'
        indexes = [models.Index(fields=['entidad_tipo', 'entidad_id', 'fecha'])]
 
    def __str__(self):
        return f"{self.entidad_tipo}:{self.entidad_id} - {self.fecha} ({self.visitas} visitas)"
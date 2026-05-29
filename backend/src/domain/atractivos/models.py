from django.db import models
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio
from src.domain.catalogos.actividades import Actividad
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.usuarios.models import Usuario

class Atractivo(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='atractivos')
    parroquia = models.ForeignKey(Parroquia, on_delete=models.PROTECT, related_name='atractivos')
    creado_por = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='atractivos_creados')
    estado_publicacion = models.ForeignKey(EstadoPublicacion, on_delete=models.PROTECT, related_name='atractivos')
    nombre = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    latitud = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitud = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    altitud = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    horario = models.CharField(max_length=255, blank=True, null=True)
    precio_referencial = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    visitas = models.IntegerField(default=0)
    destacado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'atractivos'
        verbose_name = 'Atractivo Turístico'
        ordering = ['-creado_en']
 
    def __str__(self):
        return self.nombre
 
    def soft_delete(self):
        self.activo = False
        self.save(update_fields=['activo'])
 
 
class AtractivoDetalle(models.Model):
    atractivo = models.OneToOneField(Atractivo, on_delete=models.CASCADE, related_name='detalle')
    clima = models.CharField(max_length=100, blank=True, null=True)
    temperatura = models.CharField(max_length=50, blank=True, null=True)
    precipitacion = models.CharField(max_length=50, blank=True, null=True)
    linea_producto = models.CharField(max_length=100, blank=True, null=True)
    escenario = models.CharField(max_length=100, blank=True, null=True)
    tipo_ingreso = models.CharField(max_length=100, blank=True, null=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    horario = models.CharField(max_length=255, blank=True, null=True)
    formas_pago = models.TextField(blank=True, null=True)
    meses_recomendados = models.TextField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'atractivo_detalles'
        verbose_name = 'Detalle de Atractivo'
 
    def __str__(self):
        return f"Detalle - {self.atractivo.nombre}"
 
 
class AtractivoAdministracion(models.Model):
    atractivo = models.OneToOneField(Atractivo, on_delete=models.CASCADE, related_name='administracion')
    tipo_administrador = models.CharField(max_length=100, blank=True, null=True)
    institucion_responsable = models.CharField(max_length=255, blank=True, null=True)
    nombre_administrador = models.CharField(max_length=255, blank=True, null=True)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=150, blank=True, null=True)
 
    class Meta:
        db_table = 'atractivo_administracion'
        verbose_name = 'Administración de Atractivo'
 
    def __str__(self):
        return f"Administración - {self.atractivo.nombre}"
 
 
class AtractivoAccesibilidad(models.Model):
    atractivo = models.OneToOneField(Atractivo, on_delete=models.CASCADE, related_name='accesibilidad')
    tipo_via = models.CharField(max_length=100, blank=True, null=True)
    estado_via = models.CharField(max_length=100, blank=True, null=True)
    tipo_transporte = models.CharField(max_length=100, blank=True, null=True)
    tiempo_desplazamiento = models.CharField(max_length=100, blank=True, null=True)
    distancia_referencial_km = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    posee_senalizacion = models.BooleanField(null=True)
    acceso_discapacidad = models.BooleanField(null=True)
    observaciones = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'atractivo_accesibilidad'
        verbose_name = 'Accesibilidad de Atractivo'
 
    def __str__(self):
        return f"Accesibilidad - {self.atractivo.nombre}"
 
 
class AtractivoEstadoConservacion(models.Model):
    atractivo = models.OneToOneField(Atractivo, on_delete=models.CASCADE, related_name='estado_conservacion')
    estado_conservacion = models.CharField(max_length=100, blank=True, null=True)
    nivel_seguridad = models.CharField(max_length=100, blank=True, null=True)
    posee_senal_internet = models.BooleanField(null=True)
    cobertura_operadora = models.CharField(max_length=100, blank=True, null=True)
    centro_salud_cercano = models.CharField(max_length=255, blank=True, null=True)
    distancia_centro_salud_km = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    actualizado_en = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'atractivo_estado_conservacion'
        verbose_name = 'Estado de Conservación'
 
    def __str__(self):
        return f"Conservación - {self.atractivo.nombre}"
 
 
class AtractivoServicio(models.Model):
    atractivo = models.ForeignKey(Atractivo, on_delete=models.CASCADE, related_name='atractivo_servicios')
    servicio = models.ForeignKey(Servicio, on_delete=models.PROTECT, related_name='atractivo_servicios')
    observacion = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'atractivo_servicios'
        unique_together = ('atractivo', 'servicio')
        verbose_name = 'Servicio del Atractivo'
 
    def __str__(self):
        return f"{self.atractivo.nombre} → {self.servicio.nombre}"
 
 
class AtractivoActividad(models.Model):
    atractivo = models.ForeignKey(Atractivo, on_delete=models.CASCADE, related_name='atractivo_actividades')
    actividad = models.ForeignKey(Actividad, on_delete=models.PROTECT, related_name='atractivo_actividades')
    observacion = models.TextField(blank=True, null=True)
 
    class Meta:
        db_table = 'atractivo_actividades'
        unique_together = ('atractivo', 'actividad')
        verbose_name = 'Actividad del Atractivo'
 
    def __str__(self):
        return f"{self.atractivo.nombre} → {self.actividad.nombre}"
 
from django.conf import settings
from django.db import models


class ErrorLog(models.Model):
    TIPOS = [
        ('validacion', 'Validación'),
        ('base_datos', 'Base de datos'),
        ('autenticacion', 'Autenticación'),
        ('permiso', 'Permiso'),
        ('red', 'Red / conexión'),
        ('archivo', 'Archivo'),
        ('servidor', 'Servidor'),
        ('cliente', 'Cliente (frontend)'),
        ('desconocido', 'Desconocido'),
    ]
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_revision', 'En revisión'),
        ('solucionado', 'Solucionado'),
    ]

    fecha = models.DateTimeField(auto_now_add=True, db_index=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='errores_registrados',
    )
    nombre_usuario = models.CharField(max_length=255, blank=True, default='')
    modulo = models.CharField(max_length=100, db_index=True, default='general')
    tipo = models.CharField(max_length=30, choices=TIPOS, default='desconocido', db_index=True)
    http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    ruta = models.CharField(max_length=500, blank=True, default='')
    metodo = models.CharField(max_length=10, blank=True, default='')
    mensaje_usuario = models.TextField()
    mensaje_tecnico = models.TextField(blank=True, default='')
    stack_trace = models.TextField(blank=True, default='')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente', db_index=True)
    ip_address = models.CharField(max_length=100, blank=True, default='')
    user_agent = models.TextField(blank=True, default='')
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = 'error_logs'
        verbose_name = 'Registro de error'
        verbose_name_plural = 'Bitácora de errores'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['tipo', 'estado']),
            models.Index(fields=['modulo', 'fecha']),
        ]

    def __str__(self):
        return f'[{self.tipo}] {self.modulo} - {self.mensaje_usuario[:60]}'

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


TIPOS_ENTIDAD = [
    ('atractivo', 'Atractivo'),
    ('ruta', 'Ruta'),
    ('emprendimiento', 'Emprendimiento'),
    ('evento', 'Evento'),
]


class Resena(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resenas',
    )
    entidad_tipo = models.CharField(max_length=20, choices=TIPOS_ENTIDAD, db_index=True)
    entidad_id = models.BigIntegerField(db_index=True)
    calificacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comentario = models.TextField(blank=True, default='')
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'resenas'
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'
        ordering = ['-creado_en']
        constraints = [
            models.UniqueConstraint(
                fields=['usuario', 'entidad_tipo', 'entidad_id'],
                name='resenas_usuario_entidad_unique',
            ),
        ]
        indexes = [
            models.Index(fields=['entidad_tipo', 'entidad_id'], name='resenas_entidad_idx'),
            models.Index(fields=['entidad_tipo', 'entidad_id', 'activo'], name='resenas_entidad_act_idx'),
        ]

    def __str__(self):
        return f'{self.entidad_tipo}:{self.entidad_id} — {self.calificacion}★'

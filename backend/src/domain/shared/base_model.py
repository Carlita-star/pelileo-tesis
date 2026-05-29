# =========================================================
# ARCHIVO:
# src/domain/shared/base_model.py
# =========================================================

import uuid

from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """
    Modelo base reutilizable para todas las entidades del sistema.
    Implementa:
    - UUID como PK
    - auditoría básica
    - soft delete
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    creado_en = models.DateTimeField(
        auto_now_add=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )

    eliminado_en = models.DateTimeField(
        null=True,
        blank=True
    )

    activo = models.BooleanField(
        default=True
    )

    class Meta:
        abstract = True

    def soft_delete(self):
        """
        Eliminación lógica.
        """
        self.eliminado_en = timezone.now()
        self.activo = False
        self.save()

    def restore(self):
        """
        Restaurar registro eliminado.
        """
        self.eliminado_en = None
        self.activo = True
        self.save()

    @property
    def is_deleted(self):
        return self.eliminado_en is not None
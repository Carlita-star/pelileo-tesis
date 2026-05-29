# =========================================================
# ARCHIVO:
# src/domain/auditorias/apps.py
# =========================================================

from django.apps import AppConfig


class AuditoriasConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.auditorias'

    label = 'auditorias'

    verbose_name = 'Auditorías'
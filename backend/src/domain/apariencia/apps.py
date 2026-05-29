# =========================================================
# ARCHIVO:
# src/domain/apariencia/apps.py
# =========================================================

from django.apps import AppConfig


class AparienciaConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.apariencia'

    label = 'apariencia'

    verbose_name = 'Apariencia'
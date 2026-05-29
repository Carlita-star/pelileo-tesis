# =========================================================
# ARCHIVO:
# src/domain/rutas/apps.py
# =========================================================

from django.apps import AppConfig


class RutasConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.rutas'

    label = 'rutas'

    verbose_name = 'Rutas'
# =========================================================
# ARCHIVO:
# src/domain/catalogos/apps.py
# =========================================================

from django.apps import AppConfig


class CatalogosConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.catalogos'

    label = 'catalogos'

    verbose_name = 'Catálogos'
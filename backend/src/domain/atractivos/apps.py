# =========================================================
# ARCHIVO:
# src/domain/atractivos/apps.py
# =========================================================

from django.apps import AppConfig


class AtractivosConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.atractivos'

    label = 'atractivos'

    verbose_name = 'Atractivos'
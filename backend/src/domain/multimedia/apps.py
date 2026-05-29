# =========================================================
# ARCHIVO:
# src/domain/multimedia/apps.py
# =========================================================

from django.apps import AppConfig


class MultimediaConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.multimedia'

    label = 'multimedia'

    verbose_name = 'Multimedia'
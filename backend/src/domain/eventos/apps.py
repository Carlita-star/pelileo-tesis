# =========================================================
# ARCHIVO:
# src/domain/eventos/apps.py
# =========================================================

from django.apps import AppConfig


class EventosConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.eventos'

    label = 'eventos'

    verbose_name = 'Eventos'
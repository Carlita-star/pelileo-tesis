# =========================================================
# ARCHIVO:
# src/domain/configuraciones/apps.py
# =========================================================

from django.apps import AppConfig


class ConfiguracionesConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.configuraciones'

    label = 'configuraciones'

    verbose_name = 'Configuraciones'
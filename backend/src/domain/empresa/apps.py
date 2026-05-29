# =========================================================
# ARCHIVO:
# src/domain/empresa/apps.py
# =========================================================

from django.apps import AppConfig


class EmpresaConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.empresa'

    label = 'empresa'

    verbose_name = 'Empresa'
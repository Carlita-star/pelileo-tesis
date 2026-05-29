# =========================================================
# ARCHIVO:
# src/domain/reportes/apps.py
# =========================================================

from django.apps import AppConfig


class ReportesConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.reportes'

    label = 'reportes'

    verbose_name = 'Reportes'
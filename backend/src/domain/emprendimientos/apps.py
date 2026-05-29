# =========================================================
# ARCHIVO:
# src/domain/emprendimientos/apps.py
# =========================================================

from django.apps import AppConfig


class EmprendimientosConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.emprendimientos'

    label = 'emprendimientos'

    verbose_name = 'Emprendimientos'
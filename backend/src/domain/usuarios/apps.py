# =========================================================
# ARCHIVO:
# src/domain/usuarios/apps.py
# =========================================================

from django.apps import AppConfig


class UsuariosConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'src.domain.usuarios'

    label = 'usuarios'

    verbose_name = 'Usuarios'
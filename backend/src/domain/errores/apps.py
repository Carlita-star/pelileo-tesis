from django.apps import AppConfig


class ErroresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.domain.errores'
    label = 'errores'
    verbose_name = 'Bitácora de errores'

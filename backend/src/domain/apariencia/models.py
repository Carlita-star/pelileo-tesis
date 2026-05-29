"""
Module que expone los modelos de apariencia desde la app `empresa`.

Se mantienen los modelos centralizados en `src.domain.empresa.models`.
Este módulo simplemente importa y reexporta las clases para compatibilidad
de import paths que usan `src.domain.apariencia.models`.
"""

from src.domain.empresa.models import (
    AparienciaSistema,
    ConfiguracionHeader,
    ConfiguracionFooter,
    MenuNavegacion,
)

__all__ = [
    "AparienciaSistema",
    "ConfiguracionHeader",
    "ConfiguracionFooter",
    "MenuNavegacion",
]
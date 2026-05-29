# =========================================================
# ARCHIVO:
# src/domain/empresa/value_objects.py
# =========================================================

from dataclasses import dataclass

from src.domain.shared.validators import (
    validar_ruc_ecuador,
    validar_telefono
)


@dataclass(frozen=True)
class Ruc:
    """
    Value Object para RUC.
    """

    value: str

    def __post_init__(self):
        validar_ruc_ecuador(self.value)


@dataclass(frozen=True)
class Telefono:
    """
    Value Object para teléfonos.
    """

    value: str

    def __post_init__(self):
        validar_telefono(self.value)


@dataclass(frozen=True)
class ColorHexadecimal:
    """
    Value Object para colores hexadecimales.
    """

    value: str

    def __post_init__(self):

        if not self.value.startswith('#'):
            raise ValueError(
                'El color debe iniciar con #'
            )

        if len(self.value) not in [4, 7]:
            raise ValueError(
                'Color hexadecimal inválido'
            )


@dataclass(frozen=True)
class FuenteSistema:
    """
    Value Object para tipografías.
    """

    value: str

    def __post_init__(self):

        fuentes_permitidas = [
            'Roboto',
            'Open Sans',
            'Montserrat',
            'Lato',
            'Poppins',
            'Inter'
        ]

        if self.value not in fuentes_permitidas:
            raise ValueError(
                'Fuente no permitida'
            )
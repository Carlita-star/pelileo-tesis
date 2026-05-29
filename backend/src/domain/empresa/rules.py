# =========================================================
# ARCHIVO:
# src/domain/empresa/rules.py
# =========================================================

"""
Reglas de negocio del dominio Empresa.
"""


class EmpresaRules:
    """
    Reglas empresariales institucionales.
    """

    @staticmethod
    def validar_colores_diferentes(
        color_primario,
        color_secundario
    ):
        """
        Evita colores repetidos.
        """

        if color_primario == color_secundario:
            raise ValueError(
                'Los colores institucionales no pueden ser iguales.'
            )

    @staticmethod
    def validar_fuente_minima(
        tamano_fuente
    ):
        """
        Control de accesibilidad visual.
        """

        if tamano_fuente < 12:
            raise ValueError(
                'El tamaño mínimo permitido es 12px.'
            )

    @staticmethod
    def validar_logo_principal(
        logo
    ):
        """
        El sistema siempre debe tener logo.
        """

        if not logo:
            raise ValueError(
                'La empresa debe tener un logo principal.'
            )

    @staticmethod
    def validar_redes_sociales(
        facebook,
        instagram,
        youtube,
        tiktok
    ):
        """
        Validar que al menos exista una red social.
        """

        redes = [
            facebook,
            instagram,
            youtube,
            tiktok
        ]

        if not any(redes):
            raise ValueError(
                'Debe existir al menos una red social.'
            )

    @staticmethod
    def validar_ubicacion(
        latitud,
        longitud
    ):
        """
        Validar coordenadas básicas.
        """

        if latitud == 0 or longitud == 0:
            raise ValueError(
                'Las coordenadas institucionales son obligatorias.'
            )
# =========================================================
# ARCHIVO:
# src/domain/apariencia/rules.py
# =========================================================

"""
Reglas de negocio para la apariencia visual.
"""


class AparienciaRules:

    # =====================================================
    # VALIDAR COLORES
    # =====================================================

    @staticmethod
    def validar_colores_principales(
        color_primario,
        color_secundario
    ):

        if color_primario == color_secundario:
            raise ValueError(
                'Los colores principales no pueden ser iguales.'
            )

    # =====================================================
    # VALIDAR FUENTES
    # =====================================================

    @staticmethod
    def validar_tamano_fuente(
        tamano
    ):

        if tamano < 12:
            raise ValueError(
                'El tamaño mínimo de fuente es 12px.'
            )

        if tamano > 30:
            raise ValueError(
                'El tamaño máximo de fuente es 30px.'
            )

    # =====================================================
    # VALIDAR SIDEBAR
    # =====================================================

    @staticmethod
    def validar_sidebar(
        ancho_sidebar
    ):

        if ancho_sidebar < 180:
            raise ValueError(
                'El sidebar no puede ser menor a 180px.'
            )

        if ancho_sidebar > 500:
            raise ValueError(
                'El sidebar no puede ser mayor a 500px.'
            )

    # =====================================================
    # VALIDAR BORDES
    # =====================================================

    @staticmethod
    def validar_radio_bordes(
        radio
    ):

        if radio < 0:
            raise ValueError(
                'El radio de bordes no puede ser negativo.'
            )

        if radio > 50:
            raise ValueError(
                'El radio de bordes es demasiado grande.'
            )

    # =====================================================
    # VALIDAR ESPACIADO
    # =====================================================

    @staticmethod
    def validar_espaciado(
        espaciado
    ):

        if espaciado < 0:
            raise ValueError(
                'El espaciado no puede ser negativo.'
            )

    # =====================================================
    # VALIDAR PESO FUENTE
    # =====================================================

    @staticmethod
    def validar_peso_fuente(
        peso
    ):

        pesos_validos = [
            100,
            200,
            300,
            400,
            500,
            600,
            700,
            800,
            900
        ]

        if peso not in pesos_validos:
            raise ValueError(
                'Peso de fuente inválido.'
            )

    # =====================================================
    # VALIDAR MODO OSCURO
    # =====================================================

    @staticmethod
    def validar_modo_oscuro(
        modo_oscuro,
        color_texto
    ):

        if modo_oscuro and color_texto == '#000000':
            raise ValueError(
                'En modo oscuro no se recomienda texto negro.'
            )

    # =====================================================
    # VALIDAR RESPONSIVE
    # =====================================================

    @staticmethod
    def validar_responsive(
        usar_logo_responsive,
        ancho_sidebar
    ):

        if usar_logo_responsive and ancho_sidebar > 400:
            raise ValueError(
                'Sidebar demasiado grande para responsive.'
            )
# =========================================================
# ARCHIVO:
# src/domain/rutas/rules.py
# =========================================================

class RutaRules:

    # =====================================================
    # VALIDAR NOMBRE
    # =====================================================

    @staticmethod
    def validar_nombre(nombre):

        if len(nombre.strip()) < 5:
            raise ValueError(
                'El nombre de la ruta es demasiado corto.'
            )

    # =====================================================
    # VALIDAR DESCRIPCION
    # =====================================================

    @staticmethod
    def validar_descripcion(descripcion):

        if len(descripcion.strip()) < 20:
            raise ValueError(
                'La descripción es demasiado corta.'
            )

    # =====================================================
    # VALIDAR DISTANCIA
    # =====================================================

    @staticmethod
    def validar_distancia(distancia):

        if distancia < 0:
            raise ValueError(
                'La distancia no puede ser negativa.'
            )

    # =====================================================
    # VALIDAR DURACION
    # =====================================================

    @staticmethod
    def validar_duracion(duracion):

        if duracion < 0:
            raise ValueError(
                'La duración no puede ser negativa.'
            )

    # =====================================================
    # VALIDAR DIFICULTAD
    # =====================================================

    @staticmethod
    def validar_dificultad(dificultad):

        dificultades = [
            'FACIL',
            'MEDIA',
            'DIFICIL'
        ]

        if dificultad not in dificultades:
            raise ValueError(
                'Nivel de dificultad inválido.'
            )

    # =====================================================
    # VALIDAR COORDENADAS
    # =====================================================

    @staticmethod
    def validar_coordenadas(
        latitud,
        longitud
    ):

        if latitud < -90 or latitud > 90:
            raise ValueError(
                'Latitud inválida.'
            )

        if longitud < -180 or longitud > 180:
            raise ValueError(
                'Longitud inválida.'
            )

    # =====================================================
    # VALIDAR RECORRIDO
    # =====================================================

    @staticmethod
    def validar_recorrido(
        punto_inicio,
        punto_fin
    ):

        if punto_inicio == punto_fin:
            raise ValueError(
                'El punto inicial y final no pueden ser iguales.'
            )
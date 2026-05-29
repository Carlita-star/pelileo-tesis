# =========================================================
# ARCHIVO:
# src/domain/atractivos/rules.py
# =========================================================

class AtractivoRules:

    @staticmethod
    def validar_nombre(nombre):

        if len(nombre.strip()) < 5:
            raise ValueError(
                'El nombre del atractivo es demasiado corto.'
            )

    @staticmethod
    def validar_descripcion(descripcion):

        if len(descripcion.strip()) < 20:
            raise ValueError(
                'La descripción es demasiado corta.'
            )

    @staticmethod
    def validar_coordenadas(latitud, longitud):

        if latitud < -90 or latitud > 90:
            raise ValueError(
                'Latitud inválida.'
            )

        if longitud < -180 or longitud > 180:
            raise ValueError(
                'Longitud inválida.'
            )

    @staticmethod
    def validar_precio(precio):

        if precio < 0:
            raise ValueError(
                'El precio no puede ser negativo.'
            )

    @staticmethod
    def validar_tiempo_recorrido(tiempo):

        if tiempo < 0:
            raise ValueError(
                'Tiempo recorrido inválido.'
            )
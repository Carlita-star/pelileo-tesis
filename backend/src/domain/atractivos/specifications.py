# =========================================================
# ARCHIVO:
# src/domain/atractivos/specifications.py
# =========================================================

class AtractivoSpecification:

    @staticmethod
    def es_publicable(atractivo):

        if not atractivo.nombre:
            return False

        if not atractivo.descripcion:
            return False

        if not atractivo.latitud:
            return False

        if not atractivo.longitud:
            return False

        return True

    @staticmethod
    def es_destacado(atractivo):

        return (
            atractivo.visitas >= 100
            and atractivo.activo
        )
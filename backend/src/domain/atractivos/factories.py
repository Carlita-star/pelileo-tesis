# =========================================================
# ARCHIVO:
# src/domain/atractivos/factories.py
# =========================================================

from src.domain.atractivos.models import Atractivo


class AtractivoFactory:

    @staticmethod
    def crear_atractivo(data, usuario):

        atractivo = Atractivo.objects.create(
            nombre=data['nombre'],
            categoria=data['categoria'],
            parroquia=data['parroquia'],
            descripcion_corta=data['descripcion_corta'],
            descripcion=data['descripcion'],
            direccion=data['direccion'],
            latitud=data['latitud'],
            longitud=data['longitud'],
            precio_entrada=data.get('precio_entrada', 0),
            tiempo_recorrido=data.get('tiempo_recorrido', 0),
            creado_por=usuario
        )

        return atractivo
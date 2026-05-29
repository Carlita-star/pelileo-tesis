# =========================================================
# ARCHIVO:
# src/domain/atractivos/services.py
# =========================================================

from django.db.models import Q

from src.domain.atractivos.models import Atractivo


class AtractivoService:

    @staticmethod
    def buscar_por_nombre(nombre):

        return Atractivo.objects.filter(
            nombre__icontains=nombre,
            activo=True
        )

    @staticmethod
    def obtener_destacados():

        return Atractivo.objects.filter(
            destacado=True,
            activo=True
        )

    @staticmethod
    def obtener_por_categoria(categoria_id):

        return Atractivo.objects.filter(
            categoria_id=categoria_id,
            activo=True
        )

    @staticmethod
    def incrementar_visitas(atractivo):

        atractivo.visitas += 1
        atractivo.save()

    @staticmethod
    def buscar_general(texto):

        return Atractivo.objects.filter(
            Q(nombre__icontains=texto)
            | Q(descripcion__icontains=texto),
            activo=True
        )
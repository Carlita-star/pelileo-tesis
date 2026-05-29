# =========================================================
# ARCHIVO:
# src/domain/rutas/services.py
# =========================================================

from django.db.models import Q

from src.domain.rutas.models import (
    Ruta,
    RutaAtractivo
)


class RutaService:

    # =====================================================
    # BUSQUEDAS
    # =====================================================

    @staticmethod
    def buscar_por_nombre(nombre):

        return Ruta.objects.filter(
            nombre__icontains=nombre,
            activo=True
        )

    @staticmethod
    def obtener_destacadas():

        return Ruta.objects.filter(
            destacada=True,
            activo=True
        )

    @staticmethod
    def obtener_por_dificultad(dificultad):

        return Ruta.objects.filter(
            dificultad=dificultad,
            activo=True
        )

    @staticmethod
    def buscar_general(texto):

        return Ruta.objects.filter(
            Q(nombre__icontains=texto)
            | Q(descripcion__icontains=texto),
            activo=True
        )

    # =====================================================
    # VISITAS
    # =====================================================

    @staticmethod
    def incrementar_visitas(ruta):

        ruta.visitas += 1
        ruta.save()

    # =====================================================
    # RECORRIDO
    # =====================================================

    @staticmethod
    def obtener_recorrido(ruta_id):

        return RutaAtractivo.objects.filter(
            ruta_id=ruta_id,
            activo=True
        ).order_by('orden_recorrido')

    # =====================================================
    # CALCULAR DISTANCIA TOTAL
    # =====================================================

    @staticmethod
    def calcular_distancia_total(ruta):

        return ruta.distancia_km

    # =====================================================
    # VALIDAR PUBLICACION
    # =====================================================

    @staticmethod
    def puede_publicarse(ruta):

        if not ruta.nombre:
            return False

        if not ruta.descripcion:
            return False

        if ruta.lat_inicio is None:
            return False

        if ruta.lat_fin is None:
            return False

        return True
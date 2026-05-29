# =========================================================
# ARCHIVO:
# src/domain/emprendimientos/services.py
# =========================================================

from django.db.models import Q

from src.domain.emprendimientos.models import (
    Emprendimiento,
    EmprendimientoRelacion
)


class EmprendimientoService:

    # =====================================================
    # BUSQUEDAS
    # =====================================================

    @staticmethod
    def buscar_por_nombre(nombre):

        return Emprendimiento.objects.filter(
            nombre__icontains=nombre,
            activo=True
        )

    @staticmethod
    def obtener_destacados():

        return Emprendimiento.objects.filter(
            destacado=True,
            activo=True
        )

    @staticmethod
    def buscar_general(texto):

        return Emprendimiento.objects.filter(
            Q(nombre__icontains=texto)
            | Q(descripcion__icontains=texto),
            activo=True
        )

    @staticmethod
    def obtener_por_categoria(categoria_id):

        return Emprendimiento.objects.filter(
            categoria_id=categoria_id,
            activo=True
        )

    @staticmethod
    def obtener_por_parroquia(parroquia_id):

        return Emprendimiento.objects.filter(
            parroquia_id=parroquia_id,
            activo=True
        )

    # =====================================================
    # VISITAS
    # =====================================================

    @staticmethod
    def incrementar_visitas(
        emprendimiento
    ):

        emprendimiento.visitas += 1
        emprendimiento.save()

    # =====================================================
    # RELACIONES
    # =====================================================

    @staticmethod
    def obtener_relaciones(
        emprendimiento_id
    ):

        return EmprendimientoRelacion.objects.filter(
            emprendimiento_id=emprendimiento_id,
            activo=True
        )

    # =====================================================
    # PUBLICACION
    # =====================================================

    @staticmethod
    def puede_publicarse(
        emprendimiento
    ):

        if not emprendimiento.nombre:
            return False

        if not emprendimiento.descripcion:
            return False

        if emprendimiento.latitud is None:
            return False

        if emprendimiento.longitud is None:
            return False

        return True
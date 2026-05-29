# =========================================================
# ARCHIVO:
# src/domain/eventos/services.py
# =========================================================

from django.db.models import Q
from django.utils.timezone import now

from src.domain.eventos.models import Evento


class EventoService:

    # =====================================================
    # BUSQUEDAS
    # =====================================================

    @staticmethod
    def buscar_por_nombre(nombre):

        return Evento.objects.filter(
            nombre__icontains=nombre,
            activo=True
        )

    @staticmethod
    def buscar_general(texto):

        return Evento.objects.filter(
            Q(nombre__icontains=texto)
            | Q(descripcion__icontains=texto),
            activo=True
        )

    @staticmethod
    def obtener_destacados():

        return Evento.objects.filter(
            destacado=True,
            activo=True
        )

    @staticmethod
    def obtener_eventos_vigentes():

        return Evento.objects.filter(
            fecha_fin__gte=now().date(),
            activo=True
        )

    @staticmethod
    def obtener_eventos_por_categoria(
        categoria_id
    ):

        return Evento.objects.filter(
            categoria_id=categoria_id,
            activo=True
        )

    @staticmethod
    def obtener_eventos_por_parroquia(
        parroquia_id
    ):

        return Evento.objects.filter(
            parroquia_id=parroquia_id,
            activo=True
        )

    # =====================================================
    # VISITAS
    # =====================================================

    @staticmethod
    def incrementar_visitas(evento):

        evento.visitas += 1
        evento.save()

    # =====================================================
    # PUBLICACION
    # =====================================================

    @staticmethod
    def puede_publicarse(evento):

        if not evento.nombre:
            return False

        if not evento.descripcion:
            return False

        if evento.fecha_inicio is None:
            return False

        if evento.latitud is None:
            return False

        return True
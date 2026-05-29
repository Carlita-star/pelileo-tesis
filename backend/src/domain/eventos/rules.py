# =========================================================
# ARCHIVO:
# src/domain/eventos/rules.py
# =========================================================

from datetime import date


class EventoRules:

    # =====================================================
    # VALIDAR NOMBRE
    # =====================================================

    @staticmethod
    def validar_nombre(nombre):

        if len(nombre.strip()) < 5:
            raise ValueError(
                'El nombre del evento es demasiado corto.'
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
    # VALIDAR FECHAS
    # =====================================================

    @staticmethod
    def validar_fechas(
        fecha_inicio,
        fecha_fin
    ):

        if fecha_fin < fecha_inicio:
            raise ValueError(
                'La fecha fin no puede ser menor a la fecha inicio.'
            )

    # =====================================================
    # VALIDAR HORAS
    # =====================================================

    @staticmethod
    def validar_horas(
        hora_inicio,
        hora_fin
    ):

        if hora_fin <= hora_inicio:
            raise ValueError(
                'La hora fin debe ser mayor a la hora inicio.'
            )

    # =====================================================
    # VALIDAR PRECIO
    # =====================================================

    @staticmethod
    def validar_precio(precio):

        if precio < 0:
            raise ValueError(
                'El precio no puede ser negativo.'
            )

    # =====================================================
    # VALIDAR CUPOS
    # =====================================================

    @staticmethod
    def validar_cupos(cupos):

        if cupos < 0:
            raise ValueError(
                'Los cupos no pueden ser negativos.'
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
    # VALIDAR EVENTO FUTURO
    # =====================================================

    @staticmethod
    def validar_evento_vigente(
        fecha_inicio
    ):

        if fecha_inicio < date.today():
            raise ValueError(
                'No se pueden crear eventos pasados.'
            )
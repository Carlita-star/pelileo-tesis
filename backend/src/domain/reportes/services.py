# =========================================================
# ARCHIVO:
# src/domain/reportes/services.py
# =========================================================

from src.domain.reportes.models import (
    ReporteGenerado
)


class ReporteService:

    # =====================================================
    # REGISTRAR REPORTE
    # =====================================================

    @staticmethod
    def registrar_reporte(
        nombre,
        tipo_reporte,
        formato,
        archivo,
        generado_por,
        descripcion='',
        parametros=None,
        peso_archivo=0,
        total_registros=0,
        fecha_inicio_datos=None,
        fecha_fin_datos=None,
        exitoso=True,
        observaciones=''
    ):

        return ReporteGenerado.objects.create(
            nombre=nombre,
            tipo_reporte=tipo_reporte,
            formato=formato,
            descripcion=descripcion,
            parametros=parametros,
            archivo=archivo,
            peso_archivo=peso_archivo,
            total_registros=total_registros,
            generado_por=generado_por,
            fecha_inicio_datos=fecha_inicio_datos,
            fecha_fin_datos=fecha_fin_datos,
            exitoso=exitoso,
            observaciones=observaciones
        )

    # =====================================================
    # CONSULTAR REPORTES
    # =====================================================

    @staticmethod
    def obtener_todos():

        return ReporteGenerado.objects.filter(
            activo=True
        )

    # =====================================================
    # CONSULTAR POR TIPO
    # =====================================================

    @staticmethod
    def obtener_por_tipo(tipo_reporte):

        return ReporteGenerado.objects.filter(
            tipo_reporte=tipo_reporte,
            activo=True
        )

    # =====================================================
    # CONSULTAR POR USUARIO
    # =====================================================

    @staticmethod
    def obtener_por_usuario(usuario_id):

        return ReporteGenerado.objects.filter(
            generado_por_id=usuario_id,
            activo=True
        )

    # =====================================================
    # CONSULTAR POR FORMATO
    # =====================================================

    @staticmethod
    def obtener_por_formato(formato):

        return ReporteGenerado.objects.filter(
            formato=formato,
            activo=True
        )

    # =====================================================
    # CONSULTAR REPORTES FALLIDOS
    # =====================================================

    @staticmethod
    def obtener_fallidos():

        return ReporteGenerado.objects.filter(
            exitoso=False,
            activo=True
        )

    # =====================================================
    # ESTADISTICAS
    # =====================================================

    @staticmethod
    def total_reportes_generados():

        return ReporteGenerado.objects.filter(
            activo=True
        ).count()
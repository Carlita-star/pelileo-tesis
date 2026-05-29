# =========================================================
# ARCHIVO:
# src/domain/auditorias/services.py
# =========================================================

from src.domain.auditorias.models import Auditoria


class AuditoriaService:

    # =====================================================
    # REGISTRAR AUDITORIA
    # =====================================================

    @staticmethod
    def registrar(
        usuario=None,
        accion='',
        modulo='',
        entidad_tipo='',
        entidad_id='',
        descripcion='',
        datos_anteriores=None,
        datos_nuevos=None,
        ip_address='',
        user_agent='',
        navegador='',
        sistema_operativo='',
        exitoso=True
    ):

        nombre_usuario = ''

        if usuario:
            nombre_usuario = (
                f'{usuario.nombres} '
                f'{usuario.apellidos}'
            )

        return Auditoria.objects.create(
            usuario=usuario,
            nombre_usuario=nombre_usuario,
            accion=accion,
            modulo=modulo,
            entidad_tipo=entidad_tipo,
            entidad_id=str(entidad_id),
            descripcion=descripcion,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            ip_address=ip_address,
            user_agent=user_agent,
            navegador=navegador,
            sistema_operativo=sistema_operativo,
            exitoso=exitoso
        )

    # =====================================================
    # CONSULTAR POR MODULO
    # =====================================================

    @staticmethod
    def obtener_por_modulo(modulo):

        return Auditoria.objects.filter(
            modulo=modulo,
            activo=True
        )

    # =====================================================
    # CONSULTAR POR USUARIO
    # =====================================================

    @staticmethod
    def obtener_por_usuario(usuario_id):

        return Auditoria.objects.filter(
            usuario_id=usuario_id,
            activo=True
        )

    # =====================================================
    # CONSULTAR POR ACCION
    # =====================================================

    @staticmethod
    def obtener_por_accion(accion):

        return Auditoria.objects.filter(
            accion=accion,
            activo=True
        )

    # =====================================================
    # CONSULTAR POR ENTIDAD
    # =====================================================

    @staticmethod
    def obtener_por_entidad(
        entidad_tipo,
        entidad_id
    ):

        return Auditoria.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id=str(entidad_id),
            activo=True
        )

    # =====================================================
    # CONSULTAR ERRORES
    # =====================================================

    @staticmethod
    def obtener_fallidos():

        return Auditoria.objects.filter(
            exitoso=False,
            activo=True
        )

    # =====================================================
    # HISTORIAL COMPLETO
    # =====================================================

    @staticmethod
    def historial():

        return Auditoria.objects.filter(
            activo=True
        ).order_by('-creado_en')
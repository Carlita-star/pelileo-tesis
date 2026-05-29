# =========================================================
# ARCHIVO:
# src/domain/usuarios/permissions.py
# =========================================================

"""
Permisos del sistema.
"""


class PermisosSistema:

    # =====================================================
    # USUARIOS
    # =====================================================

    CREAR_USUARIO = 'crear_usuario'
    EDITAR_USUARIO = 'editar_usuario'
    ELIMINAR_USUARIO = 'eliminar_usuario'
    VER_USUARIO = 'ver_usuario'

    # =====================================================
    # ATRACTIVOS
    # =====================================================

    CREAR_ATRACTIVO = 'crear_atractivo'
    EDITAR_ATRACTIVO = 'editar_atractivo'
    ELIMINAR_ATRACTIVO = 'eliminar_atractivo'
    PUBLICAR_ATRACTIVO = 'publicar_atractivo'

    # =====================================================
    # RUTAS
    # =====================================================

    CREAR_RUTA = 'crear_ruta'
    EDITAR_RUTA = 'editar_ruta'
    ELIMINAR_RUTA = 'eliminar_ruta'

    # =====================================================
    # EMPRENDIMIENTOS
    # =====================================================

    CREAR_EMPRENDIMIENTO = 'crear_emprendimiento'
    EDITAR_EMPRENDIMIENTO = 'editar_emprendimiento'

    # =====================================================
    # EVENTOS
    # =====================================================

    CREAR_EVENTO = 'crear_evento'
    EDITAR_EVENTO = 'editar_evento'

    # =====================================================
    # MULTIMEDIA
    # =====================================================

    SUBIR_ARCHIVO = 'subir_archivo'
    ELIMINAR_ARCHIVO = 'eliminar_archivo'

    # =====================================================
    # CONFIGURACION
    # =====================================================

    EDITAR_CONFIGURACION = 'editar_configuracion'

    # =====================================================
    # REPORTES
    # =====================================================

    EXPORTAR_PDF = 'exportar_pdf'
    EXPORTAR_EXCEL = 'exportar_excel'
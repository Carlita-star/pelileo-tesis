# =========================================================
# ARCHIVO:
# src/domain/roles/rules.py
# =========================================================

"""
Reglas de negocio del dominio Roles y Permisos.
"""


class RolRules:

    # =====================================================
    # VALIDAR NOMBRE
    # =====================================================

    @staticmethod
    def validar_nombre_rol(
        nombre
    ):

        if len(nombre.strip()) < 3:
            raise ValueError(
                'El nombre del rol es demasiado corto.'
            )

    # =====================================================
    # VALIDAR CODIGO
    # =====================================================

    @staticmethod
    def validar_codigo_rol(
        codigo
    ):

        if ' ' in codigo:
            raise ValueError(
                'El código del rol no puede tener espacios.'
            )

        if codigo.upper() != codigo:
            raise ValueError(
                'El código debe estar en mayúsculas.'
            )

    # =====================================================
    # VALIDAR PRIORIDAD
    # =====================================================

    @staticmethod
    def validar_prioridad(
        prioridad
    ):

        if prioridad < 1:
            raise ValueError(
                'La prioridad mínima es 1.'
            )

        if prioridad > 100:
            raise ValueError(
                'La prioridad máxima es 100.'
            )

    # =====================================================
    # VALIDAR ELIMINACION
    # =====================================================

    @staticmethod
    def validar_eliminacion_rol(
        editable
    ):

        if not editable:
            raise ValueError(
                'Este rol es protegido y no puede eliminarse.'
            )

    # =====================================================
    # VALIDAR PERMISOS
    # =====================================================

    @staticmethod
    def validar_permiso(
        codigo
    ):

        if len(codigo.strip()) < 3:
            raise ValueError(
                'Código de permiso inválido.'
            )

    # =====================================================
    # VALIDAR ASIGNACION
    # =====================================================

    @staticmethod
    def validar_asignacion_rol(
        usuario,
        rol
    ):

        if not usuario.activo:
            raise ValueError(
                'No se puede asignar roles a usuarios inactivos.'
            )

        if rol.activo is False:
            raise ValueError(
                'No se puede asignar un rol inactivo.'
            )

    # =====================================================
    # VALIDAR ADMINISTRADOR
    # =====================================================

    @staticmethod
    def validar_rol_administrador(
        codigo
    ):

        roles_protegidos = [
            'SUPER_ADMIN',
            'ADMINISTRADOR_GENERAL'
        ]

        if codigo in roles_protegidos:
            raise ValueError(
                'Rol protegido del sistema.'
            )
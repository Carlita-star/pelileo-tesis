# =========================================================
# ARCHIVO:
# src/domain/emprendimientos/rules.py
# =========================================================

class EmprendimientoRules:

    # =====================================================
    # VALIDAR NOMBRE
    # =====================================================

    @staticmethod
    def validar_nombre(nombre):

        if len(nombre.strip()) < 4:
            raise ValueError(
                'El nombre del emprendimiento es demasiado corto.'
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
    # VALIDAR TELEFONO
    # =====================================================

    @staticmethod
    def validar_telefono(telefono):

        if len(telefono.strip()) < 7:
            raise ValueError(
                'Número telefónico inválido.'
            )

    # =====================================================
    # VALIDAR EMAIL
    # =====================================================

    @staticmethod
    def validar_email(email):

        if email and '@' not in email:
            raise ValueError(
                'Correo electrónico inválido.'
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
    # VALIDAR REDES
    # =====================================================

    @staticmethod
    def validar_redes_sociales(
        facebook,
        instagram,
        tiktok
    ):

        if not any([
            facebook,
            instagram,
            tiktok
        ]):
            return True

        return True

    # =====================================================
    # VALIDAR PUBLICACION
    # =====================================================

    @staticmethod
    def puede_publicarse(
        emprendimiento
    ):

        if not emprendimiento.nombre:
            return False

        if not emprendimiento.descripcion:
            return False

        if not emprendimiento.latitud:
            return False

        if not emprendimiento.longitud:
            return False

        return True
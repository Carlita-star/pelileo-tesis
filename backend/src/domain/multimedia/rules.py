# =========================================================
# ARCHIVO:
# src/domain/multimedia/rules.py
# =========================================================

class MultimediaRules:

    # =====================================================
    # VALIDAR TITULO
    # =====================================================

    @staticmethod
    def validar_titulo(titulo):

        if len(titulo.strip()) < 3:
            raise ValueError(
                'El título es demasiado corto.'
            )

    # =====================================================
    # VALIDAR TIPO ENTIDAD
    # =====================================================

    @staticmethod
    def validar_entidad(entidad_tipo):

        entidades_validas = [
            'ATRACTIVO',
            'RUTA',
            'EMPRENDIMIENTO',
            'EVENTO',
            'EMPRESA'
        ]

        if entidad_tipo not in entidades_validas:
            raise ValueError(
                'Tipo de entidad inválido.'
            )

    # =====================================================
    # VALIDAR TIPO ARCHIVO
    # =====================================================

    @staticmethod
    def validar_tipo_archivo(tipo_archivo):

        tipos_validos = [
            'IMAGEN',
            'VIDEO',
            'DOCUMENTO'
        ]

        if tipo_archivo not in tipos_validos:
            raise ValueError(
                'Tipo de archivo inválido.'
            )

    # =====================================================
    # VALIDAR EXTENSION
    # =====================================================

    @staticmethod
    def validar_extension(extension):

        extensiones_validas = [
            'jpg',
            'jpeg',
            'png',
            'webp',
            'mp4',
            'pdf'
        ]

        if extension.lower() not in extensiones_validas:
            raise ValueError(
                'Extensión de archivo no permitida.'
            )

    # =====================================================
    # VALIDAR PESO
    # =====================================================

    @staticmethod
    def validar_peso(peso):

        limite = 10240

        if peso > limite:
            raise ValueError(
                'El archivo supera el peso permitido.'
            )

    # =====================================================
    # VALIDAR URL
    # =====================================================

    @staticmethod
    def validar_url(url):

        if url and not (
            url.startswith('http://')
            or url.startswith('https://')
        ):
            raise ValueError(
                'URL inválida.'
            )
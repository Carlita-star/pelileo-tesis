# =========================================================
# ARCHIVO:
# src/domain/shared/constants.py
# =========================================================

"""
Constantes globales del sistema.
"""


# =========================================================
# ESTADOS PUBLICACION
# =========================================================

ESTADO_BORRADOR = "BORRADOR"
ESTADO_PUBLICADO = "PUBLICADO"
ESTADO_ARCHIVADO = "ARCHIVADO"
ESTADO_OCULTO = "OCULTO"


ESTADOS_PUBLICACION = [
    ESTADO_BORRADOR,
    ESTADO_PUBLICADO,
    ESTADO_ARCHIVADO,
    ESTADO_OCULTO,
]


# =========================================================
# TIPOS MULTIMEDIA
# =========================================================

TIPO_IMAGEN = "IMAGEN"
TIPO_VIDEO = "VIDEO"
TIPO_AUDIO = "AUDIO"
TIPO_DOCUMENTO = "DOCUMENTO"

TIPOS_MULTIMEDIA = [
    TIPO_IMAGEN,
    TIPO_VIDEO,
    TIPO_AUDIO,
    TIPO_DOCUMENTO,
]


# =========================================================
# ROLES
# =========================================================

ROL_ADMINISTRADOR = "ADMINISTRADOR"
ROL_EDITOR = "EDITOR"
ROL_MODERADOR = "MODERADOR"
ROL_VISITANTE = "VISITANTE"


ROLES_SISTEMA = [
    ROL_ADMINISTRADOR,
    ROL_EDITOR,
    ROL_MODERADOR,
    ROL_VISITANTE,
]


# =========================================================
# TIPOS ENTIDAD
# =========================================================

ENTIDAD_ATRACTIVO = "ATRACTIVO"
ENTIDAD_RUTA = "RUTA"
ENTIDAD_EMPRENDIMIENTO = "EMPRENDIMIENTO"
ENTIDAD_EVENTO = "EVENTO"


TIPOS_ENTIDAD = [
    ENTIDAD_ATRACTIVO,
    ENTIDAD_RUTA,
    ENTIDAD_EMPRENDIMIENTO,
    ENTIDAD_EVENTO,
]


# =========================================================
# ACCIONES AUDITORIA
# =========================================================

ACCION_CREAR = "CREAR"
ACCION_EDITAR = "EDITAR"
ACCION_ELIMINAR = "ELIMINAR"
ACCION_PUBLICAR = "PUBLICAR"
ACCION_LOGIN = "LOGIN"


ACCIONES_AUDITORIA = [
    ACCION_CREAR,
    ACCION_EDITAR,
    ACCION_ELIMINAR,
    ACCION_PUBLICAR,
    ACCION_LOGIN,
]
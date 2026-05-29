# =========================================================
# ARCHIVO:
# src/domain/shared/exceptions.py
# =========================================================

"""
Excepciones personalizadas del dominio.
"""


class DomainException(Exception):
    """
    Excepción base del dominio.
    """
    pass


# =========================================================
# USUARIOS
# =========================================================

class UsuarioNoEncontradoException(DomainException):
    pass


class UsuarioInactivoException(DomainException):
    pass


class CredencialesInvalidasException(DomainException):
    pass


# =========================================================
# ATRACTIVOS
# =========================================================

class AtractivoNoEncontradoException(DomainException):
    pass


class AtractivoNoPublicadoException(DomainException):
    pass


class CoordenadasInvalidasException(DomainException):
    pass


# =========================================================
# RUTAS
# =========================================================

class RutaNoEncontradaException(DomainException):
    pass


# =========================================================
# EMPRENDIMIENTOS
# =========================================================

class EmprendimientoNoEncontradoException(DomainException):
    pass


# =========================================================
# MULTIMEDIA
# =========================================================

class ArchivoNoValidoException(DomainException):
    pass


class TipoArchivoNoPermitidoException(DomainException):
    pass


# =========================================================
# CONFIGURACION
# =========================================================

class ConfiguracionNoEncontradaException(DomainException):
    pass
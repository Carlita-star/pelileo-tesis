# =========================================================
# ARCHIVO:
# src/domain/shared/validators.py
# =========================================================

import re

from django.core.exceptions import ValidationError


# =========================================================
# VALIDAR RUC ECUADOR
# =========================================================

def validar_ruc_ecuador(ruc):
    """
    Validación básica de RUC ecuatoriano.
    """

    if not ruc.isdigit():
        raise ValidationError(
            "El RUC debe contener únicamente números."
        )

    if len(ruc) != 13:
        raise ValidationError(
            "El RUC debe tener 13 dígitos."
        )

    if not ruc.endswith("001"):
        raise ValidationError(
            "El RUC debe terminar en 001."
        )

    return ruc


# =========================================================
# VALIDAR TELEFONO
# =========================================================

def validar_telefono(telefono):
    """
    Valida teléfonos ecuatorianos.
    """

    pattern = r'^(09|02|03|04|05|06|07)[0-9]{7,8}$'

    if not re.match(pattern, telefono):
        raise ValidationError(
            "Número telefónico inválido."
        )

    return telefono


# =========================================================
# VALIDAR COORDENADAS
# =========================================================

def validar_latitud(latitud):
    """
    Valida coordenadas de latitud.
    """

    if latitud < -90 or latitud > 90:
        raise ValidationError(
            "Latitud fuera de rango."
        )

    return latitud


def validar_longitud(longitud):
    """
    Valida coordenadas de longitud.
    """

    if longitud < -180 or longitud > 180:
        raise ValidationError(
            "Longitud fuera de rango."
        )

    return longitud


# =========================================================
# VALIDAR EXTENSION IMAGEN
# =========================================================

def validar_extension_imagen(archivo):
    """
    Valida formatos permitidos.
    """

    extensiones_permitidas = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp'
    ]

    nombre = archivo.name.lower()

    if not any(nombre.endswith(ext) for ext in extensiones_permitidas):
        raise ValidationError(
            "Formato de imagen no permitido."
        )

    return archivo


# =========================================================
# VALIDAR PASSWORD SEGURA
# =========================================================

def validar_password_segura(password):
    """
    Reglas mínimas de seguridad.
    """

    if len(password) < 8:
        raise ValidationError(
            "La contraseña debe tener mínimo 8 caracteres."
        )

    if not re.search(r'[A-Z]', password):
        raise ValidationError(
            "Debe contener una letra mayúscula."
        )

    if not re.search(r'[a-z]', password):
        raise ValidationError(
            "Debe contener una letra minúscula."
        )

    if not re.search(r'[0-9]', password):
        raise ValidationError(
            "Debe contener un número."
        )

    return password
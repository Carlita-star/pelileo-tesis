"""
Validadores reutilizables para formularios administrativos.
"""

import re
from datetime import date, datetime
from typing import Any, Optional

from django.core.exceptions import ValidationError

# ---------------------------------------------------------------------------
# Patrones y listas de bloqueo
# ---------------------------------------------------------------------------

EMAIL_PATTERN = re.compile(
    r'^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$'
)
SLUG_PATTERN = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
HEX_COLOR_PATTERN = re.compile(r'^#[0-9A-Fa-f]{6}$')
URL_PATTERN = re.compile(r'^https?://[^\s/$.?#].[^\s]*$', re.IGNORECASE)

TEXT_NAME_PATTERN = re.compile(
    r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'\-]{2,49}$"
)
TEXT_CITY_PATTERN = re.compile(
    r"^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'\-]{2,59}$"
)
DIGITS_ONLY_PATTERN = re.compile(r'^\d+$')
PHONE_EC_PATTERN = re.compile(r'^(09\d{8}|0[2-7]\d{7,8})$')

BLOCKED_VALUES = {
    'test', 'prueba', 'xxxxx', 'aaaaaa', 'bbbbbb', 'cccccc',
    '123456', '1234567', '12345678', '000000', '111111', '222222',
    'asdf', 'qwerty', 'dummy', 'lorem', 'ipsum', 'nombre', 'apellido',
    'usuario', 'admin', 'sin nombre', 'n/a', 'na', 'xxx', 'yyy', 'zzz',
}


class FormValidationError(ValueError):
    """Error de validación con mapa de campos."""

    def __init__(self, errors: dict[str, str]):
        self.errors = errors
        first = next(iter(errors.values()), 'Datos inválidos.')
        super().__init__(first)


def _normalize(value: Any) -> str:
    if value is None:
        return ''
    return str(value).strip()


def es_texto_relleno(value: str) -> bool:
    """Detecta valores sin sentido o de prueba."""
    normalized = _normalize(value).lower()
    if not normalized:
        return False

    if normalized in BLOCKED_VALUES:
        return True

    compact = re.sub(r'\s+', '', normalized)
    if compact.isdigit() and len(compact) >= 4:
        return True

    if len(compact) >= 4 and len(set(compact)) == 1:
        return True

    if re.search(r'(.)\1{4,}', compact):
        return True

    return False


def validar_requerido(value: Any, label: str) -> str:
    if not _normalize(value):
        raise ValidationError(f'{label} es obligatorio.')
    return _normalize(value)


def validar_texto_nombre(
    value: Any,
    label: str = 'Nombre',
    *,
    min_len: int = 3,
    max_len: int = 50,
    required: bool = True,
) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if len(text) < min_len or len(text) > max_len:
        raise ValidationError(f'{label} debe tener entre {min_len} y {max_len} caracteres.')

    if not TEXT_NAME_PATTERN.match(text):
        raise ValidationError(
            f'{label} solo puede contener letras, espacios, guiones y apóstrofes.'
        )

    if es_texto_relleno(text):
        raise ValidationError(f'{label} no parece un valor válido. Ingresa un dato real.')

    return text


def validar_texto_ciudad(value: Any, label: str = 'Ciudad', *, required: bool = False) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if not TEXT_CITY_PATTERN.match(text):
        raise ValidationError(f'{label} solo puede contener letras y espacios.')

    if es_texto_relleno(text):
        raise ValidationError(f'{label} no parece un valor válido.')

    return text


def validar_descripcion(
    value: Any,
    label: str = 'Descripción',
    *,
    min_len: int = 20,
    max_len: int = 2000,
    required: bool = True,
) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatoria.')
        return None

    if len(text) < min_len or len(text) > max_len:
        raise ValidationError(f'{label} debe tener entre {min_len} y {max_len} caracteres.')

    if not re.search(r'[A-Za-zÁÉÍÓÚáéíóúÑñ]', text):
        raise ValidationError(f'{label} debe incluir al menos letras.')

    if es_texto_relleno(text):
        raise ValidationError(f'{label} no parece un texto válido.')

    return text


def validar_texto_libre(
    value: Any,
    label: str,
    *,
    min_len: int = 0,
    max_len: int = 255,
    required: bool = False,
) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if len(text) < min_len or len(text) > max_len:
        raise ValidationError(f'{label} debe tener entre {min_len} y {max_len} caracteres.')

    if es_texto_relleno(text):
        raise ValidationError(f'{label} no parece un valor válido.')

    return text


def validar_slug(value: Any, *, required: bool = True) -> Optional[str]:
    text = _normalize(value).lower()
    if not text:
        if required:
            raise ValidationError('El slug es obligatorio.')
        return None

    if len(text) < 3 or len(text) > 80:
        raise ValidationError('El slug debe tener entre 3 y 80 caracteres.')

    if not SLUG_PATTERN.match(text):
        raise ValidationError('El slug solo puede usar letras minúsculas, números y guiones.')

    if es_texto_relleno(text):
        raise ValidationError('El slug no es válido.')

    return text


def validar_email(value: Any, label: str = 'Correo electrónico', *, required: bool = False) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if not EMAIL_PATTERN.match(text):
        raise ValidationError(f'{label} debe tener un formato válido (ejemplo: usuario@dominio.com).')

    if es_texto_relleno(text.split('@')[0]):
        raise ValidationError(f'{label} no parece válido.')

    return text.lower()


def validar_telefono_ec(value: Any, label: str = 'Teléfono', *, required: bool = False) -> Optional[str]:
    text = re.sub(r'[\s\-()]', '', _normalize(value))
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if not DIGITS_ONLY_PATTERN.match(text):
        raise ValidationError(f'{label} solo puede contener números.')

    if not PHONE_EC_PATTERN.match(text):
        raise ValidationError(
            f'{label} inválido. Use formato ecuatoriano: 09XXXXXXXX o código de área 02-07.'
        )

    return text


def validar_entero(
    value: Any,
    label: str,
    *,
    min_value: Optional[int] = None,
    max_value: Optional[int] = None,
    required: bool = False,
) -> Optional[int]:
    if value is None or value == '':
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    text = _normalize(value)
    if not DIGITS_ONLY_PATTERN.match(text):
        raise ValidationError(f'{label} solo puede contener números enteros.')

    number = int(text)
    if min_value is not None and number < min_value:
        raise ValidationError(f'{label} no puede ser menor que {min_value}.')
    if max_value is not None and number > max_value:
        raise ValidationError(f'{label} no puede ser mayor que {max_value}.')

    return number


def validar_decimal(
    value: Any,
    label: str,
    *,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    required: bool = False,
) -> Optional[float]:
    if value is None or value == '':
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    text = _normalize(value).replace(',', '.')
    if not re.match(r'^-?\d+(\.\d+)?$', text):
        raise ValidationError(f'{label} debe ser un número válido (puede usar signo negativo y decimales).')

    number = float(text)
    if min_value is not None and number < min_value:
        raise ValidationError(f'{label} no puede ser menor que {min_value}.')
    if max_value is not None and number > max_value:
        raise ValidationError(f'{label} no puede ser mayor que {max_value}.')

    return number


def validar_latitud(value: Any, *, required: bool = False) -> Optional[float]:
    number = validar_decimal(value, 'Latitud', min_value=-90, max_value=90, required=required)
    return number


def validar_longitud(value: Any, *, required: bool = False) -> Optional[float]:
    number = validar_decimal(value, 'Longitud', min_value=-180, max_value=180, required=required)
    return number


def validar_url(value: Any, label: str = 'URL', *, required: bool = False) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatoria.')
        return None

    if not URL_PATTERN.match(text):
        raise ValidationError(f'{label} debe comenzar con http:// o https:// y tener formato válido.')

    return text


def validar_color_hex(value: Any, label: str = 'Color', *, required: bool = True) -> Optional[str]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatorio.')
        return None

    if not HEX_COLOR_PATTERN.match(text):
        raise ValidationError(f'{label} debe tener formato hexadecimal (#RRGGBB).')

    return text.upper()


def validar_fecha(value: Any, label: str = 'Fecha', *, required: bool = False) -> Optional[date]:
    text = _normalize(value)
    if not text:
        if required:
            raise ValidationError(f'{label} es obligatoria.')
        return None

    try:
        return datetime.strptime(text[:10], '%Y-%m-%d').date()
    except ValueError as exc:
        raise ValidationError(f'{label} no es una fecha válida (use AAAA-MM-DD).') from exc


def validar_id_requerido(value: Any, label: str) -> int:
    if value in (None, '', 0):
        raise ValidationError(f'{label} es obligatorio.')
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f'{label} no es válido.') from exc


def collect_errors(validators: list) -> dict[str, str]:
    """Ejecuta validadores (field_key, callable) y devuelve errores por campo."""
    errors: dict[str, str] = {}
    for field_key, validator in validators:
        try:
            validator()
        except ValidationError as exc:
            errors[field_key] = exc.messages[0] if hasattr(exc, 'messages') else str(exc)
    return errors

"""Construcción de URLs públicas para archivos en MEDIA_ROOT."""

from django.conf import settings


def build_media_url(path: str | None, request=None) -> str | None:
    """
    Convierte una ruta relativa de almacenamiento en URL absoluta accesible
    desde el navegador. En producción el frontend y la API suelen estar en
    dominios distintos, por lo que rutas como /media/... o multimedia/foo.jpg
    no funcionan sin el host de la API.
    """
    if not path:
        return None

    normalized = str(path).replace('\\', '/').strip()
    if not normalized:
        return None

    if normalized.startswith(('http://', 'https://')):
        return normalized

    clean = normalized.lstrip('/')
    if clean.startswith('media/'):
        media_path = f'/{clean}'
    else:
        media_path = f'{settings.MEDIA_URL.rstrip("/")}/{clean}'

    api_base = getattr(settings, 'API_PUBLIC_URL', '').rstrip('/')
    if api_base:
        return f'{api_base}{media_path}'

    if request is not None:
        return request.build_absolute_uri(media_path)

    return media_path

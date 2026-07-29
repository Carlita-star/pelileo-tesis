import traceback

from django.http import JsonResponse

from src.interfaces.api_rest.error_handlers import build_error_payload


class ApiErrorMiddleware:
    """Captura excepciones no controladas en rutas /api/ y devuelve JSON estructurado."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        if not request.path.startswith('/api/'):
            return None
        modulo = _modulo_desde_ruta(request.path)
        payload, status = build_error_payload(exception, request=request, modulo=modulo)
        return JsonResponse(payload, status=status)


def _modulo_desde_ruta(path: str) -> str:
    segmentos = [s for s in path.split('/') if s]
    if len(segmentos) >= 2 and segmentos[0] == 'api':
        if segmentos[1] == 'admin' and len(segmentos) >= 3:
            return segmentos[2]
        return segmentos[1]
    return 'general'

import json

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.services.error_log_service import ErrorLogService
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_errores_list(request):
    estado = request.GET.get('estado')
    tipo = request.GET.get('tipo')
    modulo = request.GET.get('modulo')
    try:
        limite = min(int(request.GET.get('limite', 100)), 500)
    except ValueError:
        limite = 100

    return JsonResponse({
        'resumen': ErrorLogService.resumen(),
        'results': ErrorLogService.listar(
            estado=estado,
            tipo=tipo,
            modulo=modulo,
            limite=limite,
        ),
    })


@require_http_methods(['PATCH', 'POST'])
@admin_panel_required
def admin_errores_cambiar_estado(request, error_id):
    try:
        payload = json.loads(request.body or '{}')
        estado = payload.get('estado')
        if not estado:
            return JsonResponse({'error': 'Debe indicar el campo estado.'}, status=400)
        ok = ErrorLogService.cambiar_estado(error_id, estado)
        if not ok:
            return JsonResponse({'error': 'No se encontró el registro de error.'}, status=404)
        return JsonResponse({'updated': True, 'estado': estado})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['POST'])
@admin_panel_required
def admin_errores_reportar_cliente(request):
    """Recibe errores capturados en el frontend."""
    try:
        payload = json.loads(request.body or '{}')
        mensaje = payload.get('mensaje_usuario') or payload.get('message')
        if not mensaje:
            return JsonResponse({'error': 'mensaje_usuario es requerido.'}, status=400)

        entry = ErrorLogService.registrar(
            mensaje_usuario=mensaje,
            modulo=payload.get('modulo', 'frontend'),
            tipo=payload.get('tipo', 'cliente'),
            http_status=payload.get('http_status'),
            ruta=payload.get('ruta', ''),
            metodo=payload.get('metodo', 'CLIENT'),
            mensaje_tecnico=payload.get('mensaje_tecnico', ''),
            stack_trace=payload.get('stack_trace', ''),
            usuario=getattr(request, 'jwt_user', None),
            metadata=payload.get('metadata'),
        )
        return JsonResponse({'id': entry.id}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)

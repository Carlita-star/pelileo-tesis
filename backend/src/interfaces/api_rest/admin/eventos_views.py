import json

from django.http import HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.dto.evento_dto import EventoCompleteDTO
from src.infrastructure.repositories.django_evento_admin_repository import DjangoEventoAdminRepository
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_eventos_list(request):
    try:
        search = request.GET.get('search')
        categoria_id = request.GET.get('categoria_id')
        estado_codigo = request.GET.get('estado', 'todos')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        categoria_id = int(categoria_id) if categoria_id else None
    except ValueError:
        return JsonResponse({'error': 'Parámetros inválidos.'}, status=400)

    data = DjangoEventoAdminRepository().listar_para_admin(
        search=search,
        categoria_id=categoria_id,
        estado_codigo=estado_codigo,
        page=page,
        page_size=page_size,
    )
    return JsonResponse(data)


@require_http_methods(['DELETE'])
@admin_panel_required
def admin_evento_delete(request, evento_id):
    success = DjangoEventoAdminRepository().eliminar_logico(
        evento_id,
        usuario_id=request.jwt_user.id,
    )
    if not success:
        return JsonResponse({'error': 'No se encontró el evento.'}, status=400)
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@admin_panel_required
def admin_evento_cambiar_estado(request, evento_id):
    try:
        payload = json.loads(request.body or '{}')
        estado_codigo = payload.get('estado_codigo')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    if not estado_codigo:
        return JsonResponse({'error': 'Debe especificar el estado.'}, status=400)

    success = DjangoEventoAdminRepository().cambiar_estado_publicacion(
        evento_id,
        estado_codigo,
        usuario_id=request.jwt_user.id,
    )
    if not success:
        return JsonResponse({'error': 'No se pudo cambiar el estado.'}, status=400)
    return JsonResponse({'updated': True})


@require_GET
@admin_panel_required
def admin_evento_form_data(request):
    return JsonResponse(DjangoEventoAdminRepository().obtener_datos_iniciales())


@require_GET
@admin_panel_required
def admin_evento_get_for_edit(request, evento_id):
    data = DjangoEventoAdminRepository().obtener_para_edicion(evento_id)
    if not data:
        return HttpResponseNotFound('Evento no encontrado.')
    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@admin_panel_required
def admin_evento_save(request, evento_id=None):
    try:
        payload = json.loads(request.body or '{}')
        dto = EventoCompleteDTO(
            id=evento_id,
            nombre=payload.get('nombre'),
            categoria_id=payload.get('categoria_id'),
            descripcion=payload.get('descripcion'),
            fecha_inicio=payload.get('fecha_inicio'),
            fecha_fin=payload.get('fecha_fin'),
            direccion=payload.get('direccion'),
            latitud=payload.get('latitud'),
            longitud=payload.get('longitud'),
            costo=payload.get('costo'),
            organizador=payload.get('organizador'),
            contacto=payload.get('contacto'),
            estado_publicacion_codigo=payload.get('estado_publicacion_codigo', 'borrador'),
        )
        result = DjangoEventoAdminRepository().guardar_completo(dto, request.jwt_user.id)
        return JsonResponse(result, status=201 if not evento_id else 200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    except Exception as exc:
        return JsonResponse({'error': f'Error al guardar: {exc}'}, status=400)

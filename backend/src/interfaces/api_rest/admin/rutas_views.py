import json

from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.dto.ruta_dto import RutaCompleteDTO, RutaGeneralDTO
from src.application.validators.admin_forms import validar_ruta_form
from src.domain.shared.field_validation import FormValidationError
from src.infrastructure.repositories.django_ruta_admin_repository import DjangoRutaAdminRepository
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_rutas_list(request):
    try:
        search = request.GET.get('search')
        estado_codigo = request.GET.get('estado', 'todos')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
    except ValueError:
        return HttpResponseBadRequest('Parámetros inválidos.')

    data = DjangoRutaAdminRepository().listar_para_admin(
        search=search,
        estado_codigo=estado_codigo,
        page=page,
        page_size=page_size,
    )
    return JsonResponse(data)


@require_http_methods(['DELETE'])
@admin_panel_required
def admin_ruta_delete(request, ruta_id):
    success = DjangoRutaAdminRepository().eliminar_logico(ruta_id)
    if not success:
        return HttpResponseBadRequest('No se encontró la ruta.')
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@admin_panel_required
def admin_ruta_cambiar_estado(request, ruta_id):
    try:
        payload = json.loads(request.body or '{}')
        estado_codigo = payload.get('estado_codigo')
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    if not estado_codigo:
        return HttpResponseBadRequest('Debe especificar el estado.')

    success = DjangoRutaAdminRepository().cambiar_estado_publicacion(ruta_id, estado_codigo)
    if not success:
        return HttpResponseBadRequest('No se pudo cambiar el estado.')
    return JsonResponse({'updated': True})


@require_GET
@admin_panel_required
def admin_ruta_form_data(request):
    return JsonResponse(DjangoRutaAdminRepository().obtener_datos_iniciales())


@require_GET
@admin_panel_required
def admin_ruta_get_for_edit(request, ruta_id):
    data = DjangoRutaAdminRepository().obtener_para_edicion(ruta_id)
    if not data:
        return HttpResponseNotFound('Ruta no encontrada.')
    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@admin_panel_required
def admin_ruta_save(request, ruta_id=None):
    try:
        payload = json.loads(request.body or '{}')
        general = payload.get('general', {})
        dto = RutaCompleteDTO(
            id=ruta_id,
            general=RutaGeneralDTO(
                nombre=general.get('nombre'),
                descripcion=general.get('descripcion'),
                distancia_km=general.get('distancia_km'),
                duracion_estimada=general.get('duracion_estimada'),
                dificultad=general.get('dificultad'),
                punto_inicio=general.get('punto_inicio'),
                punto_fin=general.get('punto_fin'),
                parroquia_id=general.get('parroquia_id'),
                parroquia_nombre=general.get('parroquia_nombre'),
            ),
            atractivos_orden=payload.get('atractivos_orden', []),
            geojson_ruta=payload.get('geojson_ruta'),
            estado_publicacion_codigo=payload.get('estado_publicacion_codigo', 'borrador'),
        )
        validar_ruta_form(
            dto,
            publicar=dto.estado_publicacion_codigo == 'publicado',
        )
        result = DjangoRutaAdminRepository().guardar_completo(dto, request.jwt_user.id)
        return JsonResponse(result, status=201 if not ruta_id else 200)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except FormValidationError as exc:
        return JsonResponse({'error': str(exc), 'errors': exc.errors}, status=400)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    except Exception as exc:
        return HttpResponseBadRequest(f'Error al guardar: {exc}')

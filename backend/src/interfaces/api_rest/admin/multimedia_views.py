import json

from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.domain.shared.media_urls import build_media_url
from src.infrastructure.repositories.django_multimedia_repository import DjangoMultimediaRepository
from src.interfaces.api_rest.auth_utils import admin_panel_required


def _serialize_media(item, request=None):
    return {
        'id': item.id,
        'entidad_tipo': item.entidad_tipo,
        'entidad_id': item.entidad_id,
        'archivo': item.archivo,
        'url': build_media_url(item.archivo, request),
        'titulo': item.titulo,
        'principal': item.principal,
        'orden': item.orden,
    }


@require_GET
@admin_panel_required
def multimedia_list(request):
    entidad_tipo = request.GET.get('entidad_tipo')
    entidad_id = request.GET.get('entidad_id')
    if not entidad_tipo or not entidad_id:
        return HttpResponseBadRequest('entidad_tipo y entidad_id son requeridos.')
    try:
        entidad_id = int(entidad_id)
    except ValueError:
        return HttpResponseBadRequest('entidad_id inválido.')

    repo = DjangoMultimediaRepository()
    items = repo.listar_por_entidad(entidad_tipo, entidad_id)
    return JsonResponse({'results': [_serialize_media(item, request) for item in items]})


@require_http_methods(['POST'])
@admin_panel_required
def multimedia_upload(request):
    entidad_tipo = request.POST.get('entidad_tipo')
    entidad_id = request.POST.get('entidad_id')
    uploaded = request.FILES.get('archivo')
    principal = request.POST.get('principal', 'false').lower() in ('true', '1', 'yes')

    if not entidad_tipo or not entidad_id or not uploaded:
        return HttpResponseBadRequest('entidad_tipo, entidad_id y archivo son requeridos.')

    try:
        entidad_id = int(entidad_id)
        item = DjangoMultimediaRepository().guardar_archivo_subido(
            entidad_tipo, entidad_id, uploaded, principal=principal
        )
        return JsonResponse(_serialize_media(item, request), status=201)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))


@require_http_methods(['POST'])
@admin_panel_required
def multimedia_set_principal(request, multimedia_id):
    success = DjangoMultimediaRepository().establecer_principal(multimedia_id)
    if not success:
        return HttpResponseBadRequest('No se encontró la imagen.')
    return JsonResponse({'updated': True})


@require_http_methods(['DELETE'])
@admin_panel_required
def multimedia_delete(request, multimedia_id):
    success = DjangoMultimediaRepository().eliminar_logico(multimedia_id)
    if not success:
        return HttpResponseBadRequest('No se encontró la imagen.')
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@admin_panel_required
def multimedia_reorder(request):
    try:
        payload = json.loads(request.body or '{}')
        entidad_tipo = payload.get('entidad_tipo')
        entidad_id = payload.get('entidad_id')
        orden_ids = payload.get('orden_ids', [])
        if not entidad_tipo or not entidad_id:
            return HttpResponseBadRequest('Datos incompletos.')
        DjangoMultimediaRepository().reordenar(entidad_tipo, int(entidad_id), orden_ids)
        return JsonResponse({'updated': True})
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')

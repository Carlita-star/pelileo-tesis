import json

from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.infrastructure.repositories.django_papelera_admin_repository import (
    DjangoPapeleraAdminRepository,
    TIPOS_PAPELERA,
)
from src.interfaces.api_rest.auth_utils import admin_panel_required, administrador_required


@require_GET
@admin_panel_required
def admin_papelera_list(request):
    tipo = request.GET.get('tipo', 'atractivos')
    search = request.GET.get('search')
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
    except ValueError:
        return HttpResponseBadRequest('Parámetros de paginación inválidos.')

    if tipo not in TIPOS_PAPELERA:
        return HttpResponseBadRequest('Tipo de entidad no válido.')

    data = DjangoPapeleraAdminRepository().listar(
        tipo=tipo,
        search=search,
        page=page,
        page_size=page_size,
    )
    return JsonResponse(data)


@require_http_methods(['POST'])
@admin_panel_required
def admin_papelera_restaurar(request, tipo, item_id):
    if tipo not in TIPOS_PAPELERA:
        return HttpResponseBadRequest('Tipo de entidad no válido.')

    success = DjangoPapeleraAdminRepository().restaurar(tipo, item_id)
    if not success:
        return HttpResponseBadRequest('No se encontró el registro en la papelera.')
    return JsonResponse({'restored': True})


@require_http_methods(['DELETE'])
@administrador_required
def admin_papelera_eliminar_permanente(request, tipo, item_id):
    if tipo not in TIPOS_PAPELERA:
        return HttpResponseBadRequest('Tipo de entidad no válido.')

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        payload = {}

    confirmacion = payload.get('confirmacion', '')
    if confirmacion != 'ELIMINAR PERMANENTEMENTE':
        return HttpResponseBadRequest(
            'Debe enviar confirmacion: "ELIMINAR PERMANENTEMENTE" para borrar definitivamente.'
        )

    success = DjangoPapeleraAdminRepository().eliminar_permanente(tipo, item_id)
    if not success:
        return HttpResponseBadRequest('No se encontró el registro en la papelera.')
    return JsonResponse({'deleted_permanently': True})

import json

from django.http import HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.dto.catalogo_dto import CatalogoItemDTO
from src.infrastructure.repositories.django_catalogo_admin_repository import (
    DjangoCatalogoAdminRepository,
    TIPOS_VALIDOS,
)
from src.interfaces.api_rest.auth_utils import admin_panel_required


def _validar_tipo(tipo: str):
    if tipo not in TIPOS_VALIDOS:
        return JsonResponse({'error': 'Tipo de catálogo no válido.'}, status=400)
    return None


@require_GET
@admin_panel_required
def admin_catalogo_list(request, tipo):
    err = _validar_tipo(tipo)
    if err:
        return err

    search = request.GET.get('search') or None
    estado = request.GET.get('estado', 'todos')
    data = DjangoCatalogoAdminRepository().listar(tipo, search=search, estado=estado)
    return JsonResponse(data)


@require_GET
@admin_panel_required
def admin_catalogo_get(request, tipo, item_id):
    err = _validar_tipo(tipo)
    if err:
        return err

    data = DjangoCatalogoAdminRepository().obtener(tipo, item_id)
    if not data:
        return HttpResponseNotFound('Registro no encontrado.')
    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@admin_panel_required
def admin_catalogo_save(request, tipo, item_id=None):
    err = _validar_tipo(tipo)
    if err:
        return err

    try:
        payload = json.loads(request.body or '{}')
        dto = CatalogoItemDTO(
            tipo=tipo,
            id=item_id,
            nombre=payload.get('nombre'),
            descripcion=payload.get('descripcion'),
            icono=payload.get('icono'),
            activo=payload.get('activo', True),
        )
        result = DjangoCatalogoAdminRepository().guardar(dto)
        return JsonResponse(result, status=201 if not item_id else 200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['POST'])
@admin_panel_required
def admin_catalogo_cambiar_estado(request, tipo, item_id):
    err = _validar_tipo(tipo)
    if err:
        return err

    try:
        payload = json.loads(request.body or '{}')
        activo = payload.get('activo')
        if activo is None:
            return JsonResponse({'error': 'Debe especificar el estado activo.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)

    success = DjangoCatalogoAdminRepository().cambiar_activo(tipo, item_id, bool(activo))
    if not success:
        return JsonResponse({'error': 'Registro no encontrado.'}, status=404)
    return JsonResponse({'updated': True, 'activo': bool(activo)})

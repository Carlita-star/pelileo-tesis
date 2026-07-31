import json

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.infrastructure.repositories.django_configuracion_admin_repository import (
    DjangoConfiguracionAdminRepository,
    IMAGEN_TIPOS,
)
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_configuracion_get(request):
    data = DjangoConfiguracionAdminRepository().obtener_completo()
    return JsonResponse(data)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_gad(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_datos_gad(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_apariencia(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_apariencia(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_redes(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_redes(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_sobre_pelileo(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_sobre_pelileo(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_autoridades(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_autoridades(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_guias(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_guias(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_header_footer(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_header_footer(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_menu(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_menu(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@admin_panel_required
def admin_configuracion_guardar_mapa(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoConfiguracionAdminRepository().guardar_mapa(payload, request.jwt_user.id)
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['POST'])
@admin_panel_required
def admin_configuracion_subir_imagen(request):
    tipo = request.POST.get('tipo')
    archivo = request.FILES.get('archivo')
    autoridad_id_raw = request.POST.get('autoridad_id')
    guia_id_raw = request.POST.get('guia_id')
    autoridad_id = None
    guia_id = None
    if autoridad_id_raw:
        try:
            autoridad_id = int(autoridad_id_raw)
        except (TypeError, ValueError):
            return JsonResponse({'error': 'autoridad_id inválido.'}, status=400)
    if guia_id_raw:
        try:
            guia_id = int(guia_id_raw)
        except (TypeError, ValueError):
            return JsonResponse({'error': 'guia_id inválido.'}, status=400)
    if tipo not in IMAGEN_TIPOS:
        return JsonResponse({'error': 'Tipo de imagen no válido.'}, status=400)
    try:
        result = DjangoConfiguracionAdminRepository().guardar_imagen(
            tipo,
            archivo,
            request.jwt_user.id,
            autoridad_id=autoridad_id,
            guia_id=guia_id,
        )
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)

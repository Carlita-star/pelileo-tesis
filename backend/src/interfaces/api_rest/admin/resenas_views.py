import json

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.domain.resenas.admin_service import listar_admin, resumen_admin
from src.domain.resenas.helpers import tipos_entidad_validos
from src.domain.resenas.models import Resena
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_resenas_list(request):
    entidad_tipo = (request.GET.get('entidad_tipo') or '').strip().lower() or None
    if entidad_tipo and entidad_tipo not in tipos_entidad_validos():
        return JsonResponse({'error': 'entidad_tipo inválido.'}, status=400)

    calificacion = request.GET.get('calificacion')
    if calificacion:
        try:
            calificacion = int(calificacion)
            if calificacion < 1 or calificacion > 5:
                raise ValueError
        except (TypeError, ValueError):
            return JsonResponse({'error': 'calificacion inválida.'}, status=400)
    else:
        calificacion = None

    activo_raw = request.GET.get('activo')
    activo = None
    if activo_raw is not None and activo_raw != '':
        activo = activo_raw.lower() in ('1', 'true', 'si', 'sí', 'yes')

    busqueda = request.GET.get('q') or request.GET.get('busqueda') or ''

    try:
        limite = min(int(request.GET.get('limite', 100)), 500)
    except ValueError:
        limite = 100

    return JsonResponse({
        'resumen': resumen_admin(),
        'results': listar_admin(
            entidad_tipo=entidad_tipo,
            calificacion=calificacion,
            activo=activo,
            busqueda=busqueda,
            limite=limite,
        ),
    })


@require_http_methods(['PATCH', 'POST'])
@admin_panel_required
def admin_resenas_cambiar_activo(request, resena_id):
    try:
        resena_id = int(resena_id)
    except (TypeError, ValueError):
        return JsonResponse({'error': 'ID de reseña inválido.'}, status=400)

    try:
        payload = json.loads(request.body or '{}')
        activo = payload.get('activo')
        if activo is None:
            return JsonResponse({'error': 'Debe indicar el campo activo.'}, status=400)
        activo = bool(activo)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)

    actualizado = Resena.objects.filter(pk=resena_id).update(activo=activo)
    if not actualizado:
        return JsonResponse({'error': 'Reseña no encontrada.'}, status=404)

    return JsonResponse({'updated': True, 'activo': activo})

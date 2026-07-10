import json

from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_GET, require_http_methods

from src.domain.resenas.helpers import (
    entidad_publicada,
    stats_entidad,
    tipos_entidad_validos,
)
from src.domain.resenas.models import Resena
from src.interfaces.api_rest.auth_utils import get_user_from_request, jwt_required


def _serializar_resena(resena):
    nombre = resena.usuario.nombre_completo or resena.usuario.username
    return {
        'id': resena.id,
        'calificacion': resena.calificacion,
        'comentario': resena.comentario,
        'creado_en': resena.creado_en.isoformat() if resena.creado_en else None,
        'actualizado_en': resena.actualizado_en.isoformat() if resena.actualizado_en else None,
        'usuario': {
            'id': resena.usuario_id,
            'nombre': nombre.strip() or 'Visitante',
        },
    }


def _parse_entidad(request):
    entidad_tipo = (request.GET.get('entidad_tipo') or '').strip().lower()
    entidad_id_raw = request.GET.get('entidad_id')

    if entidad_tipo not in tipos_entidad_validos():
        raise ValueError('entidad_tipo inválido.')

    try:
        entidad_id = int(entidad_id_raw)
    except (TypeError, ValueError):
        raise ValueError('entidad_id inválido.')

    if entidad_id <= 0:
        raise ValueError('entidad_id inválido.')

    return entidad_tipo, entidad_id


def _validar_payload(payload):
    entidad_tipo = (payload.get('entidad_tipo') or '').strip().lower()
    if entidad_tipo not in tipos_entidad_validos():
        raise ValueError('entidad_tipo inválido.')

    try:
        entidad_id = int(payload.get('entidad_id'))
    except (TypeError, ValueError):
        raise ValueError('entidad_id inválido.')

    if entidad_id <= 0:
        raise ValueError('entidad_id inválido.')

    try:
        calificacion = int(payload.get('calificacion'))
    except (TypeError, ValueError):
        raise ValueError('La calificación debe ser un número entre 1 y 5.')

    if calificacion < 1 or calificacion > 5:
        raise ValueError('La calificación debe estar entre 1 y 5.')

    comentario = (payload.get('comentario') or '').strip()
    if len(comentario) > 2000:
        raise ValueError('El comentario no puede superar 2000 caracteres.')

    return entidad_tipo, entidad_id, calificacion, comentario


@require_GET
def resenas_list(request):
    try:
        entidad_tipo, entidad_id = _parse_entidad(request)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))

    if not entidad_publicada(entidad_tipo, entidad_id):
        return JsonResponse({'error': 'Entidad no encontrada o no publicada.'}, status=404)

    usuario = get_user_from_request(request)
    mi_resena = None
    if usuario:
        propia = Resena.objects.filter(
            usuario=usuario,
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            activo=True,
        ).select_related('usuario').first()
        if propia:
            mi_resena = _serializar_resena(propia)

    # Portal público: solo la reseña propia; el listado completo es vía panel admin.
    return JsonResponse({
        'results': [],
        'resumen': stats_entidad(entidad_tipo, entidad_id),
        'mi_resena': mi_resena,
    })


@require_http_methods(['POST'])
@jwt_required
def resenas_create(request):
    try:
        payload = json.loads(request.body or '{}')
        entidad_tipo, entidad_id, calificacion, comentario = _validar_payload(payload)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))

    if not entidad_publicada(entidad_tipo, entidad_id):
        return JsonResponse({'error': 'Entidad no encontrada o no publicada.'}, status=404)

    if Resena.objects.filter(
        usuario=request.jwt_user,
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
    ).exists():
        return JsonResponse({'error': 'Ya publicaste una reseña para este lugar. Puedes editarla.'}, status=400)

    resena = Resena.objects.create(
        usuario=request.jwt_user,
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
        calificacion=calificacion,
        comentario=comentario,
    )
    resena = Resena.objects.select_related('usuario').get(pk=resena.pk)

    return JsonResponse({
        'resena': _serializar_resena(resena),
        'resumen': stats_entidad(entidad_tipo, entidad_id),
    }, status=201)


@require_http_methods(['PUT'])
@jwt_required
def resenas_update(request, resena_id):
    try:
        resena_id = int(resena_id)
    except (TypeError, ValueError):
        return HttpResponseBadRequest('ID de reseña inválido.')

    resena = Resena.objects.filter(pk=resena_id, activo=True).select_related('usuario').first()
    if not resena:
        return JsonResponse({'error': 'Reseña no encontrada.'}, status=404)

    if resena.usuario_id != request.jwt_user.id:
        return JsonResponse({'error': 'No puedes editar esta reseña.'}, status=403)

    try:
        payload = json.loads(request.body or '{}')
        calificacion = int(payload.get('calificacion', resena.calificacion))
        comentario = (payload.get('comentario') if 'comentario' in payload else resena.comentario) or ''
        comentario = comentario.strip()
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except (TypeError, ValueError):
        return HttpResponseBadRequest('La calificación debe ser un número entre 1 y 5.')

    if calificacion < 1 or calificacion > 5:
        return HttpResponseBadRequest('La calificación debe estar entre 1 y 5.')
    if len(comentario) > 2000:
        return HttpResponseBadRequest('El comentario no puede superar 2000 caracteres.')

    resena.calificacion = calificacion
    resena.comentario = comentario
    resena.save(update_fields=['calificacion', 'comentario', 'actualizado_en'])

    return JsonResponse({
        'resena': _serializar_resena(resena),
        'resumen': stats_entidad(resena.entidad_tipo, resena.entidad_id),
    })

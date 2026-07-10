import json

from django.http import HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.infrastructure.repositories.django_usuario_perfil_repository import DjangoUsuarioPerfilRepository
from src.interfaces.api_rest.auth_utils import jwt_required


@require_GET
@jwt_required
def admin_perfil_get(request):
    data = DjangoUsuarioPerfilRepository().obtener_perfil(request.jwt_user.id)
    if not data:
        return HttpResponseNotFound('Usuario no encontrado.')
    return JsonResponse(data)


@require_http_methods(['PUT'])
@jwt_required
def admin_perfil_actualizar(request):
    try:
        payload = json.loads(request.body or '{}')
        data = DjangoUsuarioPerfilRepository().actualizar_perfil(
            request.jwt_user.id,
            nombres=payload.get('nombres'),
            apellidos=payload.get('apellidos'),
            telefono=payload.get('telefono'),
        )
        return JsonResponse(data)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['PUT'])
@jwt_required
def admin_perfil_cambiar_password(request):
    try:
        payload = json.loads(request.body or '{}')
        DjangoUsuarioPerfilRepository().cambiar_password(
            request.jwt_user.id,
            password_actual=payload.get('password_actual'),
            password_nueva=payload.get('password_nueva'),
            password_confirmacion=payload.get('password_confirmacion'),
        )
        return JsonResponse({'message': 'Contraseña actualizada correctamente.'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['POST'])
@jwt_required
def admin_perfil_foto(request):
    archivo = request.FILES.get('foto')
    if not archivo:
        return JsonResponse({'error': 'Debe enviar el archivo en el campo "foto".'}, status=400)
    try:
        result = DjangoUsuarioPerfilRepository().guardar_foto_perfil(request.jwt_user.id, archivo)
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)

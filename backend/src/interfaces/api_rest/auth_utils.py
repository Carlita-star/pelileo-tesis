from functools import wraps

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from src.application.services.jwt_service import JwtService
from src.domain.usuarios.models import Usuario

ADMIN_PANEL_ROLES = {'administrador', 'gestor_turistico'}
ADMIN_ONLY_ROLES = {'administrador'}


def normalize_role_name(role_name: str) -> str:
    return (role_name or '').strip().lower().replace(' ', '_')


def get_user_roles(user) -> list:
    if not user:
        return []
    return list(
        user.usuario_roles.values_list('rol__nombre', flat=True)
    )


def user_has_panel_access(user) -> bool:
    roles = {normalize_role_name(role) for role in get_user_roles(user)}
    return bool(roles & ADMIN_PANEL_ROLES)


def user_is_administrador(user) -> bool:
    roles = {normalize_role_name(role) for role in get_user_roles(user)}
    return 'administrador' in roles


def get_user_from_request(request):
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
        if not token:
            return None
        try:
            payload = JwtService(settings.SECRET_KEY).decode_token(token)
            user_id = payload.get('sub')
            if not user_id:
                return None
            return Usuario.objects.filter(
                id=user_id,
                activo=True,
                eliminado_en__isnull=True,
            ).prefetch_related('usuario_roles__rol').first()
        except ValueError:
            return None

    if request.user.is_authenticated:
        return request.user

    return None


def jwt_required(view_func):
    @csrf_exempt
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({'error': 'Usuario no autenticado.'}, status=401)
        request.jwt_user = user
        return view_func(request, *args, **kwargs)

    return wrapper


def admin_panel_required(view_func):
    @csrf_exempt
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({'error': 'Usuario no autenticado.'}, status=401)
        if not user_has_panel_access(user):
            return JsonResponse(
                {'error': 'No tienes permisos para acceder al panel administrativo.'},
                status=403,
            )
        request.jwt_user = user
        return view_func(request, *args, **kwargs)

    return wrapper


def administrador_required(view_func):
    @csrf_exempt
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = get_user_from_request(request)
        if not user:
            return JsonResponse({'error': 'Usuario no autenticado.'}, status=401)
        if not user_is_administrador(user):
            return JsonResponse(
                {'error': 'Solo el administrador puede acceder a esta sección.'},
                status=403,
            )
        request.jwt_user = user
        return view_func(request, *args, **kwargs)

    return wrapper

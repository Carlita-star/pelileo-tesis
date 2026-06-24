import json

from django.http import HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.dto.usuario_admin_dto import UsuarioAdminDTO
from src.infrastructure.repositories.django_usuario_admin_repository import DjangoUsuarioAdminRepository
from src.interfaces.api_rest.auth_utils import administrador_required


@require_GET
@administrador_required
def admin_usuarios_list(request):
    try:
        search = request.GET.get('search')
        rol_id = request.GET.get('rol_id')
        estado = request.GET.get('estado', 'todos')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        rol_id = int(rol_id) if rol_id else None
    except ValueError:
        return JsonResponse({'error': 'Parámetros inválidos.'}, status=400)

    data = DjangoUsuarioAdminRepository().listar_para_admin(
        search=search,
        rol_id=rol_id,
        estado=estado,
        page=page,
        page_size=page_size,
    )
    return JsonResponse(data)


@require_GET
@administrador_required
def admin_usuario_form_data(request):
    return JsonResponse(DjangoUsuarioAdminRepository().obtener_datos_iniciales())


@require_GET
@administrador_required
def admin_usuario_get_for_edit(request, usuario_id):
    data = DjangoUsuarioAdminRepository().obtener_para_edicion(usuario_id)
    if not data:
        return HttpResponseNotFound('Usuario no encontrado.')
    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@administrador_required
def admin_usuario_save(request, usuario_id=None):
    try:
        payload = json.loads(request.body or '{}')
        dto = UsuarioAdminDTO(
            id=usuario_id,
            nombres=payload.get('nombres'),
            apellidos=payload.get('apellidos'),
            username=payload.get('username'),
            email=payload.get('email'),
            telefono=payload.get('telefono'),
            foto_perfil=payload.get('foto_perfil'),
            password=payload.get('password'),
            rol_ids=payload.get('rol_ids') or [],
            activo=payload.get('activo', True),
        )
        result = DjangoUsuarioAdminRepository().guardar_completo(dto, request.jwt_user.id)
        return JsonResponse(result, status=201 if not usuario_id else 200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_http_methods(['POST'])
@administrador_required
def admin_usuario_cambiar_estado(request, usuario_id):
    try:
        payload = json.loads(request.body or '{}')
        activo = payload.get('activo')
        if activo is None:
            return JsonResponse({'error': 'Debe especificar el estado activo.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)

    if usuario_id == request.jwt_user.id and not activo:
        return JsonResponse({'error': 'No puede desactivar su propio usuario.'}, status=400)

    success = DjangoUsuarioAdminRepository().cambiar_activo(
        usuario_id, bool(activo), request.jwt_user.id
    )
    if not success:
        return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)
    return JsonResponse({'updated': True, 'activo': bool(activo)})


@require_http_methods(['DELETE'])
@administrador_required
def admin_usuario_delete(request, usuario_id):
    if usuario_id == request.jwt_user.id:
        return JsonResponse({'error': 'No puede eliminar su propio usuario.'}, status=400)

    success = DjangoUsuarioAdminRepository().eliminar_logico(usuario_id, request.jwt_user.id)
    if not success:
        return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@administrador_required
def admin_usuario_foto(request, usuario_id):
    archivo = request.FILES.get('foto')
    if not archivo:
        return JsonResponse({'error': 'Debe enviar el archivo en el campo "foto".'}, status=400)
    try:
        result = DjangoUsuarioAdminRepository().guardar_foto_perfil(usuario_id, archivo)
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)

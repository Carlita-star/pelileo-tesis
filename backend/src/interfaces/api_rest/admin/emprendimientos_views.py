import json

from django.http import HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.application.dto.emprendimiento_dto import (
    EmprendimientoCompleteDTO,
    EmprendimientoGeneralDTO,
    EmprendimientoUbicacionDTO,
)
from src.application.validators.admin_forms import validar_emprendimiento_form
from src.domain.shared.field_validation import FormValidationError
from src.infrastructure.repositories.django_emprendimiento_admin_repository import (
    DjangoEmprendimientoAdminRepository,
)
from src.interfaces.api_rest.auth_utils import admin_panel_required


@require_GET
@admin_panel_required
def admin_emprendimientos_list(request):
    try:
        search = request.GET.get('search')
        parroquia_id = request.GET.get('parroquia_id')
        estado_codigo = request.GET.get('estado', 'todos')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        parroquia_id = int(parroquia_id) if parroquia_id else None
    except ValueError:
        return HttpResponseBadRequest('Parámetros inválidos.')

    data = DjangoEmprendimientoAdminRepository().listar_para_admin(
        search=search,
        parroquia_id=parroquia_id,
        estado_codigo=estado_codigo,
        page=page,
        page_size=page_size,
    )
    return JsonResponse(data)


@require_http_methods(['DELETE'])
@admin_panel_required
def admin_emprendimiento_delete(request, emprendimiento_id):
    success = DjangoEmprendimientoAdminRepository().eliminar_logico(emprendimiento_id)
    if not success:
        return HttpResponseBadRequest('No se encontró el emprendimiento.')
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@admin_panel_required
def admin_emprendimiento_cambiar_estado(request, emprendimiento_id):
    try:
        payload = json.loads(request.body or '{}')
        estado_codigo = payload.get('estado_codigo')
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    if not estado_codigo:
        return HttpResponseBadRequest('Debe especificar el estado.')

    success = DjangoEmprendimientoAdminRepository().cambiar_estado_publicacion(
        emprendimiento_id, estado_codigo
    )
    if not success:
        return HttpResponseBadRequest('No se pudo cambiar el estado.')
    return JsonResponse({'updated': True})


@require_GET
@admin_panel_required
def admin_emprendimiento_form_data(request):
    return JsonResponse(DjangoEmprendimientoAdminRepository().obtener_datos_iniciales())


@require_GET
@admin_panel_required
def admin_emprendimiento_get_for_edit(request, emprendimiento_id):
    data = DjangoEmprendimientoAdminRepository().obtener_para_edicion(emprendimiento_id)
    if not data:
        return HttpResponseNotFound('Emprendimiento no encontrado.')
    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@admin_panel_required
def admin_emprendimiento_save(request, emprendimiento_id=None):
    try:
        payload = json.loads(request.body or '{}')
        general = payload.get('general', {})
        ubicacion = payload.get('ubicacion', {})
        dto = EmprendimientoCompleteDTO(
            id=emprendimiento_id,
            general=EmprendimientoGeneralDTO(
                nombre=general.get('nombre'),
                descripcion=general.get('descripcion'),
                direccion=general.get('direccion'),
                telefono=general.get('telefono'),
                email=general.get('email'),
                sitio_web=general.get('sitio_web'),
                horario=general.get('horario'),
                parroquia_id=general.get('parroquia_id'),
                parroquia_nombre=general.get('parroquia_nombre'),
                categoria_id=general.get('categoria_id'),
                categoria_nombre=general.get('categoria_nombre'),
            ),
            ubicacion=EmprendimientoUbicacionDTO(
                latitud=ubicacion.get('latitud'),
                longitud=ubicacion.get('longitud'),
                altitud=ubicacion.get('altitud'),
            ),
            servicios_ids=payload.get('servicios_ids', []),
            redes_sociales=payload.get('redes_sociales', []),
            relaciones=payload.get('relaciones', []),
            estado_publicacion_codigo=payload.get('estado_publicacion_codigo', 'borrador'),
        )
        validar_emprendimiento_form(
            dto,
            publicar=dto.estado_publicacion_codigo == 'publicado',
        )
        result = DjangoEmprendimientoAdminRepository().guardar_completo(dto, request.jwt_user.id)
        return JsonResponse(result, status=201 if not emprendimiento_id else 200)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except FormValidationError as exc:
        return JsonResponse({'error': str(exc), 'errors': exc.errors}, status=400)
    except ValueError as exc:
        return HttpResponseBadRequest(str(exc))
    except Exception as exc:
        return HttpResponseBadRequest(f'Error al guardar: {exc}')

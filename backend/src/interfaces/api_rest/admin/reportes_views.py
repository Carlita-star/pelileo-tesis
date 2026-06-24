import json
import mimetypes
import os

from django.http import FileResponse, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET, require_http_methods

from src.infrastructure.repositories.django_reporte_admin_repository import DjangoReporteAdminRepository
from src.interfaces.api_rest.auth_utils import administrador_required


@require_GET
@administrador_required
def admin_reportes_list(request):
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
    except ValueError:
        return JsonResponse({'error': 'Parámetros inválidos.'}, status=400)

    repo = DjangoReporteAdminRepository()
    data = repo.listar_historial(page=page, page_size=page_size)
    data['filtros'] = repo.obtener_filtros()
    return JsonResponse(data)


@require_GET
@administrador_required
def admin_reportes_filtros(request):
    return JsonResponse(DjangoReporteAdminRepository().obtener_filtros())


@require_http_methods(['POST'])
@administrador_required
def admin_reporte_generar(request):
    try:
        payload = json.loads(request.body or '{}')
        tipo = payload.get('tipo_reporte')
        formato = payload.get('formato')
        filtros = payload.get('filtros') or {}
        result = DjangoReporteAdminRepository().generar(
            tipo_reporte=tipo,
            formato=formato,
            filtros=filtros,
            usuario_id=request.jwt_user.id,
        )
        return JsonResponse(result, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)


@require_GET
@administrador_required
def admin_reporte_descargar(request, reporte_id):
    filepath = DjangoReporteAdminRepository().obtener_ruta_archivo(reporte_id)
    if not filepath:
        return HttpResponseNotFound('Archivo no encontrado.')

    content_type, _ = mimetypes.guess_type(filepath)
    if not content_type:
        content_type = 'application/octet-stream'

    response = FileResponse(open(filepath, 'rb'), content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(filepath)}"'
    return response

from io import BytesIO

from django.http import FileResponse, JsonResponse
from django.views.decorators.http import require_GET

from src.application.services.ficha_registro_service import FichaRegistroService, TIPOS_FICHA
from src.interfaces.api_rest.auth_utils import admin_panel_required


def _descargar_ficha(request, tipo: str, entity_id: int):
    formato = (request.GET.get('formato') or 'pdf').lower()
    try:
        content, filename, content_type = FichaRegistroService().generar(tipo, entity_id, formato)
    except ValueError as exc:
        msg = str(exc)
        status = 404 if 'no encontrad' in msg.lower() else 400
        return JsonResponse({'error': msg}, status=status)

    response = FileResponse(
        BytesIO(content),
        content_type=content_type,
        as_attachment=True,
        filename=filename,
    )
    return response


@require_GET
@admin_panel_required
def admin_atractivo_ficha_descargar(request, atractivo_id):
    return _descargar_ficha(request, 'atractivo', atractivo_id)


@require_GET
@admin_panel_required
def admin_ruta_ficha_descargar(request, ruta_id):
    return _descargar_ficha(request, 'ruta', ruta_id)


@require_GET
@admin_panel_required
def admin_emprendimiento_ficha_descargar(request, emprendimiento_id):
    return _descargar_ficha(request, 'emprendimiento', emprendimiento_id)


@require_GET
@admin_panel_required
def admin_evento_ficha_descargar(request, evento_id):
    return _descargar_ficha(request, 'evento', evento_id)

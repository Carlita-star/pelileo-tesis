"""
Manejo centralizado de errores para la API REST.
"""

import json
import traceback
from functools import wraps

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import DatabaseError, IntegrityError, OperationalError
from django.http import JsonResponse

from src.application.services.error_log_service import ErrorLogService
from src.domain.shared.field_validation import FormValidationError


def _client_ip(request) -> str:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def clasificar_excepcion(exc: Exception) -> tuple[str, str, int]:
    """Retorna (tipo, mensaje_usuario, http_status)."""
    if isinstance(exc, FormValidationError):
        return 'validacion', str(exc), 400

    if isinstance(exc, DjangoValidationError):
        msg = exc.messages[0] if getattr(exc, 'messages', None) else str(exc)
        return 'validacion', msg, 400

    if isinstance(exc, ValueError):
        return 'validacion', str(exc), 400

    if isinstance(exc, IntegrityError):
        texto = str(exc).lower()
        if 'unique' in texto or 'duplicate' in texto:
            return (
                'base_datos',
                'Ya existe un registro con esos datos. Verifique que no esté duplicado.',
                400,
            )
        if 'foreign key' in texto or 'violates foreign key' in texto:
            return (
                'base_datos',
                'No se puede completar la operación porque hay datos relacionados que no existen o están en uso.',
                400,
            )
        return 'base_datos', 'Error de integridad en la base de datos. Revise los datos ingresados.', 400

    if isinstance(exc, OperationalError):
        return (
            'base_datos',
            'No se pudo conectar con la base de datos. Intente de nuevo en unos minutos.',
            503,
        )

    if isinstance(exc, DatabaseError):
        return 'base_datos', 'Ocurrió un error al guardar la información en la base de datos.', 500

    if isinstance(exc, PermissionError):
        return 'permiso', 'No tiene permisos para realizar esta acción.', 403

    if isinstance(exc, FileNotFoundError):
        return 'archivo', 'No se encontró el archivo solicitado.', 404

    return 'servidor', 'Ocurrió un error interno en el servidor. El equipo técnico fue notificado.', 500


def build_error_payload(
    exc: Exception,
    *,
    request=None,
    modulo: str = 'general',
    log: bool = True,
    extra_user_message: str | None = None,
) -> tuple[dict, int]:
    tipo, mensaje, status = clasificar_excepcion(exc)
    if extra_user_message:
        mensaje = extra_user_message

    payload = {
        'error': mensaje,
        'tipo': tipo,
        'codigo_http': status,
        'modulo': modulo,
    }

    if isinstance(exc, FormValidationError):
        payload['errors'] = exc.errors

    if request and getattr(request, 'jwt_user', None):
        roles = []
        user = request.jwt_user
        if hasattr(user, 'usuario_roles'):
            roles = list(user.usuario_roles.values_list('rol__nombre', flat=True))
        if 'administrador' in roles or __debug_show_technical(request):
            payload['detalle_tecnico'] = str(exc)
            if status >= 500:
                payload['stack_trace'] = traceback.format_exc()

    if log:
        ErrorLogService.registrar(
            mensaje_usuario=mensaje,
            modulo=modulo,
            tipo=tipo,
            http_status=status,
            ruta=getattr(request, 'path', '') if request else '',
            metodo=getattr(request, 'method', '') if request else '',
            mensaje_tecnico=str(exc),
            stack_trace=traceback.format_exc() if status >= 500 else '',
            usuario=getattr(request, 'jwt_user', None) if request else None,
            ip_address=_client_ip(request) if request else '',
            user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
            metadata={'errors': payload.get('errors')} if payload.get('errors') else None,
        )

    return payload, status


def json_error_response(exc: Exception, *, request=None, modulo: str = 'general') -> JsonResponse:
    payload, status = build_error_payload(exc, request=request, modulo=modulo)
    return JsonResponse(payload, status=status)


def __debug_show_technical(request) -> bool:
    from django.conf import settings
    return settings.DEBUG


def api_error_handler(modulo: str = 'general'):
    """Decorador para vistas API que captura y registra errores."""

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            try:
                return view_func(request, *args, **kwargs)
            except json.JSONDecodeError:
                exc = ValueError('El formato JSON de la solicitud no es válido.')
                return json_error_response(exc, request=request, modulo=modulo)
            except Exception as exc:
                return json_error_response(exc, request=request, modulo=modulo)

        return wrapper

    return decorator

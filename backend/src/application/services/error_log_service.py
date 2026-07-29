"""
Servicio de bitácora de errores del sistema.
"""

import traceback
from typing import Any, Optional

from django.db.models import Count

from src.domain.errores.models import ErrorLog


class ErrorLogService:
    @staticmethod
    def registrar(
        *,
        mensaje_usuario: str,
        modulo: str = 'general',
        tipo: str = 'desconocido',
        http_status: Optional[int] = None,
        ruta: str = '',
        metodo: str = '',
        mensaje_tecnico: str = '',
        stack_trace: str = '',
        usuario=None,
        ip_address: str = '',
        user_agent: str = '',
        metadata: Optional[dict] = None,
        log_console: bool = True,
    ) -> ErrorLog:
        nombre_usuario = ''
        if usuario:
            nombre_usuario = (
                getattr(usuario, 'nombre_completo', None)
                or f'{getattr(usuario, "nombres", "")} {getattr(usuario, "apellidos", "")}'.strip()
                or getattr(usuario, 'username', '')
            )

        entry = ErrorLog.objects.create(
            usuario=usuario if getattr(usuario, 'id', None) else None,
            nombre_usuario=nombre_usuario,
            modulo=modulo,
            tipo=tipo,
            http_status=http_status,
            ruta=ruta[:500],
            metodo=metodo[:10],
            mensaje_usuario=mensaje_usuario[:2000],
            mensaje_tecnico=(mensaje_tecnico or '')[:4000],
            stack_trace=(stack_trace or '')[:8000],
            ip_address=ip_address[:100],
            user_agent=(user_agent or '')[:1000],
            metadata=metadata,
        )

        if log_console:
            print(
                f'[ERROR LOG][{tipo}][{modulo}] {mensaje_usuario} '
                f'(HTTP {http_status or "-"}) {ruta}'
            )
            if mensaje_tecnico:
                print(f'  técnico: {mensaje_tecnico[:300]}')

        return entry

    @staticmethod
    def registrar_excepcion(
        exception: Exception,
        *,
        request=None,
        modulo: str = 'general',
        tipo: str = 'servidor',
        http_status: Optional[int] = 500,
        mensaje_usuario: Optional[str] = None,
    ) -> ErrorLog:
        usuario = getattr(request, 'jwt_user', None) if request else None
        if not usuario and request and hasattr(request, 'user') and request.user.is_authenticated:
            usuario = request.user

        return ErrorLogService.registrar(
            mensaje_usuario=mensaje_usuario or str(exception),
            modulo=modulo,
            tipo=tipo,
            http_status=http_status,
            ruta=getattr(request, 'path', '') if request else '',
            metodo=getattr(request, 'method', '') if request else '',
            mensaje_tecnico=str(exception),
            stack_trace=traceback.format_exc(),
            usuario=usuario,
            ip_address=ErrorLogService._client_ip(request),
            user_agent=(request.META.get('HTTP_USER_AGENT', '') if request else ''),
        )

    @staticmethod
    def listar(
        *,
        estado: Optional[str] = None,
        tipo: Optional[str] = None,
        modulo: Optional[str] = None,
        limite: int = 100,
    ) -> list[dict]:
        qs = ErrorLog.objects.all()
        if estado:
            qs = qs.filter(estado=estado)
        if tipo:
            qs = qs.filter(tipo=tipo)
        if modulo:
            qs = qs.filter(modulo=modulo)

        return [
            {
                'id': e.id,
                'fecha': e.fecha.isoformat(),
                'usuario': e.nombre_usuario or 'Anónimo',
                'modulo': e.modulo,
                'tipo': e.tipo,
                'tipo_label': e.get_tipo_display(),
                'http_status': e.http_status,
                'ruta': e.ruta,
                'metodo': e.metodo,
                'mensaje_usuario': e.mensaje_usuario,
                'mensaje_tecnico': e.mensaje_tecnico,
                'stack_trace': e.stack_trace,
                'estado': e.estado,
                'estado_label': e.get_estado_display(),
                'metadata': e.metadata,
            }
            for e in qs[:limite]
        ]

    @staticmethod
    def resumen() -> dict:
        por_tipo = (
            ErrorLog.objects.filter(estado='pendiente')
            .values('tipo')
            .annotate(total=Count('id'))
            .order_by('-total')
        )
        por_modulo = (
            ErrorLog.objects.filter(estado='pendiente')
            .values('modulo')
            .annotate(total=Count('id'))
            .order_by('-total')[:10]
        )
        return {
            'pendientes': ErrorLog.objects.filter(estado='pendiente').count(),
            'en_revision': ErrorLog.objects.filter(estado='en_revision').count(),
            'solucionados': ErrorLog.objects.filter(estado='solucionado').count(),
            'por_tipo': list(por_tipo),
            'por_modulo': list(por_modulo),
        }

    @staticmethod
    def cambiar_estado(error_id: int, estado: str) -> bool:
        validos = {c[0] for c in ErrorLog.ESTADOS}
        if estado not in validos:
            raise ValueError(f'Estado inválido. Opciones: {", ".join(sorted(validos))}')
        updated = ErrorLog.objects.filter(id=error_id).update(estado=estado)
        return updated > 0

    @staticmethod
    def _client_ip(request) -> str:
        if not request:
            return ''
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')

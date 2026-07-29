import os
import uuid
from datetime import datetime
from math import ceil
from typing import Any, Dict, List, Optional, Tuple

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from src.application.ports.reporte_admin_repository import ReporteAdminRepositoryPort
from src.application.services.reporte_export_service import (
    build_filtros_subtitulo,
    generar_excel_formateado,
    generar_pdf_formateado,
)
from src.domain.atractivos.models import Atractivo
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.reportes.models import ReporteGenerado
from src.domain.rutas.models import Ruta
from src.domain.usuarios.models import Usuario

TIPOS_VALIDOS = ('atractivos', 'rutas', 'emprendimientos', 'usuarios')
FORMATOS_VALIDOS = ('pdf', 'excel')

TIPOS_INFO = {
    'atractivos': {
        'nombre': 'Reporte de atractivos',
        'descripcion': 'Listado de atractivos turísticos con categoría, estado y ubicación.',
        'icono': '🏔️',
        'usa_categoria': True,
        'usa_estado_publicacion': True,
    },
    'rutas': {
        'nombre': 'Reporte de rutas',
        'descripcion': 'Rutas turísticas con distancia, dificultad y estado de publicación.',
        'icono': '🗺️',
        'usa_categoria': False,
        'usa_estado_publicacion': True,
    },
    'emprendimientos': {
        'nombre': 'Reporte de emprendimientos',
        'descripcion': 'Emprendimientos registrados con categoría y datos de contacto.',
        'icono': '🏪',
        'usa_categoria': True,
        'usa_estado_publicacion': True,
    },
    'usuarios': {
        'nombre': 'Reporte de usuarios',
        'descripcion': 'Usuarios administrativos, roles y estado de acceso al panel.',
        'icono': '👥',
        'usa_categoria': False,
        'usa_estado_publicacion': False,
    },
}


class DjangoReporteAdminRepository(ReporteAdminRepositoryPort):

    @staticmethod
    def _media_url(path: Optional[str]) -> Optional[str]:
        if not path:
            return None
        base = settings.MEDIA_URL.rstrip('/')
        return f'{base}/{path.lstrip("/")}'

    @staticmethod
    def _parse_date(value: Optional[str]):
        if not value:
            return None
        try:
            return datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError('Formato de fecha inválido. Use AAAA-MM-DD.')

    def _serializar_historial(self, reporte: ReporteGenerado) -> dict:
        return {
            'id': reporte.id,
            'tipo_reporte': reporte.tipo_reporte,
            'tipo_label': TIPOS_INFO.get(reporte.tipo_reporte or '', {}).get('nombre', reporte.tipo_reporte),
            'formato': reporte.formato,
            'parametros': reporte.parametros,
            'archivo_generado': reporte.archivo_generado,
            'archivo_url': self._media_url(reporte.archivo_generado),
            'generado_en': reporte.generado_en.isoformat() if reporte.generado_en else None,
            'usuario': reporte.usuario.nombre_completo if reporte.usuario_id else None,
        }

    def listar_historial(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        qs = ReporteGenerado.objects.select_related('usuario').order_by('-generado_en')
        total = qs.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 50))
        offset = (page - 1) * page_size
        items = list(qs[offset:offset + page_size])

        return {
            'results': [self._serializar_historial(r) for r in items],
            'tipos': [
                {'key': k, **v}
                for k, v in TIPOS_INFO.items()
            ],
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': max(1, ceil(total / page_size)) if total else 1,
        }

    def obtener_filtros(self) -> Dict[str, Any]:
        estados = list(
            EstadoPublicacion.objects.order_by('nombre').values('id', 'codigo', 'nombre')
        )
        categorias = list(
            Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')
        )
        return {
            'estados': estados,
            'categorias': categorias,
            'estados_usuario': [
                {'codigo': 'todos', 'nombre': 'Todos'},
                {'codigo': 'activo', 'nombre': 'Activos'},
                {'codigo': 'inactivo', 'nombre': 'Inactivos'},
            ],
        }

    def _format_fecha_corta(self, dt) -> str:
        if not dt:
            return ''
        local = timezone.localtime(dt) if timezone.is_aware(dt) else dt
        return local.strftime('%d/%m/%Y')

    def _format_fecha_hora(self, dt) -> str:
        if not dt:
            return ''
        local = timezone.localtime(dt) if timezone.is_aware(dt) else dt
        return local.strftime('%d/%m/%Y %H:%M')

    def _aplicar_filtros_fecha(self, qs, desde: Optional[str], hasta: Optional[str], campo='creado_en'):
        fecha_desde = self._parse_date(desde)
        fecha_hasta = self._parse_date(hasta)
        if fecha_desde:
            qs = qs.filter(**{f'{campo}__date__gte': fecha_desde})
        if fecha_hasta:
            qs = qs.filter(**{f'{campo}__date__lte': fecha_hasta})
        return qs

    def _consultar_datos(self, tipo: str, filtros: dict) -> Tuple[str, List[str], List[List[Any]]]:
        estado = (filtros.get('estado') or 'todos').lower()
        categoria_id = filtros.get('categoria_id')
        desde = filtros.get('desde')
        hasta = filtros.get('hasta')

        if tipo == 'atractivos':
            qs = Atractivo.objects.select_related('categoria', 'parroquia', 'estado_publicacion').filter(activo=True)
            if categoria_id:
                qs = qs.filter(categoria_id=categoria_id)
            if estado and estado != 'todos':
                qs = qs.filter(estado_publicacion__codigo__iexact=estado)
            qs = self._aplicar_filtros_fecha(qs, desde, hasta)
            headers = ['ID', 'Nombre', 'Categoría', 'Parroquia', 'Estado', 'Visitas', 'Creado']
            rows = [
                [
                    a.id, a.nombre,
                    a.categoria.nombre if a.categoria_id else '',
                    a.parroquia.nombre if a.parroquia_id else '',
                    a.estado_publicacion.nombre if a.estado_publicacion_id else '',
                    a.visitas,
                    self._format_fecha_corta(a.creado_en),
                ]
                for a in qs.order_by('nombre')
            ]
            return TIPOS_INFO['atractivos']['nombre'], headers, rows

        if tipo == 'rutas':
            qs = Ruta.objects.select_related('parroquia', 'estado_publicacion').filter(activo=True)
            if estado and estado != 'todos':
                qs = qs.filter(estado_publicacion__codigo__iexact=estado)
            qs = self._aplicar_filtros_fecha(qs, desde, hasta)
            headers = ['ID', 'Nombre', 'Parroquia', 'Distancia km', 'Dificultad', 'Estado', 'Visitas', 'Creado']
            rows = [
                [
                    r.id, r.nombre,
                    r.parroquia.nombre if r.parroquia_id else '',
                    float(r.distancia_km) if r.distancia_km is not None else '',
                    r.dificultad or '',
                    r.estado_publicacion.nombre if r.estado_publicacion_id else '',
                    r.visitas,
                    self._format_fecha_corta(r.creado_en),
                ]
                for r in qs.order_by('nombre')
            ]
            return TIPOS_INFO['rutas']['nombre'], headers, rows

        if tipo == 'emprendimientos':
            qs = Emprendimiento.objects.select_related('categoria', 'parroquia', 'estado_publicacion').filter(activo=True)
            if categoria_id:
                qs = qs.filter(categoria_id=categoria_id)
            if estado and estado != 'todos':
                qs = qs.filter(estado_publicacion__codigo__iexact=estado)
            qs = self._aplicar_filtros_fecha(qs, desde, hasta)
            headers = ['ID', 'Nombre', 'Categoría', 'Parroquia', 'Teléfono', 'Estado', 'Creado']
            rows = [
                [
                    e.id, e.nombre,
                    e.categoria.nombre if e.categoria_id else '',
                    e.parroquia.nombre if e.parroquia_id else '',
                    e.telefono or '',
                    e.estado_publicacion.nombre if e.estado_publicacion_id else '',
                    self._format_fecha_corta(e.creado_en),
                ]
                for e in qs.order_by('nombre')
            ]
            return TIPOS_INFO['emprendimientos']['nombre'], headers, rows

        if tipo == 'usuarios':
            qs = Usuario.objects.filter(eliminado_en__isnull=True).prefetch_related('usuario_roles__rol')
            if estado == 'activo':
                qs = qs.filter(activo=True)
            elif estado == 'inactivo':
                qs = qs.filter(activo=False)
            qs = self._aplicar_filtros_fecha(qs, desde, hasta)
            headers = ['ID', 'Nombre completo', 'Username', 'Email', 'Roles', 'Activo', 'Último acceso', 'Creado']
            rows = []
            for u in qs.order_by('apellidos', 'nombres'):
                roles = ', '.join(
                    ur.rol.nombre for ur in u.usuario_roles.select_related('rol').all()
                )
                rows.append([
                    u.id,
                    u.nombre_completo,
                    u.username,
                    u.email,
                    roles,
                    'Sí' if u.activo else 'No',
                    self._format_fecha_hora(u.ultimo_acceso),
                    self._format_fecha_corta(u.creado_en),
                ])
            return TIPOS_INFO['usuarios']['nombre'], headers, rows

        raise ValueError('Tipo de reporte no válido.')

    def _generar_excel(
        self,
        titulo: str,
        headers: List[str],
        rows: List[List[Any]],
        filepath: str,
        filtros: Optional[dict] = None,
    ) -> None:
        generar_excel_formateado(
            titulo,
            headers,
            rows,
            filepath,
            subtitulo=build_filtros_subtitulo(filtros),
        )

    def _generar_pdf(
        self,
        titulo: str,
        headers: List[str],
        rows: List[List[Any]],
        filepath: str,
        filtros: Optional[dict] = None,
    ) -> None:
        generar_pdf_formateado(
            titulo,
            headers,
            rows,
            filepath,
            subtitulo=build_filtros_subtitulo(filtros),
        )

    def generar(
        self,
        tipo_reporte: str,
        formato: str,
        filtros: dict,
        usuario_id: int,
    ) -> Dict[str, Any]:
        tipo = (tipo_reporte or '').lower()
        fmt = (formato or '').lower()
        if tipo not in TIPOS_VALIDOS:
            raise ValueError('Tipo de reporte no válido.')
        if fmt not in FORMATOS_VALIDOS:
            raise ValueError('Formato no válido. Use PDF o Excel.')

        titulo, headers, rows = self._consultar_datos(tipo, filtros or {})

        filtros_export = dict(filtros or {})
        if filtros_export.get('categoria_id'):
            categoria = Categoria.objects.filter(id=filtros_export['categoria_id']).first()
            if categoria:
                filtros_export['categoria_nombre'] = categoria.nombre

        reporte = ReporteGenerado.objects.create(
            usuario_id=usuario_id,
            tipo_reporte=tipo,
            formato=fmt,
            parametros=filtros or {},
        )

        dest_dir = settings.MEDIA_ROOT / 'reportes'
        dest_dir.mkdir(parents=True, exist_ok=True)
        ext = 'pdf' if fmt == 'pdf' else 'xlsx'
        filename = f'reporte_{tipo}_{reporte.id}_{uuid.uuid4().hex[:6]}.{ext}'
        filepath = dest_dir / filename

        if fmt == 'pdf':
            self._generar_pdf(titulo, headers, rows, str(filepath), filtros_export)
        else:
            self._generar_excel(titulo, headers, rows, str(filepath), filtros_export)

        rel_path = f'reportes/{filename}'
        reporte.archivo_generado = rel_path
        reporte.save(update_fields=['archivo_generado'])

        return self._serializar_historial(reporte)

    def obtener_ruta_archivo(self, reporte_id: int) -> Optional[str]:
        reporte = ReporteGenerado.objects.filter(id=reporte_id).first()
        if not reporte or not reporte.archivo_generado:
            return None
        full = settings.MEDIA_ROOT / reporte.archivo_generado
        if not full.exists():
            return None
        return str(full)

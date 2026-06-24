from datetime import datetime
from math import ceil
from typing import Any, Dict, Optional

from django.utils.dateparse import parse_datetime

from src.application.dto.evento_dto import EventoCompleteDTO
from src.application.ports.evento_admin_repository import EventoAdminRepositoryPort
from src.domain.auditorias.models import Auditoria
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.eventos.models import Evento
from src.domain.eventos.rules import EventoRules
from src.domain.multimedia.models import Multimedia


class DjangoEventoAdminRepository(EventoAdminRepositoryPort):

    def _get_estado_publicacion(self, codigo: Optional[str]) -> EstadoPublicacion:
        codigo_normalizado = (codigo or 'borrador').strip().lower()
        estado = EstadoPublicacion.objects.filter(codigo__iexact=codigo_normalizado).first()
        if estado:
            return estado

        catalogo = {
            'borrador': 'Borrador',
            'publicado': 'Publicado',
            'inactivo': 'Inactivo',
        }
        for cod, nombre in catalogo.items():
            EstadoPublicacion.objects.get_or_create(
                codigo=cod,
                defaults={'nombre': nombre},
            )

        estado = EstadoPublicacion.objects.filter(codigo__iexact=codigo_normalizado).first()
        if estado:
            return estado

        return EstadoPublicacion.objects.filter(codigo='borrador').first()

    def _resolver_categoria_id(self, categoria_id: Optional[int]) -> int:
        if not categoria_id:
            raise ValueError('Seleccione una categoría.')
        categoria = Categoria.objects.filter(id=categoria_id, activo=True).first()
        if not categoria:
            raise ValueError('La categoría seleccionada no es válida.')
        return categoria.id

    @staticmethod
    def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        parsed = parse_datetime(value)
        if not parsed:
            raise ValueError('Formato de fecha u hora inválido.')
        return parsed

    @staticmethod
    def _registrar_auditoria(
        usuario_id: Optional[int],
        evento_id: int,
        accion: str,
        datos_anteriores: Optional[dict] = None,
        datos_nuevos: Optional[dict] = None,
    ) -> None:
        Auditoria.objects.create(
            usuario_id=usuario_id,
            tabla_afectada='eventos',
            entidad_id=evento_id,
            accion=accion,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
        )

    @staticmethod
    def _snapshot_evento(item: Evento) -> dict:
        return {
            'nombre': item.nombre,
            'categoria_id': item.categoria_id,
            'estado_publicacion': item.estado_publicacion.codigo if item.estado_publicacion_id else None,
            'fecha_inicio': item.fecha_inicio.isoformat() if item.fecha_inicio else None,
            'fecha_fin': item.fecha_fin.isoformat() if item.fecha_fin else None,
        }

    def listar_para_admin(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        self._get_estado_publicacion('borrador')

        queryset = Evento.objects.select_related(
            'categoria', 'estado_publicacion'
        ).filter(activo=True).order_by('-fecha_inicio', '-creado_en')

        if search:
            queryset = queryset.filter(nombre__icontains=search.strip())
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        if estado_codigo and estado_codigo.lower() != 'todos':
            queryset = queryset.filter(estado_publicacion__codigo__iexact=estado_codigo)

        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])

        results = []
        for item in items:
            imagen = Multimedia.objects.filter(
                entidad_tipo='evento',
                entidad_id=item.id,
                activo=True,
            ).order_by('-principal', 'orden').values_list('archivo', flat=True).first()
            results.append({
                'id': item.id,
                'nombre': item.nombre,
                'categoria': item.categoria.nombre if item.categoria_id else None,
                'categoria_id': item.categoria_id,
                'fecha_inicio': item.fecha_inicio.isoformat() if item.fecha_inicio else None,
                'fecha_fin': item.fecha_fin.isoformat() if item.fecha_fin else None,
                'estado_publicacion': item.estado_publicacion.nombre if item.estado_publicacion_id else None,
                'estado_publicacion_codigo': item.estado_publicacion.codigo if item.estado_publicacion_id else None,
                'imagen': imagen,
            })

        return {
            'results': results,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': ceil(total / page_size) if page_size else 0,
            'categorias': list(Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.order_by('nombre').values('codigo', 'nombre')),
        }

    def eliminar_logico(self, evento_id: int, usuario_id: Optional[int] = None) -> bool:
        item = Evento.objects.filter(id=evento_id, activo=True).first()
        if not item:
            return False
        snapshot = self._snapshot_evento(item)
        item.activo = False
        item.save(update_fields=['activo'])
        self._registrar_auditoria(
            usuario_id,
            evento_id,
            'ELIMINAR',
            datos_anteriores=snapshot,
            datos_nuevos={'activo': False},
        )
        return True

    def cambiar_estado_publicacion(
        self,
        evento_id: int,
        estado_codigo: str,
        usuario_id: Optional[int] = None,
    ) -> bool:
        item = Evento.objects.select_related('estado_publicacion').filter(id=evento_id, activo=True).first()
        if not item:
            return False

        estado_anterior = item.estado_publicacion.codigo if item.estado_publicacion_id else None
        estado = self._get_estado_publicacion(estado_codigo)
        if not estado:
            return False

        item.estado_publicacion = estado
        item.save(update_fields=['estado_publicacion'])

        accion = 'PUBLICAR' if estado.codigo == 'publicado' else 'EDITAR'
        self._registrar_auditoria(
            usuario_id,
            evento_id,
            accion,
            datos_anteriores={'estado_publicacion': estado_anterior},
            datos_nuevos={'estado_publicacion': estado.codigo},
        )
        return True

    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        self._get_estado_publicacion('borrador')
        return {
            'categorias': list(Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.order_by('nombre').values('codigo', 'nombre')),
        }

    def obtener_para_edicion(self, evento_id: int) -> Optional[Dict[str, Any]]:
        item = Evento.objects.select_related('categoria', 'estado_publicacion').filter(
            id=evento_id, activo=True
        ).first()
        if not item:
            return None

        imagen = Multimedia.objects.filter(
            entidad_tipo='evento',
            entidad_id=item.id,
            activo=True,
        ).order_by('-principal', 'orden').values_list('archivo', flat=True).first()

        return {
            'id': item.id,
            'nombre': item.nombre,
            'descripcion': item.descripcion,
            'categoria_id': item.categoria_id,
            'fecha_inicio': item.fecha_inicio.isoformat() if item.fecha_inicio else None,
            'fecha_fin': item.fecha_fin.isoformat() if item.fecha_fin else None,
            'direccion': item.direccion,
            'latitud': float(item.latitud) if item.latitud is not None else None,
            'longitud': float(item.longitud) if item.longitud is not None else None,
            'costo': float(item.costo) if item.costo is not None else None,
            'organizador': item.organizador,
            'contacto': item.contacto,
            'estado_publicacion_codigo': item.estado_publicacion.codigo if item.estado_publicacion else 'borrador',
            'imagen': imagen,
        }

    def guardar_completo(self, data: EventoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        nombre = (data.nombre or '').strip()
        if not nombre:
            raise ValueError('El nombre del evento es obligatorio.')

        fecha_inicio = self._parse_datetime(data.fecha_inicio)
        fecha_fin = self._parse_datetime(data.fecha_fin)
        if fecha_inicio and fecha_fin:
            EventoRules.validar_fechas(fecha_inicio, fecha_fin)

        if data.costo is not None and data.costo < 0:
            EventoRules.validar_precio(data.costo)

        if data.latitud is not None and data.longitud is not None:
            EventoRules.validar_coordenadas(data.latitud, data.longitud)

        if data.id:
            item = Evento.objects.select_related('estado_publicacion').get(id=data.id, activo=True)
            es_nuevo = False
            snapshot_anterior = self._snapshot_evento(item)
        else:
            item = Evento()
            es_nuevo = True
            snapshot_anterior = None

        estado = self._get_estado_publicacion(data.estado_publicacion_codigo)
        if not estado:
            raise ValueError(
                'No hay estados de publicación configurados. Ejecute: python manage.py setup_dev'
            )

        item.nombre = nombre
        item.descripcion = data.descripcion
        item.categoria_id = self._resolver_categoria_id(data.categoria_id)
        item.fecha_inicio = fecha_inicio
        item.fecha_fin = fecha_fin
        item.direccion = data.direccion
        item.latitud = data.latitud
        item.longitud = data.longitud
        item.costo = data.costo
        item.organizador = data.organizador
        item.contacto = data.contacto
        item.estado_publicacion = estado
        item.save()

        accion = 'PUBLICAR' if estado.codigo == 'publicado' and es_nuevo else ('CREAR' if es_nuevo else 'EDITAR')
        self._registrar_auditoria(
            usuario_id,
            item.id,
            accion,
            datos_anteriores=snapshot_anterior,
            datos_nuevos=self._snapshot_evento(item),
        )

        return self.obtener_para_edicion(item.id)

from math import ceil
from typing import Any, Dict, Optional

from django.db.models import Q
from django.utils import timezone

from src.application.dto.emprendimiento_dto import EmprendimientoCompleteDTO
from src.application.ports.emprendimiento_admin_repository import EmprendimientoAdminRepositoryPort
from src.domain.auditorias.models import Auditoria
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio
from src.domain.emprendimientos.models import (
    Emprendimiento,
    EmprendimientoRedSocial,
    EmprendimientoRelacion,
    EmprendimientoServicio,
)


class DjangoEmprendimientoAdminRepository(EmprendimientoAdminRepositoryPort):

    def _get_or_create_parroquia(self, parroquia_id: Optional[int], parroquia_nombre: Optional[str]) -> int:
        if parroquia_id:
            return parroquia_id
        nombre = (parroquia_nombre or '').strip()
        if not nombre:
            raise ValueError('La parroquia es requerida.')
        existente = Parroquia.objects.filter(nombre__iexact=nombre).first()
        if existente:
            return existente.id
        return Parroquia.objects.create(nombre=nombre, canton='Pelileo', activo=True).id

    def _get_or_create_categoria(self, categoria_id: Optional[int], categoria_nombre: Optional[str]) -> Optional[int]:
        if categoria_id:
            return categoria_id
        nombre = (categoria_nombre or '').strip()
        if not nombre:
            return None
        existente = Categoria.objects.filter(nombre__iexact=nombre).first()
        if existente:
            return existente.id
        return Categoria.objects.create(nombre=nombre, activo=True).id

    def listar_para_admin(
        self,
        search: Optional[str] = None,
        parroquia_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        queryset = Emprendimiento.objects.select_related(
            'parroquia', 'estado_publicacion', 'categoria'
        ).order_by('-creado_en')

        if search:
            queryset = queryset.filter(nombre__icontains=search.strip())
        if parroquia_id:
            queryset = queryset.filter(parroquia_id=parroquia_id)
        if estado_codigo and estado_codigo.lower() != 'todos':
            queryset = queryset.filter(estado_publicacion__codigo__iexact=estado_codigo)

        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])

        results = []
        for item in items:
            results.append({
                'id': item.id,
                'nombre': item.nombre,
                'parroquia': item.parroquia.nombre if item.parroquia_id else None,
                'telefono': item.telefono,
                'estado_publicacion': item.estado_publicacion.nombre if item.estado_publicacion_id else None,
                'estado_publicacion_codigo': item.estado_publicacion.codigo if item.estado_publicacion_id else None,
            })

        return {
            'results': results,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': ceil(total / page_size) if page_size else 0,
            'parroquias': list(Parroquia.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.order_by('nombre').values('codigo', 'nombre')),
        }

    def eliminar_logico(self, emprendimiento_id: int) -> bool:
        item = Emprendimiento.objects.filter(id=emprendimiento_id).first()
        if not item:
            return False
        item.activo = False
        item.save(update_fields=['activo'])
        return True

    def cambiar_estado_publicacion(self, emprendimiento_id: int, estado_codigo: str) -> bool:
        item = Emprendimiento.objects.filter(id=emprendimiento_id).first()
        if not item:
            return False
        estado = EstadoPublicacion.objects.filter(codigo__iexact=estado_codigo).first()
        if not estado:
            return False
        item.estado_publicacion = estado
        item.save(update_fields=['estado_publicacion'])
        return True

    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        return {
            'parroquias': list(Parroquia.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'categorias': list(Categoria.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.values('codigo', 'nombre')),
            'servicios': list(Servicio.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
        }

    def obtener_para_edicion(self, emprendimiento_id: int) -> Optional[Dict[str, Any]]:
        item = Emprendimiento.objects.select_related(
            'parroquia', 'categoria', 'estado_publicacion'
        ).filter(id=emprendimiento_id).first()
        if not item:
            return None

        servicios_ids = list(item.servicios.values_list('servicio_id', flat=True))
        redes = list(item.redes_sociales.filter(activo=True).values('nombre_red', 'url'))
        relaciones = list(
            item.relaciones.values('atractivo_id', 'ruta_id', 'distancia_referencial', 'descripcion')
        )

        return {
            'id': item.id,
            'general': {
                'nombre': item.nombre,
                'descripcion': item.descripcion,
                'direccion': item.direccion,
                'telefono': item.telefono,
                'email': item.email,
                'sitio_web': item.sitio_web,
                'horario': item.horario,
                'parroquia_id': item.parroquia_id,
                'categoria_id': item.categoria_id,
            },
            'ubicacion': {
                'latitud': float(item.latitud) if item.latitud else None,
                'longitud': float(item.longitud) if item.longitud else None,
                'altitud': float(item.altitud) if item.altitud else None,
            },
            'servicios_ids': servicios_ids,
            'redes_sociales': redes,
            'relaciones': relaciones,
            'estado_publicacion_codigo': item.estado_publicacion.codigo if item.estado_publicacion else 'borrador',
        }

    def guardar_completo(self, data: EmprendimientoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        if data.id:
            item = Emprendimiento.objects.get(id=data.id)
            es_nuevo = False
        else:
            item = Emprendimiento()
            es_nuevo = True
            item.creado_por_id = usuario_id

        estado = EstadoPublicacion.objects.filter(codigo__iexact=data.estado_publicacion_codigo).first()
        if not estado:
            estado = EstadoPublicacion.objects.filter(codigo='borrador').first()

        item.nombre = data.general.nombre
        item.descripcion = data.general.descripcion
        item.direccion = data.general.direccion
        item.telefono = data.general.telefono
        item.email = data.general.email
        item.sitio_web = data.general.sitio_web
        item.horario = data.general.horario
        item.parroquia_id = self._get_or_create_parroquia(
            data.general.parroquia_id,
            data.general.parroquia_nombre,
        )
        item.categoria_id = self._get_or_create_categoria(
            data.general.categoria_id,
            data.general.categoria_nombre,
        )
        item.latitud = data.ubicacion.latitud
        item.longitud = data.ubicacion.longitud
        item.altitud = data.ubicacion.altitud
        item.estado_publicacion = estado
        item.actualizado_en = timezone.now()
        item.save()

        EmprendimientoServicio.objects.filter(emprendimiento=item).delete()
        for servicio_id in data.servicios_ids:
            EmprendimientoServicio.objects.create(emprendimiento=item, servicio_id=servicio_id)

        EmprendimientoRedSocial.objects.filter(emprendimiento=item).delete()
        for red in data.redes_sociales:
            if red.get('url'):
                EmprendimientoRedSocial.objects.create(
                    emprendimiento=item,
                    nombre_red=red.get('nombre_red') or red.get('nombre') or '',
                    url=red['url'],
                )

        EmprendimientoRelacion.objects.filter(emprendimiento=item).delete()
        for relacion in data.relaciones:
            EmprendimientoRelacion.objects.create(
                emprendimiento=item,
                atractivo_id=relacion.get('atractivo_id'),
                ruta_id=relacion.get('ruta_id'),
                distancia_referencial=relacion.get('distancia_referencial'),
                descripcion=relacion.get('descripcion') or '',
            )

        accion = 'CREAR' if es_nuevo else 'EDITAR'
        Auditoria.objects.create(
            usuario_id=usuario_id,
            tabla_afectada='emprendimientos',
            entidad_id=item.id,
            accion=accion,
        )

        return self.obtener_para_edicion(item.id)

from math import ceil
from typing import Any, Dict, List, Optional

from django.db.models import Count, Q
from django.utils import timezone

from src.application.dto.ruta_dto import RutaCompleteDTO
from src.application.ports.ruta_admin_repository import RutaAdminRepositoryPort
from src.domain.atractivos.models import Atractivo
from src.domain.auditorias.models import Auditoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.parroquias import Parroquia
from src.domain.rutas.models import Ruta, RutaAtractivo
from src.domain.multimedia.models import Multimedia
from src.domain.shared.media_urls import build_media_url


class DjangoRutaAdminRepository(RutaAdminRepositoryPort):

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

    def listar_para_admin(
        self,
        search: Optional[str] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        queryset = (
            Ruta.objects.filter(activo=True)
            .select_related('parroquia', 'estado_publicacion')
            .annotate(total_atractivos=Count('atractivos', filter=Q(atractivos__activo=True)))
            .order_by('-creado_en')
        )

        if search:
            queryset = queryset.filter(nombre__icontains=search.strip())
        if estado_codigo and estado_codigo.lower() != 'todos':
            queryset = queryset.filter(estado_publicacion__codigo__iexact=estado_codigo)

        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])

        rutas_ids = [item.id for item in items]
        multimedia_items = Multimedia.objects.filter(
            entidad_tipo='ruta',
            entidad_id__in=rutas_ids,
            tipo='imagen',
            activo=True,
        ).order_by('entidad_id', '-principal', 'orden')

        thumbnails: Dict[int, str] = {}
        for media in multimedia_items:
            if media.entidad_id not in thumbnails:
                thumbnails[media.entidad_id] = build_media_url(media.archivo) or ''

        results = []
        for ruta in items:
            results.append({
                'id': ruta.id,
                'nombre': ruta.nombre,
                'imagen': thumbnails.get(ruta.id),
                'total_atractivos': ruta.total_atractivos,
                'distancia_km': float(ruta.distancia_km) if ruta.distancia_km else None,
                'dificultad': ruta.dificultad,
                'estado_publicacion': ruta.estado_publicacion.nombre if ruta.estado_publicacion_id else None,
                'estado_publicacion_codigo': ruta.estado_publicacion.codigo if ruta.estado_publicacion_id else None,
            })

        estados = list(EstadoPublicacion.objects.order_by('nombre').values('codigo', 'nombre'))

        return {
            'results': results,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': ceil(total / page_size) if page_size else 0,
            'estados': estados,
        }

    def eliminar_logico(self, ruta_id: int) -> bool:
        ruta = Ruta.objects.filter(id=ruta_id).first()
        if not ruta:
            return False
        ruta.activo = False
        ruta.save(update_fields=['activo'])
        return True

    def cambiar_estado_publicacion(self, ruta_id: int, estado_codigo: str) -> bool:
        ruta = Ruta.objects.filter(id=ruta_id).first()
        if not ruta:
            return False
        estado = EstadoPublicacion.objects.filter(codigo__iexact=estado_codigo).first()
        if not estado:
            return False
        ruta.estado_publicacion = estado
        ruta.save(update_fields=['estado_publicacion'])
        return True

    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        atractivos = list(
            Atractivo.objects.filter(activo=True, estado_publicacion__codigo='publicado')
            .order_by('nombre')
            .values('id', 'nombre')
        )
        return {
            'parroquias': list(Parroquia.objects.filter(activo=True).order_by('nombre').values('id', 'nombre')),
            'estados': list(EstadoPublicacion.objects.values('codigo', 'nombre')),
            'atractivos': atractivos,
        }

    def obtener_para_edicion(self, ruta_id: int) -> Optional[Dict[str, Any]]:
        ruta = Ruta.objects.select_related('parroquia', 'estado_publicacion').filter(id=ruta_id).first()
        if not ruta:
            return None

        atractivos_orden = (
            RutaAtractivo.objects.filter(ruta=ruta, activo=True)
            .select_related('atractivo')
            .order_by('orden_recorrido')
        )

        return {
            'id': ruta.id,
            'meta': {
                'parroquia': ruta.parroquia.nombre if ruta.parroquia_id else None,
                'estado_publicacion': ruta.estado_publicacion.nombre if ruta.estado_publicacion_id else None,
                'creado_en': ruta.creado_en.isoformat() if ruta.creado_en else None,
                'actualizado_en': ruta.actualizado_en.isoformat() if ruta.actualizado_en else None,
                'visitas': ruta.visitas,
            },
            'general': {
                'nombre': ruta.nombre,
                'descripcion': ruta.descripcion,
                'distancia_km': float(ruta.distancia_km) if ruta.distancia_km else None,
                'duracion_estimada': ruta.duracion_estimada,
                'dificultad': ruta.dificultad,
                'punto_inicio': ruta.punto_inicio,
                'punto_fin': ruta.punto_fin,
                'parroquia_id': ruta.parroquia_id,
            },
            'atractivos_orden': [
                {'atractivo_id': item.atractivo_id, 'orden': item.orden_recorrido}
                for item in atractivos_orden
            ],
            'puntos_interes': [
                {
                    'orden': item.orden_recorrido,
                    'atractivo_id': item.atractivo_id,
                    'nombre': item.atractivo.nombre if item.atractivo_id else None,
                }
                for item in atractivos_orden
            ],
            'geojson_ruta': ruta.geojson_ruta,
            'estado_publicacion_codigo': ruta.estado_publicacion.codigo if ruta.estado_publicacion else 'borrador',
        }

    def guardar_completo(self, data: RutaCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        if data.id:
            ruta = Ruta.objects.get(id=data.id)
            es_nuevo = False
        else:
            ruta = Ruta()
            es_nuevo = True

        estado = EstadoPublicacion.objects.filter(codigo__iexact=data.estado_publicacion_codigo).first()
        if not estado:
            estado = EstadoPublicacion.objects.filter(codigo='borrador').first()

        if data.estado_publicacion_codigo == 'publicado' and len(data.atractivos_orden) < 2:
            raise ValueError('Una ruta necesita mínimo 2 atractivos para publicarse.')

        ruta.nombre = data.general.nombre
        ruta.descripcion = data.general.descripcion
        ruta.distancia_km = data.general.distancia_km
        ruta.duracion_estimada = data.general.duracion_estimada
        ruta.dificultad = data.general.dificultad
        ruta.punto_inicio = data.general.punto_inicio
        ruta.punto_fin = data.general.punto_fin
        ruta.parroquia_id = self._get_or_create_parroquia(
            data.general.parroquia_id,
            data.general.parroquia_nombre,
        )
        ruta.estado_publicacion = estado
        ruta.geojson_ruta = data.geojson_ruta
        ruta.actualizado_en = timezone.now()
        ruta.save()

        RutaAtractivo.objects.filter(ruta=ruta).delete()
        for item in data.atractivos_orden:
            atractivo_id = item.get('atractivo_id')
            orden = item.get('orden', 0)
            if atractivo_id:
                RutaAtractivo.objects.create(
                    ruta=ruta,
                    atractivo_id=atractivo_id,
                    orden_recorrido=orden,
                )

        accion = 'CREAR' if es_nuevo else 'EDITAR'
        Auditoria.objects.create(
            usuario_id=usuario_id,
            tabla_afectada='rutas',
            entidad_id=ruta.id,
            accion=accion,
        )

        return self.obtener_para_edicion(ruta.id)

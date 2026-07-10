import os
from math import ceil
from typing import Any, Dict, Optional, Tuple, Type

from django.conf import settings
from django.db import transaction
from django.db.models import Model

from src.domain.atractivos.models import Atractivo
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.eventos.models import Evento
from src.domain.multimedia.models import Multimedia
from src.domain.resenas.models import Resena
from src.domain.rutas.models import Ruta
from src.domain.shared.media_urls import build_media_url


TIPOS_PAPELERA: Dict[str, Tuple[Type[Model], str]] = {
    'atractivos': (Atractivo, 'atractivo'),
    'rutas': (Ruta, 'ruta'),
    'emprendimientos': (Emprendimiento, 'emprendimiento'),
    'eventos': (Evento, 'evento'),
}


class DjangoPapeleraAdminRepository:
    def _resolver_tipo(self, tipo: str) -> Tuple[Type[Model], str]:
        clave = (tipo or '').strip().lower()
        if clave not in TIPOS_PAPELERA:
            raise ValueError('Tipo de entidad no válido.')
        return TIPOS_PAPELERA[clave]

    def _thumbnails(self, entidad_tipo: str, ids: list[int]) -> Dict[int, str]:
        if not ids:
            return {}
        multimedia_items = Multimedia.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id__in=ids,
            tipo='imagen',
        ).order_by('entidad_id', '-principal', 'orden')
        thumbnails: Dict[int, str] = {}
        for media in multimedia_items:
            if media.entidad_id not in thumbnails:
                thumbnails[media.entidad_id] = build_media_url(media.archivo) or ''
        return thumbnails

    def _serializar(self, item: Model, entidad_tipo: str, imagen: Optional[str]) -> Dict[str, Any]:
        base = {
            'id': item.id,
            'nombre': getattr(item, 'nombre', ''),
            'imagen': imagen,
            'estado_publicacion': (
                item.estado_publicacion.nombre if getattr(item, 'estado_publicacion_id', None) else None
            ),
            'estado_publicacion_codigo': (
                item.estado_publicacion.codigo if getattr(item, 'estado_publicacion_id', None) else None
            ),
            'actualizado_en': (
                item.actualizado_en.isoformat()
                if hasattr(item, 'actualizado_en') and item.actualizado_en
                else (item.creado_en.isoformat() if getattr(item, 'creado_en', None) else None)
            ),
        }
        if entidad_tipo == 'atractivo':
            base['categoria'] = item.categoria.nombre if item.categoria_id else None
            base['parroquia'] = item.parroquia.nombre if item.parroquia_id else None
        elif entidad_tipo == 'ruta':
            base['parroquia'] = item.parroquia.nombre if item.parroquia_id else None
        elif entidad_tipo == 'emprendimiento':
            base['parroquia'] = item.parroquia.nombre if item.parroquia_id else None
            base['categoria'] = item.categoria.nombre if item.categoria_id else None
        elif entidad_tipo == 'evento':
            base['categoria'] = item.categoria.nombre if item.categoria_id else None
        return base

    def listar(
        self,
        tipo: str,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        modelo, entidad_tipo = self._resolver_tipo(tipo)

        if entidad_tipo == 'atractivo':
            queryset = modelo.objects.filter(activo=False).select_related(
                'categoria', 'parroquia', 'estado_publicacion'
            )
        elif entidad_tipo == 'ruta':
            queryset = modelo.objects.filter(activo=False).select_related(
                'parroquia', 'estado_publicacion'
            )
        elif entidad_tipo == 'emprendimiento':
            queryset = modelo.objects.filter(activo=False).select_related(
                'categoria', 'parroquia', 'estado_publicacion'
            )
        else:
            queryset = modelo.objects.filter(activo=False).select_related(
                'categoria', 'estado_publicacion'
            )

        if entidad_tipo == 'evento':
            queryset = queryset.order_by('-creado_en')
        else:
            queryset = queryset.order_by('-actualizado_en')

        if search:
            queryset = queryset.filter(nombre__icontains=search.strip())

        total = queryset.count()
        page = max(1, page)
        page_size = max(1, min(page_size, 100))
        offset = (page - 1) * page_size
        items = list(queryset[offset:offset + page_size])
        thumbnails = self._thumbnails(entidad_tipo, [item.id for item in items])

        return {
            'tipo': tipo,
            'results': [
                self._serializar(item, entidad_tipo, thumbnails.get(item.id))
                for item in items
            ],
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': ceil(total / page_size) if page_size else 0,
        }

    def contar_total(self) -> int:
        return sum(
            modelo.objects.filter(activo=False).count()
            for modelo, _ in TIPOS_PAPELERA.values()
        )

    def restaurar(self, tipo: str, item_id: int) -> bool:
        modelo, _ = self._resolver_tipo(tipo)
        updated = modelo.objects.filter(id=item_id, activo=False).update(activo=True)
        return updated > 0

    @staticmethod
    def _eliminar_archivos_multimedia(entidad_tipo: str, entidad_id: int) -> None:
        registros = list(
            Multimedia.objects.filter(entidad_tipo=entidad_tipo, entidad_id=entidad_id)
        )
        for media in registros:
            if media.archivo:
                ruta = settings.MEDIA_ROOT / str(media.archivo).lstrip('/')
                try:
                    if ruta.is_file():
                        ruta.unlink()
                except OSError:
                    pass
        Multimedia.objects.filter(entidad_tipo=entidad_tipo, entidad_id=entidad_id).delete()

    @transaction.atomic
    def eliminar_permanente(self, tipo: str, item_id: int) -> bool:
        modelo, entidad_tipo = self._resolver_tipo(tipo)
        item = modelo.objects.filter(id=item_id, activo=False).first()
        if not item:
            return False

        Resena.objects.filter(entidad_tipo=entidad_tipo, entidad_id=item_id).delete()
        self._eliminar_archivos_multimedia(entidad_tipo, item_id)
        item.delete()
        return True

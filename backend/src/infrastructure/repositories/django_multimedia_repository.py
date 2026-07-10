import os
import uuid
from typing import List, Optional

from django.conf import settings

from src.application.ports.multimedia_repository import MultimediaRepositoryPort
from src.domain.multimedia.entities import MultimediaEntity
from src.domain.multimedia.models import Multimedia


class DjangoMultimediaRepository(MultimediaRepositoryPort):

    def _map(self, item: Multimedia) -> MultimediaEntity:
        return MultimediaEntity(
            id=item.id,
            entidad_tipo=item.entidad_tipo,
            entidad_id=item.entidad_id,
            archivo=item.archivo,
            tipo=item.tipo or 'imagen',
            titulo=item.titulo,
            descripcion=item.descripcion,
            principal=item.principal,
            orden=item.orden,
            activo=item.activo,
        )

    def guardar(self, multimedia: MultimediaEntity) -> MultimediaEntity:
        if multimedia.id:
            item = Multimedia.objects.get(id=multimedia.id)
        else:
            item = Multimedia()

        item.entidad_tipo = multimedia.entidad_tipo
        item.entidad_id = multimedia.entidad_id
        item.archivo = multimedia.archivo
        item.tipo = multimedia.tipo
        item.titulo = multimedia.titulo
        item.descripcion = multimedia.descripcion
        item.principal = multimedia.principal
        item.orden = multimedia.orden
        item.activo = multimedia.activo
        item.save()
        return self._map(item)

    def obtener_por_id(self, multimedia_id: int) -> Optional[MultimediaEntity]:
        item = Multimedia.objects.filter(id=multimedia_id, activo=True).first()
        return self._map(item) if item else None

    def listar_por_entidad(self, entidad_tipo: str, entidad_id: int) -> List[MultimediaEntity]:
        items = Multimedia.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            activo=True,
            tipo='imagen',
        ).order_by('-principal', 'orden', 'id')
        return [self._map(item) for item in items]

    def obtener_principal(self, entidad_tipo: str, entidad_id: int) -> Optional[MultimediaEntity]:
        item = Multimedia.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            activo=True,
            principal=True,
            tipo='imagen',
        ).first()
        return self._map(item) if item else None

    def establecer_principal(self, multimedia_id: int) -> bool:
        item = Multimedia.objects.filter(id=multimedia_id, activo=True).first()
        if not item:
            return False
        Multimedia.objects.filter(
            entidad_tipo=item.entidad_tipo,
            entidad_id=item.entidad_id,
            activo=True,
        ).update(principal=False)
        item.principal = True
        item.save(update_fields=['principal'])
        return True

    @staticmethod
    def _eliminar_archivo_fisico(archivo: str | None) -> None:
        if not archivo:
            return
        ruta = settings.MEDIA_ROOT / str(archivo).lstrip('/')
        try:
            if ruta.is_file():
                ruta.unlink()
        except OSError:
            pass

    def eliminar_logico(self, multimedia_id: int) -> bool:
        item = Multimedia.objects.filter(id=multimedia_id, activo=True).first()
        if not item:
            return False

        era_principal = item.principal
        entidad_tipo = item.entidad_tipo
        entidad_id = item.entidad_id
        archivo = item.archivo

        self._eliminar_archivo_fisico(archivo)
        item.delete()

        if era_principal:
            siguiente = Multimedia.objects.filter(
                entidad_tipo=entidad_tipo,
                entidad_id=entidad_id,
                activo=True,
            ).order_by('orden', 'id').first()
            if siguiente:
                siguiente.principal = True
                siguiente.save(update_fields=['principal'])

        return True

    def reordenar(self, entidad_tipo: str, entidad_id: int, orden_ids: List[int]) -> bool:
        for index, media_id in enumerate(orden_ids):
            Multimedia.objects.filter(
                id=media_id,
                entidad_tipo=entidad_tipo,
                entidad_id=entidad_id,
            ).update(orden=index)
        return True

    def guardar_archivo_subido(
        self,
        entidad_tipo: str,
        entidad_id: int,
        uploaded_file,
        principal: bool = False,
    ) -> MultimediaEntity:
        extension = os.path.splitext(uploaded_file.name)[1].lower()
        if extension not in ['.jpg', '.jpeg', '.png', '.webp']:
            raise ValueError('Solo se permiten imágenes JPG, PNG o WEBP.')

        relative_dir = os.path.join('multimedia', entidad_tipo, str(entidad_id))
        absolute_dir = os.path.join(settings.MEDIA_ROOT, relative_dir)
        os.makedirs(absolute_dir, exist_ok=True)

        filename = f'{uuid.uuid4().hex}{extension}'
        absolute_path = os.path.join(absolute_dir, filename)

        with open(absolute_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        relative_path = os.path.join(relative_dir, filename).replace('\\', '/')
        total = Multimedia.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            activo=True,
        ).count()

        if principal or total == 0:
            Multimedia.objects.filter(
                entidad_tipo=entidad_tipo,
                entidad_id=entidad_id,
                activo=True,
            ).update(principal=False)
            principal = True

        entity = MultimediaEntity(
            id=None,
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            archivo=relative_path,
            tipo='imagen',
            principal=principal,
            orden=total,
        )
        return self.guardar(entity)

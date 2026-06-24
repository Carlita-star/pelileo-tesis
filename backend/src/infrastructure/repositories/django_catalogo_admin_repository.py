from typing import Any, Dict, Optional, Type

from django.db import models
from django.db.models import Q

from src.application.dto.catalogo_dto import CatalogoItemDTO
from src.application.ports.catalogo_admin_repository import CatalogoAdminRepositoryPort
from src.domain.catalogos.actividades import Actividad
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio

TIPOS_VALIDOS = ('categorias', 'parroquias', 'servicios', 'actividades')

_MODELOS: Dict[str, Type[models.Model]] = {
    'categorias': Categoria,
    'parroquias': Parroquia,
    'servicios': Servicio,
    'actividades': Actividad,
}


class DjangoCatalogoAdminRepository(CatalogoAdminRepositoryPort):

    def _modelo(self, tipo: str) -> Type[models.Model]:
        if tipo not in TIPOS_VALIDOS:
            raise ValueError('Tipo de catálogo no válido.')
        return _MODELOS[tipo]

    def _serializar(self, item: models.Model, tipo: str) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            'id': item.id,
            'nombre': item.nombre,
            'activo': item.activo,
        }
        if tipo == 'parroquias':
            data['descripcion'] = ''
        else:
            data['descripcion'] = getattr(item, 'descripcion', None) or ''
        if tipo in ('servicios', 'actividades'):
            data['icono'] = getattr(item, 'icono', None) or ''
        return data

    def listar(
        self,
        tipo: str,
        search: Optional[str] = None,
        estado: str = 'todos',
    ) -> Dict[str, Any]:
        modelo = self._modelo(tipo)
        qs = modelo.objects.all().order_by('nombre')

        if search:
            filtros = Q(nombre__icontains=search)
            if tipo != 'parroquias':
                filtros |= Q(descripcion__icontains=search)
            qs = qs.filter(filtros)

        if estado == 'activo':
            qs = qs.filter(activo=True)
        elif estado == 'inactivo':
            qs = qs.filter(activo=False)

        results = [self._serializar(item, tipo) for item in qs]
        return {'tipo': tipo, 'results': results, 'total': len(results)}

    def obtener(self, tipo: str, item_id: int) -> Optional[Dict[str, Any]]:
        modelo = self._modelo(tipo)
        item = modelo.objects.filter(id=item_id).first()
        if not item:
            return None
        return self._serializar(item, tipo)

    def guardar(self, data: CatalogoItemDTO) -> Dict[str, Any]:
        tipo = data.tipo
        modelo = self._modelo(tipo)
        nombre = (data.nombre or '').strip()
        if not nombre:
            raise ValueError('El nombre es obligatorio.')

        duplicado = modelo.objects.filter(nombre__iexact=nombre)
        if data.id:
            duplicado = duplicado.exclude(id=data.id)
        if duplicado.exists():
            raise ValueError('Ya existe un registro con ese nombre.')

        if data.id:
            item = modelo.objects.filter(id=data.id).first()
            if not item:
                raise ValueError('Registro no encontrado.')
        else:
            item = modelo()
            if tipo == 'parroquias':
                item.canton = 'Pelileo'
                item.provincia = 'Tungurahua'

        item.nombre = nombre
        item.activo = bool(data.activo)

        if tipo != 'parroquias':
            item.descripcion = (data.descripcion or '').strip() or None

        if tipo in ('servicios', 'actividades'):
            item.icono = (data.icono or '').strip() or None

        item.save()
        return self._serializar(item, tipo)

    def cambiar_activo(self, tipo: str, item_id: int, activo: bool) -> bool:
        modelo = self._modelo(tipo)
        updated = modelo.objects.filter(id=item_id).update(activo=activo)
        return updated > 0

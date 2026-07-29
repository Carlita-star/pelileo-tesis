from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from src.application.dto.catalogo_dto import CatalogoItemDTO


class CatalogoAdminRepositoryPort(ABC):

    @abstractmethod
    def listar(self, tipo: str, search: Optional[str] = None, estado: str = 'todos') -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener(self, tipo: str, item_id: int) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def guardar(self, data: CatalogoItemDTO) -> Dict[str, Any]:
        ...

    @abstractmethod
    def cambiar_activo(self, tipo: str, item_id: int, activo: bool) -> bool:
        ...

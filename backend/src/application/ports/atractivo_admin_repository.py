from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from src.application.dto.atractivo_dto import AtractivoCompleteDTO


class AtractivoAdminRepositoryPort(ABC):

    @abstractmethod
    def listar_para_admin(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        parroquia_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """Retorna datos paginados y filtros para el listado de atractivos administrativos."""
        ...

    @abstractmethod
    def eliminar_logico(self, atractivo_id: int) -> bool:
        """Marca un atractivo como inactivo sin borrarlo de la base de datos."""
        ...

    @abstractmethod
    def cambiar_estado_publicacion(self, atractivo_id: int, estado_codigo: str) -> bool:
        """Actualiza el estado de publicación de un atractivo."""
        ...

    @abstractmethod
    def obtener_para_edicion(self, atractivo_id: int) -> Optional[Dict[str, Any]]:
        """Retorna todos los datos de un atractivo para edición."""
        ...

    @abstractmethod
    def guardar_completo(self, data: AtractivoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        """Guarda o actualiza un atractivo con todos sus datos relacionados."""
        ...

    @abstractmethod
    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        """Retorna catálogos iniciales para crear un nuevo atractivo."""
        ...

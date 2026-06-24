from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from src.application.dto.evento_dto import EventoCompleteDTO


class EventoAdminRepositoryPort(ABC):

    @abstractmethod
    def listar_para_admin(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        ...

    @abstractmethod
    def eliminar_logico(self, evento_id: int, usuario_id: Optional[int] = None) -> bool:
        ...

    @abstractmethod
    def cambiar_estado_publicacion(
        self,
        evento_id: int,
        estado_codigo: str,
        usuario_id: Optional[int] = None,
    ) -> bool:
        ...

    @abstractmethod
    def obtener_para_edicion(self, evento_id: int) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def guardar_completo(self, data: EventoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        ...

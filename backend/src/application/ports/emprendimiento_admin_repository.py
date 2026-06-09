from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from src.application.dto.emprendimiento_dto import EmprendimientoCompleteDTO


class EmprendimientoAdminRepositoryPort(ABC):

    @abstractmethod
    def listar_para_admin(
        self,
        search: Optional[str] = None,
        parroquia_id: Optional[int] = None,
        estado_codigo: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        ...

    @abstractmethod
    def eliminar_logico(self, emprendimiento_id: int) -> bool:
        ...

    @abstractmethod
    def cambiar_estado_publicacion(self, emprendimiento_id: int, estado_codigo: str) -> bool:
        ...

    @abstractmethod
    def obtener_para_edicion(self, emprendimiento_id: int) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def guardar_completo(self, data: EmprendimientoCompleteDTO, usuario_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        ...

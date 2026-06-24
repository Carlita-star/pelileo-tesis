from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from src.application.dto.usuario_admin_dto import UsuarioAdminDTO


class UsuarioAdminRepositoryPort(ABC):

    @abstractmethod
    def listar_para_admin(
        self,
        search: Optional[str] = None,
        rol_id: Optional[int] = None,
        estado: str = 'todos',
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_datos_iniciales(self) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_para_edicion(self, usuario_id: int) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def guardar_completo(self, data: UsuarioAdminDTO, actor_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def cambiar_activo(self, usuario_id: int, activo: bool, actor_id: int) -> bool:
        ...

    @abstractmethod
    def eliminar_logico(self, usuario_id: int, actor_id: int) -> bool:
        ...

    @abstractmethod
    def guardar_foto_perfil(self, usuario_id: int, archivo) -> Dict[str, Any]:
        ...

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class UsuarioPerfilRepositoryPort(ABC):

    @abstractmethod
    def obtener_perfil(self, usuario_id: int) -> Optional[Dict[str, Any]]:
        ...

    @abstractmethod
    def actualizar_perfil(
        self,
        usuario_id: int,
        nombres: str,
        apellidos: str,
        telefono: Optional[str],
    ) -> Dict[str, Any]:
        ...

    @abstractmethod
    def cambiar_password(
        self,
        usuario_id: int,
        password_actual: str,
        password_nueva: str,
        password_confirmacion: str,
    ) -> None:
        ...

    @abstractmethod
    def guardar_foto_perfil(self, usuario_id: int, archivo) -> Dict[str, Any]:
        ...

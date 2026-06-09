from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.usuarios.entities import UsuarioEntity
 
 
class UsuarioRepositoryPort(ABC):
 
    @abstractmethod
    def guardar(self, usuario: UsuarioEntity, password_plano: Optional[str] = None) -> UsuarioEntity:
        """
        Crea o actualiza un usuario.
        Si password_plano viene, el repository lo hashea en infraestructura —
        nunca se hashea en el dominio ni en los casos de uso.
        """
        ...
 
    @abstractmethod
    def obtener_por_id(self, usuario_id: int) -> Optional[UsuarioEntity]:
        ...
 
    @abstractmethod
    def obtener_por_username(self, username: str) -> Optional[UsuarioEntity]:
        ...
 
    @abstractmethod
    def obtener_por_email(self, email: str) -> Optional[UsuarioEntity]:
        ...
 
    @abstractmethod
    def autenticar(self, username_or_email: str, password: str) -> Optional[UsuarioEntity]:
        """Autentica un usuario por username o email y contraseña clara."""
        ...
 
    @abstractmethod
    def listar_activos(self) -> List[UsuarioEntity]:
        ...
 
    @abstractmethod
    def eliminar_logico(self, usuario_id: int) -> bool:
        ...
 
    @abstractmethod
    def actualizar_ultimo_acceso(self, usuario_id: int) -> None:
        ...
 
    @abstractmethod
    def guardar_token_recuperacion(
        self, usuario_id: int, token: str, expira_en
    ) -> None:
        ...
 
    @abstractmethod
    def obtener_por_token_recuperacion(self, token: str) -> Optional[UsuarioEntity]:
        """Retorna el usuario si el token existe y no ha expirado, o None."""
        ...
 
    @abstractmethod
    def limpiar_token_recuperacion(self, usuario_id: int) -> None:
        """Limpia el token después de usarlo o de que expire."""
        ...
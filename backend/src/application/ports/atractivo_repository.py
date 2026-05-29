from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.atractivos.entities import AtractivoEntity
 
 
class AtractivoRepositoryPort(ABC):
 
    @abstractmethod
    def guardar(self, atractivo: AtractivoEntity) -> AtractivoEntity:
        """Crea o actualiza un atractivo. Retorna la entidad con id asignado."""
        ...
 
    @abstractmethod
    def obtener_por_id(self, atractivo_id: int) -> Optional[AtractivoEntity]:
        """Retorna un atractivo por su id, o None si no existe."""
        ...
 
    @abstractmethod
    def obtener_por_slug(self, slug: str) -> Optional[AtractivoEntity]:
        """Retorna un atractivo por slug (usado en URLs públicas del portal)."""
        ...
 
    @abstractmethod
    def listar_publicados(
        self,
        categoria_id: Optional[int] = None,
        parroquia_id: Optional[int] = None,
        mes_recomendado: Optional[str] = None,
        busqueda: Optional[str] = None,
    ) -> List[AtractivoEntity]:
        """Lista atractivos publicados y activos para el portal público con filtros."""
        ...
 
    @abstractmethod
    def listar_todos(self) -> List[AtractivoEntity]:
        """Lista todos los atractivos sin importar estado — para el panel admin."""
        ...
 
    @abstractmethod
    def listar_destacados(self, limite: int = 6) -> List[AtractivoEntity]:
        """Retorna atractivos marcados como destacados para la página de inicio."""
        ...
 
    @abstractmethod
    def eliminar_logico(self, atractivo_id: int) -> bool:
        """Pone activo=False. Retorna True si se realizó, False si no existía."""
        ...
 
    @abstractmethod
    def cambiar_estado_publicacion(
        self, atractivo_id: int, estado_codigo: str, usuario_id: int
    ) -> Optional[AtractivoEntity]:
        """Cambia el estado borrador → publicado → inactivo y registra historial."""
        ...
 
    @abstractmethod
    def incrementar_visitas(self, atractivo_id: int) -> None:
        """Incrementa el contador de visitas cuando un visitante ve la ficha."""
        ...
 
    @abstractmethod
    def existe_slug(self, slug: str, excluir_id: Optional[int] = None) -> bool:
        """Verifica si un slug ya está en uso (validación al crear o editar)."""
        ...
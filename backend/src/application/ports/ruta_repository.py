from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.rutas.entities import RutaEntity
 
 
class RutaRepositoryPort(ABC):
 
    @abstractmethod
    def guardar(self, ruta: RutaEntity) -> RutaEntity:
        """Crea o actualiza una ruta con sus atractivos asociados."""
        ...
 
    @abstractmethod
    def obtener_por_id(self, ruta_id: int) -> Optional[RutaEntity]:
        """Retorna una ruta con sus atractivos en orden, o None."""
        ...
 
    @abstractmethod
    def listar_publicadas(self) -> List[RutaEntity]:
        """Lista rutas publicadas y activas para el portal público."""
        ...
 
    @abstractmethod
    def listar_todas(self) -> List[RutaEntity]:
        """Lista todas las rutas sin importar estado — para el panel admin."""
        ...
 
    @abstractmethod
    def eliminar_logico(self, ruta_id: int) -> bool:
        ...
 
    @abstractmethod
    def cambiar_estado_publicacion(
        self, ruta_id: int, estado_codigo: str, usuario_id: int
    ) -> Optional[RutaEntity]:
        ...
 
    @abstractmethod
    def asociar_atractivo(self, ruta_id: int, atractivo_id: int, orden: int) -> bool:
        """Agrega un atractivo a la ruta en el orden indicado."""
        ...
 
    @abstractmethod
    def desasociar_atractivo(self, ruta_id: int, atractivo_id: int) -> bool:
        """Quita un atractivo de la ruta."""
        ...
 
    @abstractmethod
    def reordenar_atractivos(self, ruta_id: int, orden_atractivos: List[dict]) -> bool:
        """
        Reordena los atractivos de una ruta.
        orden_atractivos = [{'atractivo_id': 1, 'orden': 1}, ...]
        """
        ...
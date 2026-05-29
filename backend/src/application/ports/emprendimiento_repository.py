from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.emprendimientos.entities import EmprendimientoEntity
 
 
class EmprendimientoRepositoryPort(ABC):
 
    @abstractmethod
    def guardar(self, emprendimiento: EmprendimientoEntity) -> EmprendimientoEntity:
        ...
 
    @abstractmethod
    def obtener_por_id(self, emprendimiento_id: int) -> Optional[EmprendimientoEntity]:
        ...
 
    @abstractmethod
    def listar_publicados(
        self, parroquia_id: Optional[int] = None
    ) -> List[EmprendimientoEntity]:
        """Lista emprendimientos publicados, con filtro opcional por parroquia."""
        ...
 
    @abstractmethod
    def listar_todos(self) -> List[EmprendimientoEntity]:
        ...
 
    @abstractmethod
    def listar_por_atractivo(self, atractivo_id: int) -> List[EmprendimientoEntity]:
        """Lista emprendimientos relacionados con un atractivo específico."""
        ...
 
    @abstractmethod
    def listar_por_ruta(self, ruta_id: int) -> List[EmprendimientoEntity]:
        """Lista emprendimientos relacionados con una ruta específica."""
        ...
 
    @abstractmethod
    def eliminar_logico(self, emprendimiento_id: int) -> bool:
        ...
 
    @abstractmethod
    def cambiar_estado_publicacion(
        self, emprendimiento_id: int, estado_codigo: str, usuario_id: int
    ) -> Optional[EmprendimientoEntity]:
        ...
 
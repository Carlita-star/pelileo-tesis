# =============================================================================
# src/application/ports/multimedia_repository.py
# =============================================================================

from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.multimedia.entities import MultimediaEntity


class MultimediaRepositoryPort(ABC):

    @abstractmethod
    def guardar(self, multimedia: MultimediaEntity) -> MultimediaEntity:
        ...

    @abstractmethod
    def obtener_por_id(self, multimedia_id: int) -> Optional[MultimediaEntity]:
        ...

    @abstractmethod
    def listar_por_entidad(
        self, entidad_tipo: str, entidad_id: int
    ) -> List[MultimediaEntity]:
        """Lista imágenes activas de una entidad (atractivo, ruta, etc.)."""
        ...

    @abstractmethod
    def obtener_principal(
        self, entidad_tipo: str, entidad_id: int
    ) -> Optional[MultimediaEntity]:
        """Retorna la imagen marcada como principal de una entidad."""
        ...

    @abstractmethod
    def establecer_principal(self, multimedia_id: int) -> bool:
        """
        Marca una imagen como principal y desmarca las demás de la misma entidad.
        Retorna True si se realizó el cambio.
        """
        ...

    @abstractmethod
    def eliminar_logico(self, multimedia_id: int) -> bool:
        ...

    @abstractmethod
    def reordenar(
        self, entidad_tipo: str, entidad_id: int, orden_ids: List[int]
    ) -> bool:
        """
        Reordena las imágenes de una entidad.
        orden_ids = lista de ids en el nuevo orden deseado.
        """
        ...
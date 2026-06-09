from abc import ABC, abstractmethod
from typing import Any, Dict, List


class DashboardRepositoryPort(ABC):

    @abstractmethod
    def obtener_totales(self) -> Dict[str, int]:
        """Retorna totales agregados para el dashboard."""
        ...

    @abstractmethod
    def obtener_estado_publicacion(self) -> Dict[str, int]:
        """Retorna los conteos por estado de publicación."""
        ...

    @abstractmethod
    def listar_cambios_recientes(self, limite: int = 5) -> List[Dict[str, Any]]:
        """Retorna las últimas acciones de auditoría."""
        ...

    @abstractmethod
    def listar_atractivos_mas_visitados(self, limite: int = 5) -> List[Dict[str, Any]]:
        """Retorna los atractivos con más visitas."""
        ...

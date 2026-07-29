from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class ReporteAdminRepositoryPort(ABC):

    @abstractmethod
    def listar_historial(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_filtros(self) -> Dict[str, Any]:
        ...

    @abstractmethod
    def generar(
        self,
        tipo_reporte: str,
        formato: str,
        filtros: dict,
        usuario_id: int,
    ) -> Dict[str, Any]:
        ...

    @abstractmethod
    def obtener_ruta_archivo(self, reporte_id: int) -> Optional[str]:
        ...

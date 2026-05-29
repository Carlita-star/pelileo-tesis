# =============================================================================
# src/application/ports/auditoria_repository.py
# =============================================================================

from abc import ABC, abstractmethod
from typing import Optional, List
from datetime import date
from src.domain.auditorias.entities import AuditoriaEntity


class AuditoriaRepositoryPort(ABC):

    @abstractmethod
    def registrar(self, auditoria: AuditoriaEntity) -> None:
        """
        Registra una acción crítica en el log de auditoría.
        Se llama desde los casos de uso o desde signals de Django.
        Nunca falla silenciosamente — cualquier error debe propagarse.
        """
        ...

    @abstractmethod
    def listar(
        self,
        tabla: Optional[str] = None,
        usuario_id: Optional[int] = None,
        accion: Optional[str] = None,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ) -> List[AuditoriaEntity]:
        """
        Lista logs con filtros opcionales.
        Solo accesible para administradores (RF-44).
        """
        ...
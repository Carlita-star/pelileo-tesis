# =============================================================================
# src/application/use_cases/auditorias/listar_auditorias.py
# =============================================================================

from typing import Optional, List
from datetime import date

from src.application.ports.auditoria_repository import AuditoriaRepositoryPort
from src.domain.auditorias.entities import AuditoriaEntity


class ListarAuditorias:
    """
    Caso de uso: listar el log de auditoría con filtros opcionales.
    Solo accesible para administradores (RF-44).

    Depende del PUERTO (la abstracción), no del repositorio concreto.
    Esa inversión de dependencias es el corazón de la arquitectura hexagonal.
    """

    ACCIONES_VALIDAS = AuditoriaEntity.ACCIONES_VALIDAS

    def __init__(self, auditoria_repository: AuditoriaRepositoryPort):
        self.repository = auditoria_repository

    def execute(
        self,
        tabla: Optional[str] = None,
        usuario_id: Optional[int] = None,
        accion: Optional[str] = None,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ) -> List[AuditoriaEntity]:
        # Validación en la capa de aplicación: cortar antes de tocar la BD.
        if accion is not None and accion not in self.ACCIONES_VALIDAS:
            raise ValueError(
                f"Acción '{accion}' no válida. "
                f"Opciones: {sorted(self.ACCIONES_VALIDAS)}"
            )

        if desde and hasta and desde > hasta:
            raise ValueError("La fecha 'desde' no puede ser posterior a 'hasta'.")

        # El caso de uso orquesta y valida; el repositorio ejecuta.
        return self.repository.listar(
            tabla=tabla,
            usuario_id=usuario_id,
            accion=accion,
            desde=desde,
            hasta=hasta,
        )
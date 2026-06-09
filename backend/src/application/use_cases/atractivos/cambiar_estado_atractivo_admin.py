from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort


class CambiarEstadoAtractivoAdminUseCase:
    def __init__(self, repository: AtractivoAdminRepositoryPort):
        self.repository = repository

    def execute(self, atractivo_id: int, estado_codigo: str) -> bool:
        return self.repository.cambiar_estado_publicacion(atractivo_id, estado_codigo)

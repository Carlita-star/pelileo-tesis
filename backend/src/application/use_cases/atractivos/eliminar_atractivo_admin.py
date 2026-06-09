from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort


class EliminarAtractivoAdminUseCase:
    def __init__(self, repository: AtractivoAdminRepositoryPort):
        self.repository = repository

    def execute(self, atractivo_id: int) -> bool:
        return self.repository.eliminar_logico(atractivo_id)

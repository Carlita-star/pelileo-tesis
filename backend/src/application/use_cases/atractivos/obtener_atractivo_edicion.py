from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort


class ObtenerAtractivoEdicionUseCase:
    def __init__(self, repository: AtractivoAdminRepositoryPort):
        self.repository = repository

    def execute(self, atractivo_id: int):
        """Obtiene todos los datos de un atractivo para edición."""
        return self.repository.obtener_para_edicion(atractivo_id)

    def obtener_datos_iniciales(self):
        """Obtiene los datos iniciales para un nuevo formulario."""
        return self.repository.obtener_datos_iniciales()

from src.application.dto.atractivo_dto import AtractivoCompleteDTO
from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort
from src.application.validators.admin_forms import validar_atractivo_form


class GuardarAtractivoUseCase:
    def __init__(self, repository: AtractivoAdminRepositoryPort):
        self.repository = repository

    def execute(self, data: AtractivoCompleteDTO, usuario_id: int):
        """Guarda o actualiza un atractivo con todos sus datos relacionados."""
        validar_atractivo_form(
            data,
            publicar=data.estado_publicacion_codigo == 'publicado',
        )
        return self.repository.guardar_completo(data, usuario_id)

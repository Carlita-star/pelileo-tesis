from src.application.ports.atractivo_admin_repository import AtractivoAdminRepositoryPort


class ListarAtractivosAdminUseCase:
    def __init__(self, repository: AtractivoAdminRepositoryPort):
        self.repository = repository

    def execute(
        self,
        search=None,
        categoria_id=None,
        parroquia_id=None,
        estado_codigo=None,
        page=1,
        page_size=20,
    ):
        return self.repository.listar_para_admin(
            search=search,
            categoria_id=categoria_id,
            parroquia_id=parroquia_id,
            estado_codigo=estado_codigo,
            page=page,
            page_size=page_size,
        )

from src.application.ports.dashboard_repository import DashboardRepositoryPort


class ObtenerDashboardSummaryUseCase:
    def __init__(self, dashboard_repository: DashboardRepositoryPort):
        self.dashboard_repository = dashboard_repository

    def execute(self) -> dict:
        return {
            'totales': self.dashboard_repository.obtener_totales(),
            'estado_publicacion': self.dashboard_repository.obtener_estado_publicacion(),
            'cambios_recientes': self.dashboard_repository.listar_cambios_recientes(5),
            'atractivos_mas_visitados': self.dashboard_repository.listar_atractivos_mas_visitados(5),
        }

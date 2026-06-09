from typing import Any, Dict, List, Optional

from src.application.ports.dashboard_repository import DashboardRepositoryPort
from src.domain.atractivos.models import Atractivo
from src.domain.auditorias.models import Auditoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.eventos.models import Evento
from src.domain.rutas.models import Ruta


class DjangoDashboardRepository(DashboardRepositoryPort):
    def _estado_por_codigo(self, codigo: str) -> Optional[EstadoPublicacion]:
        estado = EstadoPublicacion.objects.filter(codigo__iexact=codigo).first()
        if estado:
            return estado
        return EstadoPublicacion.objects.filter(nombre__iexact=codigo).first()

    def obtener_totales(self) -> Dict[str, int]:
        return {
            'total_atractivos': Atractivo.objects.filter(activo=True).count(),
            'total_rutas': Ruta.objects.filter(activo=True).count(),
            'total_emprendimientos': Emprendimiento.objects.filter(activo=True).count(),
            'eventos_activos': Evento.objects.filter(activo=True).count(),
        }

    def obtener_estado_publicacion(self) -> Dict[str, int]:
        publicado = self._estado_por_codigo('publicado')
        borrador = self._estado_por_codigo('borrador')
        inactivo = self._estado_por_codigo('inactivo')

        def contar_por_estado(model):
            if not publicado:
                return 0
            return model.objects.filter(estado_publicacion=publicado, activo=True).count()

        publicados = sum(
            model.objects.filter(estado_publicacion=publicado, activo=True).count()
            for model in [Atractivo, Ruta, Emprendimiento]
        ) if publicado else 0

        borradores = sum(
            model.objects.filter(estado_publicacion=borrador, activo=True).count()
            for model in [Atractivo, Ruta, Emprendimiento]
        ) if borrador else 0

        inactivos = sum(
            model.objects.filter(activo=False).count()
            for model in [Atractivo, Ruta, Emprendimiento]
        )

        return {
            'publicados': publicados,
            'en_borrador': borradores,
            'inactivos': inactivos,
        }

    def listar_cambios_recientes(self, limite: int = 5) -> List[Dict[str, Any]]:
        auditorias = Auditoria.objects.select_related('usuario').order_by('-fecha')[:limite]
        return [
            {
                'id': a.id,
                'usuario': a.nombre_usuario or (a.usuario.nombre_completo if a.usuario_id else 'Sistema'),
                'tabla_afectada': a.tabla_afectada,
                'accion': a.accion,
                'fecha': a.fecha.isoformat() if a.fecha else None,
            }
            for a in auditorias
        ]

    def listar_atractivos_mas_visitados(self, limite: int = 5) -> List[Dict[str, Any]]:
        atractivos = Atractivo.objects.filter(activo=True).order_by('-visitas')[:limite]
        return [
            {
                'id': a.id,
                'nombre': a.nombre,
                'visitas': a.visitas,
            }
            for a in atractivos
        ]

# =============================================================================
# src/infrastructure/repositories/django_auditoria_repository.py
# =============================================================================

from typing import Optional, List
from datetime import date

from src.application.ports.auditoria_repository import AuditoriaRepositoryPort
from src.domain.auditorias.entities import AuditoriaEntity
from src.domain.auditorias.models import Auditoria  # el modelo Django (ORM)


class DjangoAuditoriaRepository(AuditoriaRepositoryPort):
    """
    Adaptador de salida: implementa el puerto AuditoriaRepositoryPort
    usando el ORM de Django.

    Es el ÚNICO punto de la rebanada que conoce Django y la base de datos.
    Traduce entre el modelo Auditoria (persistencia) y AuditoriaEntity (dominio).
    """

    def registrar(self, auditoria: AuditoriaEntity) -> None:
        # Entidad de dominio  →  fila en la BD.
        # 'fecha' no se setea: el modelo la pone con auto_now_add.
        # 'user_agent' no está en la entidad, así que queda en null.
        Auditoria.objects.create(
            usuario_id=auditoria.usuario_id,
            nombre_usuario=auditoria.nombre_usuario,
            tabla_afectada=auditoria.tabla_afectada,
            entidad_id=auditoria.entidad_id,
            accion=auditoria.accion,
            datos_anteriores=auditoria.datos_anteriores,
            datos_nuevos=auditoria.datos_nuevos,
            ip_address=auditoria.ip_address,
        )

    def listar(
        self,
        tabla: Optional[str] = None,
        usuario_id: Optional[int] = None,
        accion: Optional[str] = None,
        desde: Optional[date] = None,
        hasta: Optional[date] = None,
    ) -> List[AuditoriaEntity]:
        # Construimos el queryset aplicando solo los filtros que llegaron.
        qs = Auditoria.objects.select_related('usuario').all()  # ya viene ordenado por -fecha (Meta del modelo)

        if tabla:
            qs = qs.filter(tabla_afectada=tabla)
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)
        if accion:
            qs = qs.filter(accion=accion)
        if desde:
            qs = qs.filter(fecha__date__gte=desde)
        if hasta:
            qs = qs.filter(fecha__date__lte=hasta)

        # BD  →  entidades de dominio. El guard evita que una fila con
        # 'accion' nula reviente la validación de la entidad (__post_init__).
        return [
            self._to_entity(m)
            for m in qs
            if m.accion in AuditoriaEntity.ACCIONES_VALIDAS
        ]

    @staticmethod
    def _to_entity(model: Auditoria) -> AuditoriaEntity:
        """Mapea una fila del modelo a la entidad de dominio."""
        return AuditoriaEntity(
            id=model.id,
            tabla_afectada=model.tabla_afectada,
            accion=model.accion,
            usuario_id=model.usuario_id,  # Django expone el _id sin query extra
            nombre_usuario=model.nombre_usuario or (
                model.usuario.nombre_completo if model.usuario_id else None
            ),
            entidad_id=model.entidad_id,
            datos_anteriores=model.datos_anteriores,
            datos_nuevos=model.datos_nuevos,
            ip_address=model.ip_address,
            fecha=model.fecha,
        )
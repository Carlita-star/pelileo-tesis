# =============================================================================
# src/domain/atractivos/entities.py
# =============================================================================

from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime


@dataclass
class UbicacionEntity:
    """Value Object reutilizable para coordenadas geográficas."""
    latitud: float
    longitud: float
    altitud: Optional[float] = None
    direccion: Optional[str] = None

    def __post_init__(self):
        if not (-90 <= self.latitud <= 90):
            raise ValueError(f"Latitud inválida: {self.latitud}")
        if not (-180 <= self.longitud <= 180):
            raise ValueError(f"Longitud inválida: {self.longitud}")

    def es_valida(self) -> bool:
        return self.latitud != 0.0 and self.longitud != 0.0


@dataclass
class AtractivoDetalleEntity:
    """Características y condiciones de visita del atractivo."""
    clima: Optional[str] = None
    temperatura: Optional[str] = None
    precipitacion: Optional[str] = None
    linea_producto: Optional[str] = None
    escenario: Optional[str] = None
    tipo_ingreso: Optional[str] = None
    costo: Optional[float] = None
    horario: Optional[str] = None
    formas_pago: Optional[str] = None
    meses_recomendados: Optional[str] = None
    observaciones: Optional[str] = None

    def es_gratuito(self) -> bool:
        return self.costo is None or self.costo == 0.0


@dataclass
class AtractivoEntity:
    """
    Entidad de dominio principal del atractivo turístico.
    Contiene las reglas de negocio: cuándo puede publicarse,
    si tiene información completa, etc.
    """
    id: Optional[int]
    nombre: str
    slug: str
    categoria_id: int
    parroquia_id: int
    estado_publicacion_codigo: str  # 'borrador' | 'publicado' | 'inactivo'
    creado_por_id: int
    descripcion: Optional[str] = None
    ubicacion: Optional[UbicacionEntity] = None
    horario: Optional[str] = None
    precio_referencial: Optional[float] = None
    destacado: bool = False
    activo: bool = True
    visitas: int = 0
    servicios: List[str] = field(default_factory=list)   # nombres de servicios
    actividades: List[str] = field(default_factory=list) # nombres de actividades
    detalle: Optional[AtractivoDetalleEntity] = None
    creado_en: Optional[datetime] = None

    def __post_init__(self):
        self._validar()

    def _validar(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre del atractivo es obligatorio")
        if not self.slug or not self.slug.strip():
            raise ValueError("El slug del atractivo es obligatorio")

    def esta_publicado(self) -> bool:
        return self.estado_publicacion_codigo == "publicado" and self.activo

    def puede_publicarse(self) -> bool:
        """
        Regla de negocio: un atractivo solo se puede publicar si tiene
        nombre, descripción y ubicación completos.
        """
        return bool(
            self.nombre
            and self.descripcion
            and self.ubicacion
            and self.ubicacion.es_valida()
        )

    def incrementar_visitas(self):
        self.visitas += 1

    def es_gratuito(self) -> bool:
        if self.detalle:
            return self.detalle.es_gratuito()
        return self.precio_referencial is None or self.precio_referencial == 0.0
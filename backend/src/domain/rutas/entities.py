from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
 
 
@dataclass
class PuntoRutaEntity:
    """Representa un atractivo dentro de una ruta con su orden."""
    atractivo_id: int
    nombre_atractivo: str
    orden_recorrido: int
    latitud: Optional[float] = None
    longitud: Optional[float] = None
 
 
@dataclass
class RutaEntity:
    """
    Entidad de dominio de una ruta turística.
    Conoce sus propias reglas: si puede publicarse,
    si tiene trazado geográfico, si está completa.
    """
    id: Optional[int]
    nombre: str
    estado_publicacion_codigo: str
    descripcion: Optional[str] = None
    distancia_km: Optional[float] = None
    duracion_estimada: Optional[str] = None
    dificultad: Optional[str] = None
    punto_inicio: Optional[str] = None
    punto_fin: Optional[str] = None
    lat_inicio: Optional[float] = None
    lon_inicio: Optional[float] = None
    lat_fin: Optional[float] = None
    lon_fin: Optional[float] = None
    geojson_ruta: Optional[dict] = None
    activo: bool = True
    atractivos: List[PuntoRutaEntity] = field(default_factory=list)
    creado_en: Optional[datetime] = None
 
    def __post_init__(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre de la ruta es obligatorio")
 
    def esta_publicada(self) -> bool:
        return self.estado_publicacion_codigo == "publicado" and self.activo
 
    def puede_publicarse(self) -> bool:
        """
        Regla de negocio: una ruta necesita al menos 2 atractivos
        y tener nombre y descripción para poder publicarse.
        """
        return bool(
            self.nombre
            and self.descripcion
            and len(self.atractivos) >= 2
        )
 
    def tiene_trazado(self) -> bool:
        return self.geojson_ruta is not None
 
    def total_atractivos(self) -> int:
        return len(self.atractivos)
 
    def atractivos_ordenados(self) -> List[PuntoRutaEntity]:
        return sorted(self.atractivos, key=lambda p: p.orden_recorrido)
 
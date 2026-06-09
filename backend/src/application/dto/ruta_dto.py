from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class RutaGeneralDTO:
    nombre: str
    descripcion: Optional[str] = None
    distancia_km: Optional[float] = None
    duracion_estimada: Optional[str] = None
    dificultad: Optional[str] = None
    punto_inicio: Optional[str] = None
    punto_fin: Optional[str] = None
    parroquia_id: Optional[int] = None
    parroquia_nombre: Optional[str] = None


@dataclass
class RutaCompleteDTO:
    general: RutaGeneralDTO
    atractivos_orden: List[Dict[str, int]] = field(default_factory=list)
    estado_publicacion_codigo: str = 'borrador'
    geojson_ruta: Optional[Dict[str, Any]] = None
    id: Optional[int] = None

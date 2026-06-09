from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class EmprendimientoGeneralDTO:
    nombre: str
    descripcion: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    sitio_web: Optional[str] = None
    horario: Optional[str] = None
    parroquia_id: Optional[int] = None
    parroquia_nombre: Optional[str] = None
    categoria_id: Optional[int] = None
    categoria_nombre: Optional[str] = None


@dataclass
class EmprendimientoUbicacionDTO:
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    altitud: Optional[float] = None


@dataclass
class EmprendimientoCompleteDTO:
    general: EmprendimientoGeneralDTO
    ubicacion: EmprendimientoUbicacionDTO = field(default_factory=EmprendimientoUbicacionDTO)
    servicios_ids: List[int] = field(default_factory=list)
    redes_sociales: List[Dict[str, str]] = field(default_factory=list)
    relaciones: List[Dict[str, Any]] = field(default_factory=list)
    estado_publicacion_codigo: str = 'borrador'
    id: Optional[int] = None

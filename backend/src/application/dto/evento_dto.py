from dataclasses import dataclass
from typing import Optional


@dataclass
class EventoCompleteDTO:
    nombre: str
    categoria_id: Optional[int] = None
    categoria_nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    direccion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    costo: Optional[float] = None
    organizador: Optional[str] = None
    contacto: Optional[str] = None
    estado_publicacion_codigo: str = 'borrador'
    id: Optional[int] = None

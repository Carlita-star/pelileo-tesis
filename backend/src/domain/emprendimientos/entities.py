from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
@dataclass
class EmprendimientoEntity:
    """
    Entidad de dominio de un emprendimiento rural o turístico.
    Puede relacionarse con atractivos o rutas cercanas.
    """
    id: Optional[int]
    nombre: str
    parroquia_id: int
    estado_publicacion_codigo: str
    descripcion: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    sitio_web: Optional[str] = None
    horario: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    activo: bool = True
    servicios: List[str] = field(default_factory=list)
    redes_sociales: List[dict] = field(default_factory=list)
    atractivos_relacionados: List[int] = field(default_factory=list)
    creado_en: Optional[datetime] = None
 
    def __post_init__(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre del emprendimiento es obligatorio")
 
    def esta_publicado(self) -> bool:
        return self.estado_publicacion_codigo == "publicado" and self.activo
 
    def puede_publicarse(self) -> bool:
        """Necesita nombre, descripción y al menos un contacto."""
        tiene_contacto = bool(self.telefono or self.email)
        return bool(self.nombre and self.descripcion and tiene_contacto)
 
    def tiene_ubicacion(self) -> bool:
        return self.latitud is not None and self.longitud is not None
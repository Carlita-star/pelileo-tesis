from dataclasses import dataclass
from typing import Optional
from datetime import datetime
 
 
@dataclass
class EventoEntity:
    id: Optional[int]
    nombre: str
    categoria_id: int
    estado_publicacion_codigo: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    direccion: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    costo: Optional[float] = None
    organizador: Optional[str] = None
    contacto: Optional[str] = None
    activo: bool = True
 
    def __post_init__(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre del evento es obligatorio")
        if self.fecha_inicio and self.fecha_fin:
            if self.fecha_fin < self.fecha_inicio:
                raise ValueError("La fecha de fin no puede ser anterior a la de inicio")
 
    def esta_publicado(self) -> bool:
        return self.estado_publicacion_codigo == "publicado" and self.activo
 
    def esta_vigente(self) -> bool:
        """Verifica si el evento aún no ha terminado."""
        if self.fecha_fin is None:
            return True
        from django.utils import timezone
        return self.fecha_fin >= timezone.now()
 
    def es_gratuito(self) -> bool:
        return self.costo is None or self.costo == 0.0
 
 
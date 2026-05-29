from dataclasses import dataclass, field
from typing import Optional
 
 
@dataclass
class EmpresaEntity:
    """
    Entidad de dominio que representa la identidad institucional del GAD.
    Es un objeto de valor inmutable usado en casos de uso y puertos.
    No hereda de models.Model — no sabe nada de Django ni PostgreSQL.
    """
    id: Optional[int]
    nombre: str
    ruc: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    sitio_web: Optional[str] = None
    direccion: Optional[str] = None
    provincia: Optional[str] = None
    canton: Optional[str] = None
    parroquia: Optional[str] = None
    descripcion: Optional[str] = None
    historia: Optional[str] = None
    mision: Optional[str] = None
    vision: Optional[str] = None
    logo_principal: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    estado: bool = True
 
    def __post_init__(self):
        self._validar()
 
    def _validar(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre de la empresa es obligatorio")
        if not self.ruc or len(self.ruc) != 13:
            raise ValueError("El RUC debe tener exactamente 13 dígitos")
 
    def tiene_ubicacion(self) -> bool:
        return self.latitud is not None and self.longitud is not None
 
    def tiene_identidad_completa(self) -> bool:
        """Verifica que la ficha institucional esté completa para el portal público."""
        return all([self.descripcion, self.mision, self.vision, self.logo_principal])
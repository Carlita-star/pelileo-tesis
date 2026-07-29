from dataclasses import dataclass
from typing import Optional


@dataclass
class CatalogoItemDTO:
    tipo: str
    nombre: str
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    activo: bool = True
    id: Optional[int] = None

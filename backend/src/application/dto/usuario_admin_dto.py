from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class UsuarioAdminDTO:
    nombres: str
    apellidos: str
    username: str
    email: str
    telefono: Optional[str] = None
    foto_perfil: Optional[str] = None
    password: Optional[str] = None
    rol_ids: List[int] = field(default_factory=list)
    activo: bool = True
    id: Optional[int] = None

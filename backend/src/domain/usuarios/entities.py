from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
 
 
@dataclass
class UsuarioEntity:
    """
    Entidad de dominio del usuario administrativo.
    No expone password_hash — la autenticación ocurre en la capa de infraestructura.
    """
    id: Optional[int]
    username: str
    email: str
    nombres: str
    apellidos: str
    activo: bool = True
    foto_perfil: Optional[str] = None
    telefono: Optional[str] = None
    ultimo_acceso: Optional[datetime] = None
    roles: List[str] = field(default_factory=list)  # nombres de roles asignados
 
    def __post_init__(self):
        self._validar()
 
    def _validar(self):
        if not self.username or not self.username.strip():
            raise ValueError("El username es obligatorio")
        if not self.email or "@" not in self.email:
            raise ValueError("El email no es válido")
        if not self.nombres or not self.apellidos:
            raise ValueError("Nombres y apellidos son obligatorios")
 
    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}"
 
    def es_administrador(self) -> bool:
        return "administrador" in self.roles
 
    def es_gestor(self) -> bool:
        return "gestor_turistico" in self.roles
 
    def tiene_rol(self, nombre_rol: str) -> bool:
        return nombre_rol in self.roles
 
    def puede_publicar(self) -> bool:
        """Solo administradores y gestores pueden publicar contenido."""
        return self.es_administrador() or self.es_gestor()
 
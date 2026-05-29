# =========================================================
# ARCHIVO:
# src/domain/roles/entities.py
# =========================================================

from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
 


@dataclass
class RolEntity:
    """
    Entidad de dominio para roles del sistema.
    Define el contrato del RBAC sin depender del ORM.
    """
    id: Optional[int]
    nombre: str
    descripcion: Optional[str] = None
    permisos: List[str] = field(default_factory=list)  # códigos de permisos
 
    def tiene_permiso(self, codigo: str) -> bool:
        return codigo in self.permisos
 
    def __post_init__(self):
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre del rol es obligatorio")
 
 
@dataclass
class PermisoEntity:
    """
    Permiso atómico del sistema.
    El código sigue la convención: modulo.accion
    Ejemplos: atractivos.crear, rutas.publicar, usuarios.gestionar
    """
    id: Optional[int]
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
 
    def __post_init__(self):
        if "." not in self.codigo:
            raise ValueError(
                f"El código de permiso '{self.codigo}' debe seguir la convención modulo.accion"
            )
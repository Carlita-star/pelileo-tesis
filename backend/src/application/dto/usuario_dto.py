from dataclasses import dataclass
from typing import List


@dataclass
class LoginCredentialsDTO:
    username_or_email: str
    password: str


@dataclass
class UsuarioDTO:
    id: int
    username: str
    email: str
    nombres: str
    apellidos: str
    nombre_completo: str
    roles: List[str]

from dataclasses import dataclass
from typing import Optional
from datetime import datetime
@dataclass
class AuditoriaEntity:
    """
    Entidad de trazabilidad. Registra quién hizo qué, cuándo y sobre qué.
    Es inmutable por diseño — los registros de auditoría nunca se editan.
    """
    id: Optional[int]
    tabla_afectada: str
    accion: str          # 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'LOGIN' | etc.
    usuario_id: Optional[int] = None
    nombre_usuario: Optional[str] = None
    entidad_id: Optional[int] = None
    datos_anteriores: Optional[dict] = None
    datos_nuevos: Optional[dict] = None
    ip_address: Optional[str] = None
    fecha: Optional[datetime] = None
 
    ACCIONES_VALIDAS = {'CREAR', 'EDITAR', 'ELIMINAR', 'LOGIN', 'LOGOUT', 'PUBLICAR', 'CONFIGURAR'}
 
    def __post_init__(self):
        if self.accion not in self.ACCIONES_VALIDAS:
            raise ValueError(
                f"Acción '{self.accion}' no válida. Opciones: {self.ACCIONES_VALIDAS}"
            )
 
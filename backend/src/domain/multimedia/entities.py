from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class MultimediaEntity:
    """
    Entidad de multimedia polimórfica.
    Se asocia a cualquier entidad del sistema mediante entidad_tipo + entidad_id.
    """
    id: Optional[int]
    entidad_tipo: str   # 'atractivo' | 'ruta' | 'emprendimiento' | 'evento'
    entidad_id: int
    archivo: str
    tipo: str           # 'imagen' | 'video' | 'documento'
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    principal: bool = False
    orden: int = 0
    activo: bool = True
 
    EXTENSIONES_PERMITIDAS = {
        'imagen': ['.jpg', '.jpeg', '.png', '.webp'],
        'video': ['.mp4', '.webm'],
        'documento': ['.pdf'],
    }
 
    def __post_init__(self):
        if not self.archivo:
            raise ValueError("El archivo es obligatorio")
        self._validar_extension()
 
    def _validar_extension(self):
        import os
        ext = os.path.splitext(self.archivo)[1].lower()
        permitidas = self.EXTENSIONES_PERMITIDAS.get(self.tipo, [])
        if permitidas and ext not in permitidas:
            raise ValueError(
                f"Extensión '{ext}' no permitida para tipo '{self.tipo}'. "
                f"Permitidas: {permitidas}"
            )
 
    def es_imagen(self) -> bool:
        return self.tipo == 'imagen'
 
 
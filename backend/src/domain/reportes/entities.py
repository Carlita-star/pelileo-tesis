
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
@dataclass
class ReporteEntity:
    """Representa un reporte generado y disponible para descarga."""
    id: Optional[int]
    tipo_reporte: str
    formato: str         # 'pdf' | 'excel'
    usuario_id: Optional[int] = None
    parametros: Optional[dict] = None
    archivo_generado: Optional[str] = None
    generado_en: Optional[datetime] = None
 
    FORMATOS_VALIDOS = {'pdf', 'excel'}
 
    def __post_init__(self):
        if self.formato not in self.FORMATOS_VALIDOS:
            raise ValueError(f"Formato '{self.formato}' no válido. Use: {self.FORMATOS_VALIDOS}")
 
    def esta_disponible(self) -> bool:
        return self.archivo_generado is not None
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
@dataclass
class ConfiguracionEntity:
    """
    Parámetro global del sistema almacenado como clave-valor.
    Permite configurar el sistema desde el panel sin tocar código (RNF-15).
    """
    id: Optional[int]
    clave: str
    valor: Optional[str]
    tipo: Optional[str] = None       # 'texto' | 'numero' | 'booleano' | 'json'
    descripcion: Optional[str] = None
    editable: bool = True
 
    def valor_como_bool(self) -> bool:
        return str(self.valor).lower() in ('true', '1', 'si', 'yes')
 
    def valor_como_int(self) -> int:
        return int(self.valor)
 
    def valor_como_dict(self) -> dict:
        import json
        return json.loads(self.valor)
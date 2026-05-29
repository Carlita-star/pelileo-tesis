from dataclasses import dataclass
from typing import Optional
 
 
@dataclass
class AparienciaEntity:
    """
    Representa la configuración visual del sistema.
    Alimenta el endpoint GET /api/configuracion/ que React consume
    para aplicar colores y fuentes de forma dinámica.
    """
    id: Optional[int]
    empresa_id: int
    color_primario: Optional[str] = None
    color_secundario: Optional[str] = None
    color_terciario: Optional[str] = None
    fuente_principal: Optional[str] = None
    fuente_secundaria: Optional[str] = None
    tamano_fuente_base: int = 16
    modo_oscuro: bool = False
    borde_radio: int = 10
    sombra_global: bool = True
 
    def to_css_variables(self) -> dict:
        """
        Convierte la apariencia a variables CSS para el frontend React.
        Útil en el serializer del endpoint de configuración pública.
        """
        return {
            "--color-primary": self.color_primario or "#2E7D32",
            "--color-secondary": self.color_secundario or "#81C784",
            "--color-tertiary": self.color_terciario or "#F9A825",
            "--font-primary": self.fuente_principal or "Inter, sans-serif",
            "--font-secondary": self.fuente_secundaria or "Merriweather, serif",
            "--font-size-base": f"{self.tamano_fuente_base}px",
            "--border-radius": f"{self.borde_radio}px",
        }
 
 
@dataclass
class MenuItemEntity:
    """Representa un ítem del menú de navegación del portal público."""
    id: Optional[int]
    nombre: str
    ruta: Optional[str] = None
    icono: Optional[str] = None
    orden: int = 0
    visible: bool = True
    abierto_nueva_pestana: bool = False
    submenus: list = None
 
    def __post_init__(self):
        if self.submenus is None:
            self.submenus = []
 
    def tiene_submenus(self) -> bool:
        return len(self.submenus) > 0
 
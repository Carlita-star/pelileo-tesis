from dataclasses import dataclass, field, asdict
from typing import Optional, List


@dataclass
class AtractivoGeneralDTO:
    nombre: str
    categoria_id: Optional[int] = None
    parroquia_id: Optional[int] = None
    categoria_nombre: Optional[str] = None
    parroquia_nombre: Optional[str] = None
    descripcion: Optional[str] = None
    direccion: Optional[str] = None
    horario: Optional[str] = None
    precio_referencial: Optional[float] = None
    slug: Optional[str] = None
    destacado: bool = False


@dataclass
class AtractivoUbicacionDTO:
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    altitud: Optional[float] = None


@dataclass
class AtractivoDetalleDTO:
    clima: Optional[str] = None
    temperatura: Optional[str] = None
    precipitacion: Optional[str] = None
    linea_producto: Optional[str] = None
    escenario: Optional[str] = None
    tipo_ingreso: Optional[str] = None
    costo: Optional[float] = None
    horario: Optional[str] = None
    formas_pago: Optional[str] = None
    meses_recomendados: Optional[str] = None
    observaciones: Optional[str] = None


@dataclass
class AtractivoAccesibilidadDTO:
    tipo_via: Optional[str] = None
    estado_via: Optional[str] = None
    tipo_transporte: Optional[str] = None
    tiempo_desplazamiento: Optional[str] = None
    distancia_referencial_km: Optional[float] = None
    posee_senalizacion: Optional[bool] = None
    acceso_discapacidad: Optional[bool] = None
    observaciones: Optional[str] = None


@dataclass
class AtractivoEstadoConservacionDTO:
    estado_conservacion: Optional[str] = None
    nivel_seguridad: Optional[str] = None
    posee_senal_internet: Optional[bool] = None
    cobertura_operadora: Optional[str] = None
    centro_salud_cercano: Optional[str] = None
    distancia_centro_salud_km: Optional[float] = None
    observaciones: Optional[str] = None


@dataclass
class AtractivoAdministracionDTO:
    tipo_administrador: Optional[str] = None
    institucion_responsable: Optional[str] = None
    nombre_administrador: Optional[str] = None
    cargo: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None


@dataclass
class AtractivoCompleteDTO:
    general: AtractivoGeneralDTO
    ubicacion: AtractivoUbicacionDTO = field(default_factory=AtractivoUbicacionDTO)
    detalle: AtractivoDetalleDTO = field(default_factory=AtractivoDetalleDTO)
    accesibilidad: AtractivoAccesibilidadDTO = field(default_factory=AtractivoAccesibilidadDTO)
    conservacion: AtractivoEstadoConservacionDTO = field(default_factory=AtractivoEstadoConservacionDTO)
    administracion: AtractivoAdministracionDTO = field(default_factory=AtractivoAdministracionDTO)
    servicios_ids: List[int] = field(default_factory=list)
    actividades_ids: List[int] = field(default_factory=list)
    estado_publicacion_codigo: str = 'borrador'
    id: Optional[int] = None


@dataclass
class AtractivoResponseDTO:
    id: int
    nombre: str
    slug: str
    categoria_id: int
    categoria_nombre: Optional[str]
    parroquia_id: int
    parroquia_nombre: Optional[str]
    descripcion: Optional[str]
    direccion: Optional[str]
    horario: Optional[str]
    precio_referencial: Optional[float]
    estado_publicacion_codigo: str
    estado_publicacion_nombre: Optional[str]
    activo: bool
    visitas: int
    destacado: bool
    ubicacion: AtractivoUbicacionDTO
    detalle: AtractivoDetalleDTO
    accesibilidad: AtractivoAccesibilidadDTO
    conservacion: AtractivoEstadoConservacionDTO
    administracion: AtractivoAdministracionDTO
    servicios_ids: List[int] = field(default_factory=list)
    actividades_ids: List[int] = field(default_factory=list)

"""
Recopila datos completos de un registro y genera fichas PDF/Word.
"""

import os
import re
import unicodedata
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from django.conf import settings
from django.utils import timezone

from src.domain.multimedia.models import Multimedia
from src.domain.rutas.models import Ruta
from src.domain.atractivos.models import Atractivo
from src.domain.emprendimientos.models import Emprendimiento
from src.infrastructure.repositories.django_atractivo_repository import DjangoAtractivoAdminRepository
from src.infrastructure.repositories.django_ruta_admin_repository import DjangoRutaAdminRepository
from src.infrastructure.repositories.django_emprendimiento_admin_repository import DjangoEmprendimientoAdminRepository
from src.infrastructure.repositories.django_configuracion_admin_repository import DjangoConfiguracionAdminRepository
from src.application.services.ficha_pdf_builder import FichaPdfBuilder
from src.application.services.ficha_word_builder import FichaWordBuilder

TIPOS_FICHA = ('atractivo', 'ruta', 'emprendimiento')
FORMATOS_VALIDOS = ('pdf', 'word')


def _v(val) -> str:
    if val is None:
        return 'No registrado'
    if isinstance(val, bool):
        return 'Sí' if val else 'No'
    if isinstance(val, (list, tuple)):
        if not val:
            return 'No registrado'
        return ', '.join(str(x) for x in val)
    text = str(val).strip()
    return text if text else 'No registrado'


def _fmt_dt(iso: Optional[str]) -> str:
    if not iso:
        return 'No registrado'
    try:
        dt = datetime.fromisoformat(iso.replace('Z', '+00:00'))
        if timezone.is_aware(dt):
            dt = timezone.localtime(dt)
        return dt.strftime('%d/%m/%Y %H:%M')
    except (ValueError, TypeError):
        return str(iso)


def _slug_filename(prefix: str, nombre: str, ext: str) -> str:
    base = unicodedata.normalize('NFKD', nombre or 'registro')
    base = base.encode('ascii', 'ignore').decode('ascii')
    base = re.sub(r'[^\w\s-]', '', base).strip().replace(' ', '_')
    base = re.sub(r'_+', '_', base)[:80] or 'registro'
    return f'{prefix}_{base}.{ext}'


def _media_abs(relative: Optional[str]) -> Optional[str]:
    if not relative:
        return None
    path = settings.MEDIA_ROOT / str(relative).lstrip('/')
    return str(path) if path.is_file() else None


def _list_images(entidad_tipo: str, entidad_id: int) -> List[Dict[str, Any]]:
    items = Multimedia.objects.filter(
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
        activo=True,
        tipo='imagen',
    ).order_by('-principal', 'orden')
    result = []
    for m in items:
        abs_path = _media_abs(m.archivo)
        if abs_path:
            result.append({
                'path': abs_path,
                'titulo': m.titulo or f'Imagen {m.orden + 1}',
                'descripcion': m.descripcion,
                'principal': m.principal,
            })
    return result


def _institucional() -> Dict[str, Any]:
    cfg = DjangoConfiguracionAdminRepository().obtener_completo()
    empresa = cfg.get('empresa') or {}
    logo_rel = empresa.get('logo_principal')
    return {
        'sistema': empresa.get('nombre_comercial') or empresa.get('nombre') or 'Pelileo Turismo',
        'eslogan': empresa.get('eslogan') or 'GAD Municipal · Turismo',
        'logo_path': _media_abs(logo_rel),
    }


class FichaRegistroService:

    def _build_ficha_base(self, tipo: str, tipo_label: str, titulo: str) -> Dict[str, Any]:
        inst = _institucional()
        return {
            'tipo': tipo,
            'tipo_label': tipo_label,
            'titulo': titulo or 'Sin nombre',
            'sistema': inst['sistema'],
            'eslogan': inst['eslogan'],
            'logo_path': inst['logo_path'],
            'generado_en': timezone.localtime(timezone.now()).strftime('%d/%m/%Y %H:%M'),
            'sections': [],
            'images': [],
        }

    def _fields_section(self, title: str, pairs: List[Tuple[str, Any]]) -> Dict[str, Any]:
        return {
            'title': title,
            'fields': [(label, _v(val)) for label, val in pairs],
        }

    def _text_section(self, title: str, blocks: List[Tuple[str, Any]]) -> Dict[str, Any]:
        return {
            'title': title,
            'text_blocks': [(label, _v(val)) for label, val in blocks],
        }

    def datos_atractivo(self, atractivo_id: int) -> Dict[str, Any]:
        data = DjangoAtractivoAdminRepository().obtener_para_edicion(atractivo_id)
        if not data:
            raise ValueError('Atractivo no encontrado.')

        g = data.get('general') or {}
        u = data.get('ubicacion') or {}
        d = data.get('detalle') or {}
        a = data.get('accesibilidad') or {}
        c = data.get('conservacion') or {}
        adm = data.get('administracion') or {}
        meta = data.get('meta') or {}

        servicios = ', '.join(s['nombre'] for s in (data.get('servicios') or [])) or None
        actividades = ', '.join(x['nombre'] for x in (data.get('actividades') or [])) or None

        ficha = self._build_ficha_base('atractivo', 'Atractivo turístico', g.get('nombre'))
        item = Atractivo.objects.filter(id=atractivo_id).first()

        ficha['sections'] = [
            self._fields_section('Información general', [
                ('Nombre', g.get('nombre')),
                ('Slug', g.get('slug')),
                ('Categoría', meta.get('categoria')),
                ('Parroquia', meta.get('parroquia')),
                ('Estado de publicación', meta.get('estado_publicacion')),
                ('Registro activo', item.activo if item else None),
                ('Destacado', item.destacado if item else None),
                ('Visitas', meta.get('visitas')),
            ]),
            self._text_section('Descripción', [
                ('Descripción completa', g.get('descripcion')),
            ]),
            self._fields_section('Ubicación y acceso', [
                ('Dirección', g.get('direccion')),
                ('Latitud', u.get('latitud')),
                ('Longitud', u.get('longitud')),
                ('Altitud (m)', u.get('altitud')),
                ('Coordenadas', (
                    f"{u['latitud']}, {u['longitud']}"
                    if u.get('latitud') is not None and u.get('longitud') is not None
                    else None
                )),
                ('Horario de atención', g.get('horario') or d.get('horario')),
                ('Precio referencial', f"${g['precio_referencial']}" if g.get('precio_referencial') is not None else None),
            ]),
            self._fields_section('Detalle turístico', [
                ('Clima', d.get('clima')),
                ('Temperatura', d.get('temperatura')),
                ('Precipitación', d.get('precipitacion')),
                ('Línea de producto', d.get('linea_producto')),
                ('Escenario', d.get('escenario')),
                ('Tipo de ingreso', d.get('tipo_ingreso')),
                ('Costo de ingreso', f"${d['costo']}" if d.get('costo') is not None else None),
                ('Formas de pago', d.get('formas_pago')),
            ]),
            self._text_section('Recomendaciones', [
                ('Meses recomendados', d.get('meses_recomendados')),
                ('Observaciones y recomendaciones', d.get('observaciones')),
            ]),
            self._fields_section('Accesibilidad', [
                ('Tipo de vía', a.get('tipo_via')),
                ('Estado de la vía', a.get('estado_via')),
                ('Tipo de transporte', a.get('tipo_transporte')),
                ('Tiempo / duración de desplazamiento', a.get('tiempo_desplazamiento')),
                ('Distancia referencial (km)', a.get('distancia_referencial_km')),
                ('Posee señalización', a.get('posee_senalizacion')),
                ('Acceso discapacidad', a.get('acceso_discapacidad')),
                ('Observaciones', a.get('observaciones')),
            ]),
            self._fields_section('Conservación y seguridad', [
                ('Estado de conservación', c.get('estado_conservacion')),
                ('Nivel de seguridad', c.get('nivel_seguridad')),
                ('Señal de internet', c.get('posee_senal_internet')),
                ('Cobertura operadora', c.get('cobertura_operadora')),
                ('Centro de salud cercano', c.get('centro_salud_cercano')),
                ('Distancia centro salud (km)', c.get('distancia_centro_salud_km')),
                ('Observaciones', c.get('observaciones')),
            ]),
            self._fields_section('Administración y contacto', [
                ('Tipo administrador', adm.get('tipo_administrador')),
                ('Institución responsable', adm.get('institucion_responsable')),
                ('Nombre administrador', adm.get('nombre_administrador')),
                ('Cargo', adm.get('cargo')),
                ('Teléfono', adm.get('telefono')),
                ('Correo electrónico', adm.get('correo')),
            ]),
            self._fields_section('Servicios y actividades', [
                ('Servicios disponibles', servicios),
                ('Actividades', actividades),
            ]),
            self._fields_section('Metadatos del registro', [
                ('Fecha de creación', _fmt_dt(meta.get('creado_en'))),
                ('Fecha de actualización', _fmt_dt(meta.get('actualizado_en'))),
                ('ID del registro', data.get('id')),
            ]),
        ]
        ficha['images'] = _list_images('atractivo', atractivo_id)
        return ficha

    def datos_ruta(self, ruta_id: int) -> Dict[str, Any]:
        data = DjangoRutaAdminRepository().obtener_para_edicion(ruta_id)
        if not data:
            raise ValueError('Ruta no encontrada.')

        ruta = Ruta.objects.select_related('parroquia', 'estado_publicacion').filter(id=ruta_id).first()
        g = data.get('general') or {}
        meta = data.get('meta') or {}
        puntos = data.get('puntos_interes') or []

        atractivos_txt = '\n'.join(
            f"{p.get('orden', '—')}. {p.get('nombre', 'Sin nombre')}"
            for p in puntos
        ) if puntos else None

        ficha = self._build_ficha_base('ruta', 'Ruta turística', g.get('nombre'))
        ficha['sections'] = [
            self._fields_section('Información general', [
                ('Nombre de la ruta', g.get('nombre')),
                ('Parroquia', meta.get('parroquia')),
                ('Estado de publicación', meta.get('estado_publicacion')),
                ('Registro activo', ruta.activo if ruta else None),
                ('Destacado', ruta.destacado if ruta else None),
                ('Visitas', meta.get('visitas')),
            ]),
            self._text_section('Descripción', [
                ('Descripción', g.get('descripcion')),
            ]),
            self._fields_section('Características de la ruta', [
                ('Distancia (km)', g.get('distancia_km')),
                ('Duración estimada', g.get('duracion_estimada')),
                ('Nivel de dificultad', g.get('dificultad')),
                ('Punto de inicio', g.get('punto_inicio')),
                ('Punto de fin', g.get('punto_fin')),
            ]),
            self._fields_section('Ubicación y mapa', [
                ('Latitud inicio', float(ruta.lat_inicio) if ruta and ruta.lat_inicio is not None else None),
                ('Longitud inicio', float(ruta.lon_inicio) if ruta and ruta.lon_inicio is not None else None),
                ('Coordenadas inicio', (
                    f"{float(ruta.lat_inicio)}, {float(ruta.lon_inicio)}"
                    if ruta and ruta.lat_inicio is not None and ruta.lon_inicio is not None
                    else None
                )),
                ('Latitud fin', float(ruta.lat_fin) if ruta and ruta.lat_fin is not None else None),
                ('Longitud fin', float(ruta.lon_fin) if ruta and ruta.lon_fin is not None else None),
                ('Coordenadas fin', (
                    f"{float(ruta.lat_fin)}, {float(ruta.lon_fin)}"
                    if ruta and ruta.lat_fin is not None and ruta.lon_fin is not None
                    else None
                )),
            ]),
            self._text_section('Atractivos incluidos en la ruta', [
                ('Orden de recorrido', atractivos_txt),
            ]),
            self._fields_section('Metadatos del registro', [
                ('Fecha de creación', _fmt_dt(meta.get('creado_en'))),
                ('Fecha de actualización', _fmt_dt(meta.get('actualizado_en'))),
                ('ID del registro', data.get('id')),
                ('GeoJSON disponible', 'Sí' if data.get('geojson_ruta') else 'No'),
            ]),
        ]
        ficha['images'] = _list_images('ruta', ruta_id)
        return ficha

    def datos_emprendimiento(self, emprendimiento_id: int) -> Dict[str, Any]:
        data = DjangoEmprendimientoAdminRepository().obtener_para_edicion(emprendimiento_id)
        if not data:
            raise ValueError('Emprendimiento no encontrado.')

        item = Emprendimiento.objects.select_related('categoria', 'parroquia', 'creado_por').filter(
            id=emprendimiento_id
        ).first()
        g = data.get('general') or {}
        u = data.get('ubicacion') or {}
        meta = data.get('meta') or {}

        servicios = ', '.join(s['nombre'] for s in (data.get('servicios') or [])) or None
        redes = '\n'.join(
            f"{r.get('nombre_red') or 'Red'}: {r.get('url')}"
            for r in (data.get('redes_sociales') or [])
        ) or None

        relaciones_lines = []
        for rel in data.get('relaciones') or []:
            partes = []
            if rel.get('atractivo_id'):
                partes.append(f"Atractivo ID {rel['atractivo_id']}")
            if rel.get('ruta_id'):
                partes.append(f"Ruta ID {rel['ruta_id']}")
            if rel.get('distancia_referencial') is not None:
                partes.append(f"Dist. {rel['distancia_referencial']} km")
            if rel.get('descripcion'):
                partes.append(rel['descripcion'])
            if partes:
                relaciones_lines.append(' · '.join(partes))
        relaciones_txt = '\n'.join(relaciones_lines) if relaciones_lines else None

        propietario = None
        if item and item.creado_por_id:
            propietario = item.creado_por.nombre_completo or item.creado_por.username

        ficha = self._build_ficha_base('emprendimiento', 'Emprendimiento turístico', g.get('nombre'))
        ficha['sections'] = [
            self._fields_section('Información general', [
                ('Nombre', g.get('nombre')),
                ('Tipo / Categoría', meta.get('categoria')),
                ('Parroquia', meta.get('parroquia')),
                ('Estado de publicación', meta.get('estado_publicacion')),
                ('Registro activo', item.activo if item else None),
                ('Propietario / registrado por', propietario),
                ('Destacado', item.destacado if item else None),
                ('Visitas', getattr(item, 'visitas', None) if item else None),
            ]),
            self._text_section('Descripción', [
                ('Descripción', g.get('descripcion')),
            ]),
            self._fields_section('Ubicación y horarios', [
                ('Dirección', g.get('direccion')),
                ('Latitud', u.get('latitud')),
                ('Longitud', u.get('longitud')),
                ('Altitud (m)', u.get('altitud')),
                ('Coordenadas', (
                    f"{u['latitud']}, {u['longitud']}"
                    if u.get('latitud') is not None and u.get('longitud') is not None
                    else None
                )),
                ('Horario de atención', g.get('horario')),
            ]),
            self._fields_section('Contacto y presencia digital', [
                ('Teléfono', g.get('telefono')),
                ('Correo electrónico', g.get('email')),
                ('Sitio web', g.get('sitio_web')),
            ]),
            self._text_section('Redes sociales', [
                ('Cuentas registradas', redes),
            ]),
            self._fields_section('Servicios ofrecidos', [
                ('Servicios', servicios),
            ]),
            self._text_section('Relaciones turísticas', [
                ('Atractivos / rutas relacionados', relaciones_txt),
            ]),
            self._fields_section('Metadatos del registro', [
                ('Fecha de creación', _fmt_dt(meta.get('creado_en'))),
                ('Fecha de actualización', _fmt_dt(meta.get('actualizado_en'))),
                ('ID del registro', data.get('id')),
            ]),
        ]
        ficha['images'] = _list_images('emprendimiento', emprendimiento_id)
        return ficha

    def obtener_datos(self, tipo: str, entity_id: int) -> Dict[str, Any]:
        tipo = (tipo or '').lower()
        if tipo == 'atractivo':
            return self.datos_atractivo(entity_id)
        if tipo == 'ruta':
            return self.datos_ruta(entity_id)
        if tipo == 'emprendimiento':
            return self.datos_emprendimiento(entity_id)
        raise ValueError('Tipo de ficha no soportado.')

    def generar(
        self,
        tipo: str,
        entity_id: int,
        formato: str = 'pdf',
    ) -> Tuple[bytes, str, str]:
        fmt = (formato or 'pdf').lower()
        if fmt not in FORMATOS_VALIDOS:
            raise ValueError('Formato no válido. Use pdf o word.')

        ficha = self.obtener_datos(tipo, entity_id)
        prefix_map = {
            'atractivo': 'Atractivo',
            'ruta': 'Ruta',
            'emprendimiento': 'Emprendimiento',
        }
        prefix = prefix_map.get(tipo, 'Registro')

        if fmt == 'pdf':
            content = FichaPdfBuilder(ficha).build()
            filename = _slug_filename(prefix, ficha['titulo'], 'pdf')
            return content, filename, 'application/pdf'

        try:
            content = FichaWordBuilder(ficha).build()
        except ImportError as exc:
            raise ValueError(
                'Exportación Word no disponible. Instale python-docx: pip install python-docx'
            ) from exc
        filename = _slug_filename(prefix, ficha['titulo'], 'docx')
        return content, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

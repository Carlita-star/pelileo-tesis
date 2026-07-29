"""
Validación de formularios del panel administrativo.
"""

import re
from typing import Any

from django.core.exceptions import ValidationError

from src.application.dto.atractivo_dto import AtractivoCompleteDTO
from src.application.dto.emprendimiento_dto import EmprendimientoCompleteDTO
from src.application.dto.ruta_dto import RutaCompleteDTO
from src.domain.shared.field_validation import (
    FormValidationError,
    collect_errors,
    es_texto_relleno,
    validar_color_hex,
    validar_decimal,
    validar_descripcion,
    validar_email,
    validar_entero,
    validar_id_requerido,
    validar_latitud,
    validar_longitud,
    validar_slug,
    validar_telefono_ec,
    validar_texto_ciudad,
    validar_texto_libre,
    validar_texto_nombre,
    validar_url,
)
from src.domain.shared.validators import validar_password_segura, validar_ruc_ecuador


def _validar_galeria_publicacion(
    errors: dict[str, str],
    *,
    entidad_tipo: str,
    entidad_id: int | None,
    publicar: bool,
    field_key: str = 'galeria',
) -> None:
    if not publicar:
        return
    if not entidad_id:
        errors[field_key] = 'Guarde el registro como borrador, suba al menos una imagen y luego publíquelo.'
        return
    from src.domain.multimedia.models import Multimedia
    tiene_imagenes = Multimedia.objects.filter(
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
        activo=True,
    ).exists()
    if not tiene_imagenes:
        errors[field_key] = 'Debe seleccionar al menos una imagen.'


def _raise_if_errors(errors: dict[str, str]) -> None:
    if errors:
        raise FormValidationError(errors)


def validar_atractivo_form(dto: AtractivoCompleteDTO, *, publicar: bool = False) -> None:
    g = dto.general
    u = dto.ubicacion
    a = dto.administracion
    publish = publicar or dto.estado_publicacion_codigo == 'publicado'

    errors = collect_errors([
        ('general.nombre', lambda: validar_texto_nombre(g.nombre, 'Nombre del atractivo', min_len=5, max_len=100)),
        ('general.slug', lambda: validar_slug(g.slug)),
        ('general.categoria_id', lambda: validar_id_requerido(g.categoria_id, 'Categoría')),
        ('general.parroquia_id', lambda: validar_id_requerido(g.parroquia_id, 'Parroquia')),
        ('general.descripcion', lambda: validar_descripcion(g.descripcion, required=True)),
        ('general.direccion', lambda: validar_texto_libre(g.direccion, 'Dirección', max_len=200) if g.direccion else None),
        ('general.horario', lambda: validar_texto_libre(g.horario, 'Horario', max_len=120) if g.horario else None),
        ('general.precio_referencial', lambda: validar_decimal(
            g.precio_referencial, 'Precio referencial', min_value=0, max_value=999999
        ) if g.precio_referencial is not None else None),
        ('ubicacion.latitud', lambda: validar_latitud(u.latitud, required=publish)),
        ('ubicacion.longitud', lambda: validar_longitud(u.longitud, required=publish)),
        ('ubicacion.altitud', lambda: validar_decimal(
            u.altitud, 'Altitud', min_value=-500, max_value=6500
        ) if u.altitud is not None else None),
        ('administracion.nombre_administrador', lambda: validar_texto_nombre(
            a.nombre_administrador, 'Nombre del administrador', required=False
        ) if a.nombre_administrador else None),
        ('administracion.institucion_responsable', lambda: validar_texto_libre(
            a.institucion_responsable, 'Institución responsable', min_len=3, max_len=120
        ) if a.institucion_responsable else None),
        ('administracion.cargo', lambda: validar_texto_libre(
            a.cargo, 'Cargo', min_len=2, max_len=80
        ) if a.cargo else None),
        ('administracion.telefono', lambda: validar_telefono_ec(a.telefono) if a.telefono else None),
        ('administracion.correo', lambda: validar_email(a.correo) if a.correo else None),
        ('accesibilidad.distancia_referencial_km', lambda: validar_decimal(
            dto.accesibilidad.distancia_referencial_km,
            'Distancia referencial (km)',
            min_value=0,
            max_value=9999,
        ) if dto.accesibilidad.distancia_referencial_km is not None else None),
        ('conservacion.distancia_centro_salud_km', lambda: validar_decimal(
            dto.conservacion.distancia_centro_salud_km,
            'Distancia al centro de salud (km)',
            min_value=0,
            max_value=999,
        ) if dto.conservacion.distancia_centro_salud_km is not None else None),
    ])
    _validar_galeria_publicacion(
        errors,
        entidad_tipo='atractivo',
        entidad_id=dto.id,
        publicar=publish,
    )
    _raise_if_errors(errors)


def validar_ruta_form(dto: RutaCompleteDTO, *, publicar: bool = False) -> None:
    g = dto.general
    publish = publicar or dto.estado_publicacion_codigo == 'publicado'
    dificultades = {'facil', 'moderado', 'dificil'}

    errors = collect_errors([
        ('general.nombre', lambda: validar_texto_nombre(g.nombre, 'Nombre de la ruta', min_len=5, max_len=100)),
        ('general.parroquia_id', lambda: validar_id_requerido(g.parroquia_id, 'Parroquia')),
        ('general.descripcion', lambda: validar_descripcion(g.descripcion, required=True)),
        ('general.distancia_km', lambda: validar_decimal(
            g.distancia_km, 'Distancia (km)', min_value=0.1, max_value=9999, required=publish
        ) if publish or g.distancia_km is not None else None),
        ('general.duracion_estimada', lambda: validar_texto_libre(
            g.duracion_estimada, 'Duración estimada', min_len=3, max_len=50
        ) if g.duracion_estimada else None),
        ('general.punto_inicio', lambda: validar_texto_libre(
            g.punto_inicio, 'Punto de inicio', min_len=3, max_len=120
        ) if g.punto_inicio else None),
        ('general.punto_fin', lambda: validar_texto_libre(
            g.punto_fin, 'Punto final', min_len=3, max_len=120
        ) if g.punto_fin else None),
    ])

    if not g.dificultad:
        errors['general.dificultad'] = 'La dificultad es obligatoria.'
    elif g.dificultad not in dificultades:
        errors['general.dificultad'] = 'Seleccione una dificultad válida (fácil, moderado o difícil).'

    if publish and len(dto.atractivos_orden or []) < 2:
        errors['atractivos_orden'] = 'Debe asociar al menos 2 atractivos para publicar la ruta.'

    _validar_galeria_publicacion(
        errors,
        entidad_tipo='ruta',
        entidad_id=dto.id,
        publicar=publish,
    )
    _raise_if_errors(errors)


def validar_emprendimiento_form(dto: EmprendimientoCompleteDTO, *, publicar: bool = False) -> None:
    g = dto.general
    u = dto.ubicacion
    publish = publicar or dto.estado_publicacion_codigo == 'publicado'

    errors = collect_errors([
        ('general.nombre', lambda: validar_texto_nombre(g.nombre, 'Nombre del emprendimiento', min_len=4, max_len=100)),
        ('general.parroquia_id', lambda: validar_id_requerido(g.parroquia_id, 'Parroquia')),
        ('general.descripcion', lambda: validar_descripcion(g.descripcion, required=True)),
        ('general.direccion', lambda: validar_texto_libre(g.direccion, 'Dirección', min_len=5, max_len=200) if g.direccion else None),
        ('general.telefono', lambda: validar_telefono_ec(g.telefono, required=publish) if publish or g.telefono else None),
        ('general.email', lambda: validar_email(g.email) if g.email else None),
        ('general.sitio_web', lambda: validar_url(g.sitio_web, 'Sitio web') if g.sitio_web else None),
        ('general.horario', lambda: validar_texto_libre(g.horario, 'Horario', max_len=120) if g.horario else None),
        ('ubicacion.latitud', lambda: validar_latitud(u.latitud, required=publish)),
        ('ubicacion.longitud', lambda: validar_longitud(u.longitud, required=publish)),
    ])
    _validar_galeria_publicacion(
        errors,
        entidad_tipo='emprendimiento',
        entidad_id=dto.id,
        publicar=publish,
    )
    _raise_if_errors(errors)


def validar_configuracion_form(payload: dict) -> None:
    empresa = payload.get('empresa') or {}
    apariencia = payload.get('apariencia') or {}
    header = payload.get('header') or {}
    footer = payload.get('footer') or {}
    menus = payload.get('menus') or []
    redes = payload.get('redes') or []

    def _normalize_url(value: Any) -> str:
        text = (value or '').strip() if value is not None else ''
        if not text:
            return ''
        if text.lower().startswith(('http://', 'https://')):
            return text
        return f'https://{text}'

    errors = collect_errors([
        ('empresa.nombre', lambda: validar_texto_libre(
            empresa.get('nombre'), 'Nombre institucional', min_len=5, max_len=200, required=True
        )),
        ('empresa.nombre_comercial', lambda: validar_texto_libre(
            empresa.get('nombre_comercial'), 'Nombre comercial', min_len=3, max_len=100, required=True
        )),
        ('empresa.ruc', lambda: validar_ruc_ecuador(_only_digits(empresa.get('ruc'))) if empresa.get('ruc') else None),
        ('empresa.email', lambda: validar_email(empresa.get('email'), required=True)),
        ('empresa.telefono', lambda: validar_telefono_ec(empresa.get('telefono'), required=True)),
        ('empresa.celular', lambda: validar_telefono_ec(empresa.get('celular')) if empresa.get('celular') else None),
        ('empresa.sitio_web', lambda: validar_url(_normalize_url(empresa.get('sitio_web')), 'Sitio web') if empresa.get('sitio_web') else None),
        ('empresa.descripcion', lambda: validar_descripcion(empresa.get('descripcion'), min_len=20, max_len=1000)),
        ('empresa.mision', lambda: validar_descripcion(
            empresa.get('mision'), 'Misión', min_len=20, max_len=1000, required=False
        ) if empresa.get('mision') else None),
        ('empresa.vision', lambda: validar_descripcion(
            empresa.get('vision'), 'Visión', min_len=20, max_len=1000, required=False
        ) if empresa.get('vision') else None),
        ('apariencia.color_primario', lambda: validar_color_hex(apariencia.get('color_primario'), 'Color primario')),
        ('apariencia.color_secundario', lambda: validar_color_hex(apariencia.get('color_secundario'), 'Color secundario')),
        ('apariencia.color_terciario', lambda: validar_color_hex(apariencia.get('color_terciario'), 'Color terciario')),
        ('apariencia.tamano_fuente_base', lambda: validar_entero(
            apariencia.get('tamano_fuente_base'), 'Tamaño de fuente', min_value=12, max_value=30, required=True
        )),
        ('apariencia.borde_radio', lambda: validar_entero(
            apariencia.get('borde_radio'), 'Borde redondeado', min_value=0, max_value=32, required=True
        )),
        ('header.texto_superior', lambda: validar_texto_libre(
            header.get('texto_superior'), 'Texto del encabezado', min_len=3, max_len=120, required=True
        )),
        ('header.altura_header', lambda: validar_entero(
            header.get('altura_header'), 'Altura del encabezado', min_value=48, max_value=160, required=True
        )),
        ('footer.descripcion', lambda: validar_descripcion(
            footer.get('descripcion'), 'Descripción del pie', min_len=10, max_len=500, required=False
        ) if footer.get('descripcion') else None),
        ('footer.copyright_texto', lambda: validar_texto_libre(
            footer.get('copyright_texto'), 'Copyright', min_len=5, max_len=200, required=False
        ) if footer.get('copyright_texto') else None),
    ])

    for index, menu in enumerate(menus):
        if menu.get('visible') is False:
            continue
        try:
            validar_texto_libre(menu.get('nombre'), 'Nombre del menú', min_len=2, max_len=40, required=True)
            validar_texto_libre(menu.get('ruta'), 'Ruta del menú', min_len=1, max_len=120, required=True)
        except ValidationError as exc:
            errors[f'menus.{index}'] = exc.messages[0]

    for index, red in enumerate(redes):
        url = (red.get('url') or '').strip()
        nombre = (red.get('nombre') or '').strip()
        if not url and not nombre:
            continue
        if not url:
            errors[f'redes.{index}'] = 'Ingrese la URL de la red social.'
            continue
        try:
            validar_texto_libre(nombre, 'Nombre de red social', min_len=2, max_len=40, required=True)
            validar_url(_normalize_url(url), 'URL de red social', required=True)
        except ValidationError as exc:
            errors[f'redes.{index}'] = exc.messages[0]

    if apariencia.get('color_primario') and apariencia.get('color_secundario'):
        if apariencia['color_primario'].upper() == apariencia['color_secundario'].upper():
            errors['apariencia.color_secundario'] = 'El color secundario debe ser diferente al primario.'

    _raise_if_errors(errors)


def validar_registro_usuario(data: dict) -> None:
    errors = collect_errors([
        ('nombres', lambda: validar_texto_nombre(data.get('nombres'), 'Nombres', min_len=2, max_len=50)),
        ('apellidos', lambda: validar_texto_nombre(data.get('apellidos'), 'Apellidos', min_len=2, max_len=50)),
        ('username', lambda: _validar_username(data.get('username'))),
        ('email', lambda: validar_email(data.get('email'), required=True)),
        ('password', lambda: _validar_password_registro(data.get('password'))),
    ])
    _raise_if_errors(errors)


def _only_digits(value) -> str:
    return ''.join(ch for ch in str(value or '') if ch.isdigit())


def _validar_username(value) -> str:
    text = (value or '').strip()
    if len(text) < 4 or len(text) > 30:
        raise ValidationError('El usuario debe tener entre 4 y 30 caracteres.')
    if not re.match(r'^[a-zA-Z0-9._-]+$', text):
        raise ValidationError('El usuario solo puede contener letras, números, punto, guion y guion bajo.')
    if es_texto_relleno(text):
        raise ValidationError('El nombre de usuario no es válido.')
    return text


def _validar_password_registro(value) -> str:
    return validar_password_segura(value or '')

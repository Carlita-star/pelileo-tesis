from django.conf import settings

from src.domain.empresa.models import (
    AparienciaSistema,
    Configuracion,
    ConfiguracionFooter,
    ConfiguracionHeader,
    Empresa,
    MenuNavegacion,
    RedSocial,
)


def _media_url(path: str | None) -> str | None:
    if not path:
        return None
    if path.startswith('http'):
        return path
    base = settings.MEDIA_URL.rstrip('/')
    clean = path.lstrip('/')
    return f'{base}/{clean}'


def _serialize_menu(item: MenuNavegacion) -> dict:
    return {
        'id': item.id,
        'nombre': item.nombre,
        'ruta': item.ruta,
        'icono': item.icono,
        'orden': item.orden,
        'visible': item.visible,
        'tipo_enlace': item.tipo_enlace,
        'abierto_nueva_pestana': item.abierto_nueva_pestana,
        'menu_padre_id': item.menu_padre_id,
    }


def _serialize_red(item: RedSocial) -> dict:
    return {
        'id': item.id,
        'nombre': item.nombre,
        'icono': item.icono,
        'url': item.url,
        'activo': item.activo,
    }


def _build_portal_payload(empresa, apariencia, header, footer, menus, redes) -> dict:
    primario = (apariencia.color_primario if apariencia else None) or '#1D9E75'
    secundario = (apariencia.color_secundario if apariencia else None) or '#F9A825'

    menu_items = [
        {'etiqueta': m.nombre, 'ruta': m.ruta or '/'}
        for m in menus
        if m.visible
    ]

    redes_items = [
        {'nombre': r.nombre or r.icono or 'Red', 'url': r.url}
        for r in redes
        if r.activo
    ]

    return {
        'nombreSistema': empresa.nombre_comercial or empresa.nombre,
        'eslogan': (header.texto_superior if header else None) or 'Turismo · GAD Municipal',
        'logoUrl': _media_url(empresa.logo_principal),
        'logoSecundarioUrl': _media_url(empresa.logo_secundario),
        'faviconUrl': _media_url(empresa.favicon),
        'descripcion': empresa.descripcion,
        'historia': empresa.historia,
        'mision': empresa.mision,
        'vision': empresa.vision,
        'colores': {
            'primario': primario,
            'primarioOscuro': primario,
            'secundario': secundario,
            'terciario': (apariencia.color_terciario if apariencia else None) or secundario,
        },
        'tipografia': {
            'fuentePrincipal': (apariencia.fuente_principal if apariencia else None) or 'Inter, sans-serif',
            'fuenteSecundaria': (apariencia.fuente_secundaria if apariencia else None) or 'Inter, sans-serif',
            'tamanoBase': (apariencia.tamano_fuente_base if apariencia else None) or 16,
            'bordeRadio': (apariencia.borde_radio if apariencia else None) or 10,
            'modoOscuro': bool(apariencia.modo_oscuro) if apariencia else False,
            'sombraGlobal': bool(apariencia.sombra_global) if apariencia else True,
        },
        'header': {
            'mostrarLogo': header.mostrar_logo if header else True,
            'mostrarMenu': header.mostrar_menu if header else True,
            'mostrarBuscador': header.mostrar_buscador if header else False,
            'mostrarRedes': header.mostrar_redes if header else False,
            'textoSuperior': header.texto_superior if header else '',
            'colorFondo': (header.color_fondo if header else None) or '#ffffff',
            'colorTexto': (header.color_texto if header else None) or '#1e293b',
            'altura': (header.altura_header if header else None) or 72,
            'sticky': header.sticky if header else True,
        },
        'footer': {
            'titulo': empresa.nombre_comercial or empresa.nombre,
            'descripcion': (footer.descripcion if footer else None) or empresa.descripcion or '',
            'copyright': (footer.copyright_texto if footer else None) or f'© {empresa.nombre_comercial or empresa.nombre}',
            'mostrarRedes': footer.mostrar_redes if footer else True,
            'mostrarContacto': footer.mostrar_contacto if footer else True,
            'mostrarMapa': footer.mostrar_mapa if footer else False,
            'colorFondo': (footer.color_fondo if footer else None) or '#1e293b',
            'colorTexto': (footer.color_texto if footer else None) or '#cbd5e1',
            'contacto': {
                'ciudad': ', '.join(filter(None, [empresa.parroquia, empresa.canton, empresa.provincia])) or 'Pelileo, Tungurahua',
                'web': empresa.sitio_web or '',
                'email': empresa.email or '',
                'telefono': empresa.telefono or empresa.celular or '',
                'direccion': empresa.direccion or '',
            },
        },
        'menu': menu_items,
        'redes': redes_items,
    }


class DjangoConfiguracionRepository:
    def obtener_o_crear_empresa(self) -> Empresa:
        empresa = Empresa.objects.first()
        if empresa:
            return empresa
        return Empresa.objects.create(
            nombre='Gobierno Autónomo Descentralizado Municipal de Pelileo',
            nombre_comercial='Pelileo Turismo',
            ruc='1790000000001',
            provincia='Tungurahua',
            canton='Pelileo',
            parroquia='Pelileo',
            descripcion='Portal turístico del cantón Pelileo.',
            estado=True,
        )

    def obtener_completa(self) -> dict:
        empresa = self.obtener_o_crear_empresa()
        apariencia = AparienciaSistema.objects.filter(empresa=empresa).first()
        header = empresa.headers.order_by('id').first()
        footer = empresa.footers.order_by('id').first()
        menus = list(empresa.menus.filter(menu_padre__isnull=True, visible=True).order_by('orden', 'id'))
        redes = list(empresa.redes_sociales.filter(activo=True).order_by('id'))
        configuraciones = list(empresa.configuraciones.all().order_by('clave'))

        data = {
            'empresa': {
                'id': empresa.id,
                'nombre': empresa.nombre,
                'nombre_comercial': empresa.nombre_comercial,
                'ruc': empresa.ruc,
                'telefono': empresa.telefono,
                'celular': empresa.celular,
                'email': empresa.email,
                'sitio_web': empresa.sitio_web,
                'direccion': empresa.direccion,
                'provincia': empresa.provincia,
                'canton': empresa.canton,
                'parroquia': empresa.parroquia,
                'descripcion': empresa.descripcion,
                'historia': empresa.historia,
                'mision': empresa.mision,
                'vision': empresa.vision,
                'logo_principal': empresa.logo_principal,
                'logo_secundario': empresa.logo_secundario,
                'favicon': empresa.favicon,
                'logo_principal_url': _media_url(empresa.logo_principal),
                'logo_secundario_url': _media_url(empresa.logo_secundario),
                'favicon_url': _media_url(empresa.favicon),
                'estado': empresa.estado,
            },
            'apariencia': None,
            'header': None,
            'footer': None,
            'menus': [_serialize_menu(m) for m in empresa.menus.order_by('orden', 'id')],
            'redes': [_serialize_red(r) for r in empresa.redes_sociales.order_by('id')],
            'configuraciones': [
                {
                    'clave': item.clave,
                    'valor': item.valor,
                    'descripcion': item.descripcion,
                    'tipo': item.tipo,
                    'editable': item.editable,
                }
                for item in configuraciones
            ],
        }

        if apariencia:
            data['apariencia'] = {
                'color_primario': apariencia.color_primario,
                'color_secundario': apariencia.color_secundario,
                'color_terciario': apariencia.color_terciario,
                'fuente_principal': apariencia.fuente_principal,
                'fuente_secundaria': apariencia.fuente_secundaria,
                'tamano_fuente_base': apariencia.tamano_fuente_base,
                'modo_oscuro': apariencia.modo_oscuro,
                'borde_radio': apariencia.borde_radio,
                'sombra_global': apariencia.sombra_global,
            }

        if header:
            data['header'] = {
                'mostrar_logo': header.mostrar_logo,
                'mostrar_menu': header.mostrar_menu,
                'mostrar_buscador': header.mostrar_buscador,
                'mostrar_redes': header.mostrar_redes,
                'texto_superior': header.texto_superior,
                'color_fondo': header.color_fondo,
                'color_texto': header.color_texto,
                'altura_header': header.altura_header,
                'sticky': header.sticky,
            }

        if footer:
            data['footer'] = {
                'descripcion': footer.descripcion,
                'mostrar_redes': footer.mostrar_redes,
                'mostrar_contacto': footer.mostrar_contacto,
                'mostrar_mapa': footer.mostrar_mapa,
                'copyright_texto': footer.copyright_texto,
                'color_fondo': footer.color_fondo,
                'color_texto': footer.color_texto,
            }

        data['portal'] = _build_portal_payload(empresa, apariencia, header, footer, menus, redes)
        return data

    def guardar(self, payload: dict) -> dict:
        empresa_data = payload.get('empresa', {})
        empresa = self.obtener_o_crear_empresa()

        for field in (
            'nombre', 'nombre_comercial', 'ruc', 'telefono', 'celular', 'email',
            'sitio_web', 'direccion', 'provincia', 'canton', 'parroquia',
            'descripcion', 'historia', 'mision', 'vision', 'estado',
        ):
            if field in empresa_data:
                setattr(empresa, field, empresa_data[field])
        for logo_field in ('logo_principal', 'logo_secundario', 'favicon'):
            if logo_field in empresa_data:
                setattr(empresa, logo_field, empresa_data[logo_field])
        empresa.save()

        apariencia_data = payload.get('apariencia') or {}
        apariencia, _ = AparienciaSistema.objects.get_or_create(empresa=empresa)
        for field in (
            'color_primario', 'color_secundario', 'color_terciario',
            'fuente_principal', 'fuente_secundaria', 'tamano_fuente_base',
            'modo_oscuro', 'borde_radio', 'sombra_global',
        ):
            if field in apariencia_data:
                setattr(apariencia, field, apariencia_data[field])
        apariencia.save()

        header_data = payload.get('header') or {}
        header = empresa.headers.order_by('id').first()
        if not header:
            header = ConfiguracionHeader(empresa=empresa)
        for field in (
            'mostrar_logo', 'mostrar_menu', 'mostrar_buscador', 'mostrar_redes',
            'texto_superior', 'color_fondo', 'color_texto', 'altura_header', 'sticky',
        ):
            if field in header_data:
                setattr(header, field, header_data[field])
        header.save()

        footer_data = payload.get('footer') or {}
        footer = empresa.footers.order_by('id').first()
        if not footer:
            footer = ConfiguracionFooter(empresa=empresa)
        for field in (
            'descripcion', 'mostrar_redes', 'mostrar_contacto', 'mostrar_mapa',
            'copyright_texto', 'color_fondo', 'color_texto',
        ):
            if field in footer_data:
                setattr(footer, field, footer_data[field])
        footer.save()

        menus_data = payload.get('menus')
        if menus_data is not None:
            empresa.menus.all().delete()
            for index, item in enumerate(menus_data):
                MenuNavegacion.objects.create(
                    empresa=empresa,
                    nombre=item.get('nombre') or item.get('etiqueta') or 'Enlace',
                    ruta=item.get('ruta') or '/',
                    icono=item.get('icono'),
                    orden=item.get('orden', index),
                    visible=item.get('visible', True),
                    tipo_enlace=item.get('tipo_enlace'),
                    abierto_nueva_pestana=item.get('abierto_nueva_pestana', False),
                )

        redes_data = payload.get('redes')
        if redes_data is not None:
            empresa.redes_sociales.all().delete()
            for item in redes_data:
                if not item.get('url'):
                    continue
                RedSocial.objects.create(
                    empresa=empresa,
                    nombre=item.get('nombre'),
                    icono=item.get('icono'),
                    url=item['url'],
                    activo=item.get('activo', True),
                )

        return self.obtener_completa()

    def guardar_logo(self, campo: str, archivo) -> str:
        import os
        import uuid

        allowed = {'logo_principal', 'logo_secundario', 'favicon'}
        if campo not in allowed:
            raise ValueError('Campo de logo no válido.')

        empresa = self.obtener_o_crear_empresa()
        extension = os.path.splitext(archivo.name)[1] or '.png'
        filename = f'empresa/{empresa.id}/{campo}_{uuid.uuid4().hex}{extension}'
        destination = settings.MEDIA_ROOT / filename
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open('wb+') as target:
            for chunk in archivo.chunks():
                target.write(chunk)

        relative = filename.replace('\\', '/')
        setattr(empresa, campo, relative)
        empresa.save(update_fields=[campo, 'actualizado_en'])
        return relative

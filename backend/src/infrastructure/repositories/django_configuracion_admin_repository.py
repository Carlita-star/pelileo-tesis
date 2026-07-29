import os
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

from django.conf import settings

from src.application.ports.configuracion_admin_repository import ConfiguracionAdminRepositoryPort
from src.domain.apariencia.rules import AparienciaRules
from src.domain.auditorias.models import Auditoria
from src.domain.empresa.models import (
    AparienciaSistema,
    Configuracion,
    ConfiguracionFooter,
    ConfiguracionHeader,
    Empresa,
    MenuNavegacion,
    RedSocial,
)

MENU_DEFAULT = [
    ('Inicio', '/'),
    ('Atractivos', '/atractivos'),
    ('Rutas', '/rutas'),
    ('Emprendimientos', '/emprendimientos'),
    ('Eventos', '/eventos'),
]

IMAGEN_TIPOS = ('logo_principal', 'logo_secundario', 'favicon', 'imagen_seccion_inicio')
# Imágenes guardadas en tabla configuraciones (clave/valor), sin columna nueva en empresas.
IMAGEN_CONFIG_TIPOS = ('imagen_seccion_inicio',)


class DjangoConfiguracionAdminRepository(ConfiguracionAdminRepositoryPort):

    @staticmethod
    def _media_url(path: Optional[str]) -> Optional[str]:
        if not path:
            return None
        if path.startswith('http://') or path.startswith('https://'):
            return path
        base = settings.MEDIA_URL.rstrip('/')
        return f'{base}/{path.lstrip("/")}'

    @staticmethod
    def _registrar_auditoria(actor_id: Optional[int], accion: str, datos: Optional[dict] = None) -> None:
        Auditoria.objects.create(
            usuario_id=actor_id,
            tabla_afectada='configuracion',
            entidad_id=1,
            accion=accion,
            datos_nuevos=datos,
        )

    def _get_config_valor(self, empresa: Empresa, clave: str, default: str = '') -> str:
        cfg = Configuracion.objects.filter(empresa=empresa, clave=clave).first()
        return cfg.valor if cfg and cfg.valor else default

    def _set_config_valor(self, empresa: Empresa, clave: str, valor: str, descripcion: str = '') -> None:
        Configuracion.objects.update_or_create(
            clave=clave,
            defaults={
                'empresa': empresa,
                'valor': valor,
                'descripcion': descripcion,
                'tipo': 'texto',
                'editable': True,
            },
        )

    def _get_or_create_header(self, empresa: Empresa) -> ConfiguracionHeader:
        header = empresa.headers.order_by('id').first()
        if not header:
            header = ConfiguracionHeader.objects.create(
                empresa=empresa,
                color_fondo='#0f172a',
                color_texto='#ffffff',
                mostrar_buscador=False,
                mostrar_redes=False,
            )
        return header

    def _get_or_create_footer(self, empresa: Empresa) -> ConfiguracionFooter:
        footer = empresa.footers.order_by('id').first()
        if not footer:
            footer = ConfiguracionFooter.objects.create(
                empresa=empresa,
                color_fondo='#0f172a',
                color_texto='#e2e8f0',
            )
        return footer

    def _get_or_create_apariencia(self, empresa: Empresa) -> AparienciaSistema:
        apariencia, _ = AparienciaSistema.objects.get_or_create(
            empresa=empresa,
            defaults={
                'color_primario': '#1D9E75',
                'color_secundario': '#F9A825',
                'color_terciario': '#1D74F2',
                'fuente_principal': 'Inter, sans-serif',
                'tamano_fuente_base': 16,
                'borde_radio': 10,
            },
        )
        return apariencia

    def _seed_menu_default(self, empresa: Empresa) -> None:
        if empresa.menus.exists():
            return
        for orden, (nombre, ruta) in enumerate(MENU_DEFAULT):
            MenuNavegacion.objects.create(
                empresa=empresa,
                nombre=nombre,
                ruta=ruta,
                orden=orden,
                visible=True,
            )

    def _get_or_create_empresa(self) -> Empresa:
        empresa = Empresa.objects.first()
        if empresa:
            self._seed_menu_default(empresa)
            return empresa

        empresa = Empresa.objects.create(
            nombre='GAD Municipal de Pelileo',
            nombre_comercial='Turismo Pelileo',
            ruc='1790000000001',
            telefono='032851234',
            email='turismo@pelileo.gob.ec',
            direccion='Av. Principal, San Pedro de Pelileo',
            provincia='Tungurahua',
            canton='Pelileo',
            parroquia='Pelileo',
            descripcion='Portal turístico del cantón San Pedro de Pelileo.',
            mision='Promover el turismo sostenible del cantón.',
            vision='Ser referente turístico en la región central del Ecuador.',
            latitud=Decimal('-1.32890000'),
            longitud=Decimal('-78.54250000'),
        )
        self._get_or_create_apariencia(empresa)
        self._get_or_create_header(empresa)
        self._get_or_create_footer(empresa)
        self._set_config_valor(empresa, 'eslogan', 'Turismo · GAD Municipal')
        self._seed_menu_default(empresa)
        return empresa

    def _serializar_empresa(self, empresa: Empresa) -> dict:
        return {
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
            'logo_principal_url': self._media_url(empresa.logo_principal),
            'logo_secundario_url': self._media_url(empresa.logo_secundario),
            'favicon_url': self._media_url(empresa.favicon),
            'imagen_seccion_inicio_url': self._media_url(
                self._get_config_valor(empresa, 'imagen_seccion_inicio')
            ),
            'latitud': float(empresa.latitud) if empresa.latitud is not None else None,
            'longitud': float(empresa.longitud) if empresa.longitud is not None else None,
            'eslogan': self._get_config_valor(empresa, 'eslogan', 'Turismo · GAD Municipal'),
            'estado': empresa.estado,
        }

    def _serializar_apariencia(self, apariencia: AparienciaSistema) -> dict:
        return {
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

    def _serializar_header(self, header: ConfiguracionHeader) -> dict:
        return {
            'id': header.id,
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

    def _serializar_footer(self, footer: ConfiguracionFooter) -> dict:
        return {
            'id': footer.id,
            'descripcion': footer.descripcion,
            'mostrar_redes': footer.mostrar_redes,
            'mostrar_contacto': footer.mostrar_contacto,
            'mostrar_mapa': footer.mostrar_mapa,
            'copyright_texto': footer.copyright_texto,
            'color_fondo': footer.color_fondo,
            'color_texto': footer.color_texto,
        }

    def _serializar_redes(self, empresa: Empresa) -> List[dict]:
        return [
            {
                'id': r.id,
                'nombre': r.nombre,
                'icono': r.icono,
                'url': r.url,
                'activo': r.activo,
            }
            for r in empresa.redes_sociales.order_by('id')
        ]

    def _serializar_menus_plano(self, empresa: Empresa) -> List[dict]:
        return [
            {
                'id': m.id,
                'nombre': m.nombre,
                'ruta': m.ruta,
                'icono': m.icono,
                'orden': m.orden,
                'visible': m.visible,
                'menu_padre_id': m.menu_padre_id,
                'tipo_enlace': m.tipo_enlace,
                'abierto_nueva_pestana': m.abierto_nueva_pestana,
            }
            for m in empresa.menus.order_by('orden', 'id')
        ]

    def obtener_completo(self) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        apariencia = self._get_or_create_apariencia(empresa)
        header = self._get_or_create_header(empresa)
        footer = self._get_or_create_footer(empresa)

        configuraciones = list(
            Configuracion.objects.filter(empresa=empresa).values(
                'clave', 'valor', 'descripcion', 'tipo', 'editable'
            )
        )

        return {
            'empresa': self._serializar_empresa(empresa),
            'apariencia': self._serializar_apariencia(apariencia),
            'header': self._serializar_header(header),
            'footer': self._serializar_footer(footer),
            'redes': self._serializar_redes(empresa),
            'menus': self._serializar_menus_plano(empresa),
            'configuraciones': configuraciones,
        }

    def obtener_para_portal(self) -> Dict[str, Any]:
        data = self.obtener_completo()
        empresa = data['empresa']
        apariencia = data['apariencia']
        header = data['header']
        footer = data['footer']

        menu_portal = []
        for m in data['menus']:
            if not m['visible'] or m['menu_padre_id']:
                continue
            submenus = [
                {'etiqueta': s['nombre'], 'ruta': s['ruta'] or '/'}
                for s in data['menus']
                if s['menu_padre_id'] == m['id'] and s['visible']
            ]
            entry = {'etiqueta': m['nombre'], 'ruta': m['ruta'] or '/'}
            if submenus:
                entry['submenus'] = submenus
            menu_portal.append(entry)

        redes_activas = [
            {'nombre': r['nombre'], 'url': r['url']}
            for r in data['redes']
            if r['activo'] and r['url']
        ]

        primario = apariencia.get('color_primario') or '#1D9E75'
        secundario = apariencia.get('color_secundario') or '#F9A825'
        terciario = apariencia.get('color_terciario') or '#2563EB'

        return {
            'empresa': empresa,
            'apariencia': apariencia,
            'header': header,
            'footer': footer,
            'menus': data['menus'],
            'redes_sociales': data['redes'],
            'configuraciones': data['configuraciones'],
            'nombreSistema': empresa.get('nombre_comercial') or empresa.get('nombre'),
            'eslogan': empresa.get('eslogan'),
            'descripcion': empresa.get('descripcion'),
            'historia': empresa.get('historia'),
            'mision': empresa.get('mision'),
            'vision': empresa.get('vision'),
            'logoUrl': empresa.get('logo_principal_url'),
            'logoSecundarioUrl': empresa.get('logo_secundario_url'),
            'faviconUrl': empresa.get('favicon_url'),
            'imagenSeccionInicioUrl': empresa.get('imagen_seccion_inicio_url'),
            'color_primario': primario,
            'color_secundario': secundario,
            'color_terciario': terciario,
            'fuente_principal': apariencia.get('fuente_principal'),
            'tamano_fuente_base': apariencia.get('tamano_fuente_base'),
            'modo_oscuro': apariencia.get('modo_oscuro'),
            'borde_radio': apariencia.get('borde_radio'),
            'menu': menu_portal,
            'redes': redes_activas,
            'latitud': empresa.get('latitud'),
            'longitud': empresa.get('longitud'),
        }

    def guardar_datos_gad(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        nombre = (payload.get('nombre') or '').strip()
        ruc = (payload.get('ruc') or '').strip()
        if not nombre:
            raise ValueError('El nombre institucional es obligatorio.')
        if not ruc:
            raise ValueError('El RUC es obligatorio.')

        duplicado = Empresa.objects.filter(ruc=ruc).exclude(id=empresa.id).exists()
        if duplicado:
            raise ValueError('Ya existe una empresa con ese RUC.')

        empresa.nombre = nombre
        empresa.nombre_comercial = (payload.get('nombre_comercial') or '').strip() or None
        empresa.ruc = ruc
        empresa.telefono = (payload.get('telefono') or '').strip() or None
        empresa.celular = (payload.get('celular') or '').strip() or None
        empresa.email = (payload.get('email') or '').strip() or None
        empresa.sitio_web = (payload.get('sitio_web') or '').strip() or None
        empresa.direccion = (payload.get('direccion') or '').strip() or None
        empresa.provincia = (payload.get('provincia') or '').strip() or None
        empresa.canton = (payload.get('canton') or '').strip() or None
        empresa.parroquia = (payload.get('parroquia') or '').strip() or None
        empresa.descripcion = (payload.get('descripcion') or '').strip() or None
        empresa.historia = (payload.get('historia') or '').strip() or None
        empresa.mision = (payload.get('mision') or '').strip() or None
        empresa.vision = (payload.get('vision') or '').strip() or None
        empresa.save()

        eslogan = (payload.get('eslogan') or '').strip()
        if eslogan:
            self._set_config_valor(empresa, 'eslogan', eslogan, 'Eslogan del portal')

        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'datos_gad'})
        return self.obtener_completo()

    def guardar_apariencia(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        apariencia = self._get_or_create_apariencia(empresa)

        color_primario = payload.get('color_primario') or apariencia.color_primario
        color_secundario = payload.get('color_secundario') or apariencia.color_secundario
        if color_primario and color_secundario:
            AparienciaRules.validar_colores_principales(color_primario, color_secundario)

        tamano = int(payload.get('tamano_fuente_base', apariencia.tamano_fuente_base))
        AparienciaRules.validar_tamano_fuente(tamano)

        borde = int(payload.get('borde_radio', apariencia.borde_radio))
        AparienciaRules.validar_radio_bordes(borde)

        apariencia.color_primario = color_primario
        apariencia.color_secundario = color_secundario
        apariencia.color_terciario = payload.get('color_terciario') or apariencia.color_terciario
        apariencia.fuente_principal = payload.get('fuente_principal') or apariencia.fuente_principal
        apariencia.fuente_secundaria = payload.get('fuente_secundaria') or apariencia.fuente_secundaria
        apariencia.tamano_fuente_base = tamano
        apariencia.modo_oscuro = bool(payload.get('modo_oscuro', apariencia.modo_oscuro))
        apariencia.borde_radio = borde
        apariencia.sombra_global = bool(payload.get('sombra_global', apariencia.sombra_global))
        apariencia.save()

        # Colores de header/footer se gestionan desde Apariencia (misma pantalla visual).
        header_colors = payload.get('header') or {}
        footer_colors = payload.get('footer') or {}
        if header_colors or footer_colors:
            header = self._get_or_create_header(empresa)
            footer = self._get_or_create_footer(empresa)
            if 'color_fondo' in header_colors:
                header.color_fondo = (header_colors.get('color_fondo') or '').strip() or None
            if 'color_texto' in header_colors:
                header.color_texto = (header_colors.get('color_texto') or '').strip() or None
            if 'color_fondo' in footer_colors:
                footer.color_fondo = (footer_colors.get('color_fondo') or '').strip() or None
            if 'color_texto' in footer_colors:
                footer.color_texto = (footer_colors.get('color_texto') or '').strip() or None
            header.save()
            footer.save()

        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'apariencia'})
        return self.obtener_completo()

    def guardar_redes(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        redes = payload.get('redes') or []
        ids_enviados = set()

        for item in redes:
            nombre = (item.get('nombre') or '').strip()
            url = (item.get('url') or '').strip()
            if not nombre or not url:
                continue
            red_id = item.get('id')
            if red_id:
                red = RedSocial.objects.filter(id=red_id, empresa=empresa).first()
                if red:
                    red.nombre = nombre
                    red.url = url
                    red.activo = bool(item.get('activo', True))
                    red.save()
                    ids_enviados.add(red.id)
            else:
                red = RedSocial.objects.create(
                    empresa=empresa,
                    nombre=nombre,
                    url=url,
                    activo=bool(item.get('activo', True)),
                )
                ids_enviados.add(red.id)

        RedSocial.objects.filter(empresa=empresa).exclude(id__in=ids_enviados).delete()
        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'redes'})
        return self.obtener_completo()

    def guardar_header_footer(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        header = self._get_or_create_header(empresa)
        footer = self._get_or_create_footer(empresa)

        header_data = payload.get('header') or {}
        header.mostrar_logo = bool(header_data.get('mostrar_logo', header.mostrar_logo))
        header.mostrar_menu = bool(header_data.get('mostrar_menu', header.mostrar_menu))
        header.mostrar_buscador = bool(header_data.get('mostrar_buscador', header.mostrar_buscador))
        header.mostrar_redes = bool(header_data.get('mostrar_redes', header.mostrar_redes))
        header.texto_superior = (header_data.get('texto_superior') or '').strip() or None
        header.sticky = bool(header_data.get('sticky', header.sticky))
        if 'color_fondo' in header_data:
            header.color_fondo = (header_data.get('color_fondo') or '').strip() or None
        if 'color_texto' in header_data:
            header.color_texto = (header_data.get('color_texto') or '').strip() or None
        if header_data.get('altura_header') is not None and header_data.get('altura_header') != '':
            try:
                header.altura_header = int(header_data.get('altura_header'))
            except (TypeError, ValueError):
                pass
        header.save()

        footer_data = payload.get('footer') or {}
        footer.descripcion = (footer_data.get('descripcion') or '').strip() or None
        footer.mostrar_redes = bool(footer_data.get('mostrar_redes', footer.mostrar_redes))
        footer.mostrar_contacto = bool(footer_data.get('mostrar_contacto', footer.mostrar_contacto))
        footer.mostrar_mapa = bool(footer_data.get('mostrar_mapa', footer.mostrar_mapa))
        footer.copyright_texto = (footer_data.get('copyright_texto') or '').strip() or None
        if 'color_fondo' in footer_data:
            footer.color_fondo = (footer_data.get('color_fondo') or '').strip() or None
        if 'color_texto' in footer_data:
            footer.color_texto = (footer_data.get('color_texto') or '').strip() or None
        footer.save()

        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'header_footer'})
        return self.obtener_completo()

    def guardar_menu(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        items = payload.get('items') or []
        ids_enviados = set()

        for idx, item in enumerate(items):
            nombre = (item.get('nombre') or '').strip()
            if not nombre:
                continue
            menu_id = item.get('id')
            fields = {
                'nombre': nombre,
                'ruta': (item.get('ruta') or '').strip() or None,
                'icono': (item.get('icono') or '').strip() or None,
                'orden': int(item.get('orden', idx)),
                'visible': bool(item.get('visible', True)),
                'menu_padre_id': item.get('menu_padre_id'),
                'tipo_enlace': (item.get('tipo_enlace') or '').strip() or None,
                'abierto_nueva_pestana': bool(item.get('abierto_nueva_pestana', False)),
            }
            if menu_id:
                menu = MenuNavegacion.objects.filter(id=menu_id, empresa=empresa).first()
                if menu:
                    for k, v in fields.items():
                        setattr(menu, k, v)
                    menu.save()
                    ids_enviados.add(menu.id)
            else:
                menu = MenuNavegacion.objects.create(empresa=empresa, **fields)
                ids_enviados.add(menu.id)

        MenuNavegacion.objects.filter(empresa=empresa).exclude(id__in=ids_enviados).delete()
        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'menu'})
        return self.obtener_completo()

    def guardar_mapa(self, payload: dict, actor_id: int) -> Dict[str, Any]:
        empresa = self._get_or_create_empresa()
        try:
            lat = payload.get('latitud')
            lng = payload.get('longitud')
            if lat is not None and lat != '':
                empresa.latitud = Decimal(str(lat))
            if lng is not None and lng != '':
                empresa.longitud = Decimal(str(lng))
            empresa.save(update_fields=['latitud', 'longitud', 'actualizado_en'])
        except (InvalidOperation, ValueError) as exc:
            raise ValueError('Coordenadas inválidas.') from exc

        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'mapa'})
        return self.obtener_completo()

    def guardar_imagen(self, tipo: str, archivo, actor_id: int) -> Dict[str, Any]:
        if tipo not in IMAGEN_TIPOS:
            raise ValueError('Tipo de imagen no válido.')
        if not archivo:
            raise ValueError('Debe enviar un archivo.')

        empresa = self._get_or_create_empresa()
        ext = os.path.splitext(archivo.name)[1].lower() or '.png'
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.ico', '.gif'):
            raise ValueError('Formato de imagen no permitido.')

        dest_dir = settings.MEDIA_ROOT / 'empresa'
        dest_dir.mkdir(parents=True, exist_ok=True)
        filename = f'{tipo}_{uuid.uuid4().hex[:8]}{ext}'
        filepath = dest_dir / filename

        with open(filepath, 'wb+') as dest:
            for chunk in archivo.chunks():
                dest.write(chunk)

        rel_path = f'empresa/{filename}'
        if tipo in IMAGEN_CONFIG_TIPOS:
            self._set_config_valor(
                empresa,
                tipo,
                rel_path,
                'Imagen de la sección Sobre Pelileo en el inicio del portal',
            )
        else:
            setattr(empresa, tipo, rel_path)
            empresa.save(update_fields=[tipo, 'actualizado_en'])

        self._registrar_auditoria(actor_id, 'EDITAR', {'seccion': 'identidad', 'tipo': tipo})
        return {
            'tipo': tipo,
            'path': rel_path,
            'url': self._media_url(rel_path),
            'empresa': self._serializar_empresa(empresa),
        }

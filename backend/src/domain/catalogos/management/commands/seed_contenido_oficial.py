"""
Carga el contenido oficial del documento GAD / ESPE
(CONTENIDO PAGINA WEB-PELILEO-ESPE-02) en la base de datos.

Uso:
  python manage.py seed_contenido_oficial
  python manage.py seed_contenido_oficial --dry-run
"""

from __future__ import annotations

import sys
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_datetime
from slug import slug as generate_slug

# data/contenido_oficial.py vive en backend/data/
_BACKEND_ROOT = Path(__file__).resolve().parents[5]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from data.contenido_oficial import (  # noqa: E402
    ATRACTIVOS,
    CATEGORIAS,
    CONFIG_PORTAL,
    EMPRENDIMIENTOS,
    EVENTOS,
    PARROQUIAS,
)

from src.domain.atractivos.models import Atractivo, AtractivoDetalle
from src.domain.catalogos.actividades import Actividad
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.parroquias import Parroquia
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.eventos.models import Evento
from src.domain.usuarios.models import Usuario


def _dec(value):
    if value is None or value == '':
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


class Command(BaseCommand):
    help = 'Carga atractivos, eventos y directorio oficial (sin fotos).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Solo muestra qué se crearía/actualizaría, sin guardar.',
        )
        parser.add_argument(
            '--username',
            default='',
            help='Usuario creador de atractivos (por defecto: primer staff/superuser).',
        )

    def handle(self, *args, **options):
        dry = options['dry_run']
        user = self._resolve_user(options['username'])
        if user is None:
            self.stderr.write(self.style.ERROR(
                'No hay usuario para asignar como creado_por. Cree un admin o use --username.'
            ))
            return

        publicado, _ = EstadoPublicacion.objects.get_or_create(
            codigo='publicado',
            defaults={'nombre': 'Publicado'},
        )

        stats = {
            'categorias': 0,
            'parroquias': 0,
            'atractivos_c': 0,
            'atractivos_u': 0,
            'eventos_c': 0,
            'eventos_u': 0,
            'emprendimientos_c': 0,
            'emprendimientos_u': 0,
        }

        with transaction.atomic():
            for nombre in CATEGORIAS:
                _, created = Categoria.objects.get_or_create(
                    nombre=nombre,
                    defaults={'activo': True},
                )
                if created:
                    stats['categorias'] += 1

            for nombre in PARROQUIAS:
                _, created = Parroquia.objects.get_or_create(
                    nombre=nombre,
                    defaults={
                        'canton': 'Pelileo',
                        'provincia': 'Tungurahua',
                        'activo': True,
                    },
                )
                if created:
                    stats['parroquias'] += 1

            for item in ATRACTIVOS:
                created = self._upsert_atractivo(item, publicado, user, dry)
                stats['atractivos_c' if created else 'atractivos_u'] += 1

            for item in EVENTOS:
                created = self._upsert_evento(item, publicado, dry)
                stats['eventos_c' if created else 'eventos_u'] += 1

            for item in EMPRENDIMIENTOS:
                created = self._upsert_emprendimiento(item, publicado, user, dry)
                stats['emprendimientos_c' if created else 'emprendimientos_u'] += 1

            if not dry:
                self._actualizar_config_portal()

            if dry:
                transaction.set_rollback(True)

        modo = 'DRY-RUN' if dry else 'OK'
        self.stdout.write(self.style.SUCCESS(
            f'[{modo}] Categorías nuevas: {stats["categorias"]} | '
            f'Parroquias nuevas: {stats["parroquias"]} | '
            f'Atractivos +{stats["atractivos_c"]}/~{stats["atractivos_u"]} | '
            f'Eventos +{stats["eventos_c"]}/~{stats["eventos_u"]} | '
            f'Emprendimientos +{stats["emprendimientos_c"]}/~{stats["emprendimientos_u"]}'
        ))
        self.stdout.write(
            'Fotos: agregar después desde el panel admin (galería multimedia).'
        )

    def _resolve_user(self, username: str):
        if username:
            return Usuario.objects.filter(username=username).first()
        return (
            Usuario.objects.filter(username='cjalomoto').first()
            or Usuario.objects.filter(activo=True).order_by('id').first()
        )

    def _categoria(self, nombre: str) -> Categoria:
        cat, _ = Categoria.objects.get_or_create(nombre=nombre, defaults={'activo': True})
        return cat

    def _parroquia(self, nombre: str) -> Parroquia:
        parroquia, _ = Parroquia.objects.get_or_create(
            nombre=nombre,
            defaults={'canton': 'Pelileo', 'provincia': 'Tungurahua', 'activo': True},
        )
        return parroquia

    def _unique_slug(self, nombre: str, exclude_id=None) -> str:
        base = generate_slug(nombre)[:200] or 'atractivo'
        slug = base
        n = 2
        while True:
            qs = Atractivo.objects.filter(slug=slug)
            if exclude_id:
                qs = qs.exclude(pk=exclude_id)
            if not qs.exists():
                return slug
            slug = f'{base}-{n}'
            n += 1

    def _upsert_atractivo(self, item, publicado, user, dry: bool) -> bool:
        nombre = item['nombre'].strip()
        obj = Atractivo.objects.filter(nombre__iexact=nombre).first()
        created = obj is None
        if dry:
            return created

        if created:
            obj = Atractivo(nombre=nombre, creado_por=user)

        obj.categoria = self._categoria(item['categoria'])
        obj.parroquia = self._parroquia(item['parroquia'])
        obj.estado_publicacion = publicado
        obj.descripcion = item.get('descripcion') or ''
        obj.direccion = item.get('direccion')
        obj.horario = item.get('horario')
        obj.altitud = _dec(item.get('altitud'))
        obj.latitud = _dec(item.get('latitud'))
        obj.longitud = _dec(item.get('longitud'))
        obj.destacado = bool(item.get('destacado', False))
        obj.activo = True
        if not obj.slug:
            obj.slug = self._unique_slug(nombre)
        obj.save()

        detalle_data = item.get('detalle') or {}
        detalle, _ = AtractivoDetalle.objects.get_or_create(atractivo=obj)
        if detalle_data.get('meses_recomendados'):
            detalle.meses_recomendados = detalle_data['meses_recomendados']
        if detalle_data.get('observaciones'):
            detalle.observaciones = detalle_data['observaciones']
        if item.get('horario') and not detalle.horario:
            detalle.horario = item['horario']
        detalle.save()

        for act_nombre in item.get('actividades') or []:
            actividad, _ = Actividad.objects.get_or_create(
                nombre=act_nombre,
                defaults={'activo': True},
            )
            from src.domain.atractivos.models import AtractivoActividad
            AtractivoActividad.objects.get_or_create(atractivo=obj, actividad=actividad)

        return created

    def _upsert_evento(self, item, publicado, dry: bool) -> bool:
        nombre = item['nombre'].strip()
        obj = Evento.objects.filter(nombre__iexact=nombre).first()
        created = obj is None
        if dry:
            return created

        if created:
            obj = Evento(nombre=nombre)

        obj.categoria = self._categoria(item['categoria'])
        obj.estado_publicacion = publicado
        obj.descripcion = item.get('descripcion') or ''
        obj.direccion = item.get('direccion')
        obj.organizador = item.get('organizador')
        obj.contacto = item.get('contacto')
        obj.activo = True

        fi = parse_datetime(item['fecha_inicio']) if item.get('fecha_inicio') else None
        ff = parse_datetime(item['fecha_fin']) if item.get('fecha_fin') else None
        if fi and fi.tzinfo is None:
            from django.utils import timezone
            fi = timezone.make_aware(fi)
        if ff and ff.tzinfo is None:
            from django.utils import timezone
            ff = timezone.make_aware(ff)
        obj.fecha_inicio = fi
        obj.fecha_fin = ff
        if item.get('latitud') is not None:
            obj.latitud = _dec(item.get('latitud'))
        if item.get('longitud') is not None:
            obj.longitud = _dec(item.get('longitud'))
        obj.save()
        return created

    def _upsert_emprendimiento(self, item, publicado, user, dry: bool) -> bool:
        nombre = item['nombre'].strip()
        obj = Emprendimiento.objects.filter(nombre__iexact=nombre).first()
        created = obj is None
        if dry:
            return created

        if created:
            obj = Emprendimiento(nombre=nombre, creado_por=user)

        obj.categoria = self._categoria(item['categoria'])
        obj.parroquia = self._parroquia(item.get('parroquia') or 'Pelileo')
        obj.estado_publicacion = publicado
        obj.descripcion = item.get('descripcion') or ''
        obj.direccion = item.get('direccion')
        obj.telefono = (item.get('telefono') or '')[:20] or None
        obj.email = item.get('email')
        obj.sitio_web = item.get('sitio_web')
        obj.horario = item.get('horario')
        obj.latitud = _dec(item.get('latitud'))
        obj.longitud = _dec(item.get('longitud'))
        obj.destacado = bool(item.get('destacado', False))
        obj.activo = True
        obj.save()
        return created

    def _actualizar_config_portal(self):
        from src.domain.empresa.models import Configuracion, ConfiguracionFooter, ConfiguracionHeader, Empresa

        emp = Empresa.objects.filter(estado=True).first() or Empresa.objects.first()
        if emp and CONFIG_PORTAL.get('descripcion'):
            emp.descripcion = CONFIG_PORTAL['descripcion']
            emp.save(update_fields=['descripcion'])

        if emp:
            Configuracion.objects.update_or_create(
                clave='eslogan',
                defaults={
                    'empresa': emp,
                    'valor': CONFIG_PORTAL['eslogan'],
                    'descripcion': 'Eslogan del portal público',
                    'tipo': 'texto',
                    'editable': True,
                },
            )
            header = ConfiguracionHeader.objects.filter(empresa=emp).first()
            if header:
                header.texto_superior = CONFIG_PORTAL['eslogan']
                if not header.color_fondo:
                    header.color_fondo = '#0f172a'
                if not header.color_texto:
                    header.color_texto = '#ffffff'
                header.save()
            footer = ConfiguracionFooter.objects.filter(empresa=emp).first()
            if footer:
                changed = False
                if not footer.color_fondo:
                    footer.color_fondo = '#0f172a'
                    changed = True
                if not footer.color_texto:
                    footer.color_texto = '#e2e8f0'
                    changed = True
                if changed:
                    footer.save()

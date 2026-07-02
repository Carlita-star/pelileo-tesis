from django.core.management.base import BaseCommand
from django.core.management import call_command

from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio
from src.domain.catalogos.actividades import Actividad
from src.domain.empresa.models import Empresa
from src.domain.roles.models import Rol, UsuarioRol
from src.domain.usuarios.models import Usuario


class Command(BaseCommand):
    help = 'Prepara el entorno de desarrollo: roles, catálogos y usuario admin.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default='Admin123!',
            help='Contraseña para el usuario cjalomoto (solo desarrollo).',
        )

    def handle(self, *args, **options):
        call_command('seed_roles')

        estados = [
            ('borrador', 'Borrador'),
            ('publicado', 'Publicado'),
            ('inactivo', 'Inactivo'),
        ]
        for codigo, nombre in estados:
            EstadoPublicacion.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre})

        parroquias = ['Pelileo', 'Benitez', 'Cacha', 'El Rosario']
        for nombre in parroquias:
            Parroquia.objects.get_or_create(
                nombre=nombre,
                defaults={'canton': 'Pelileo', 'provincia': 'Tungurahua', 'activo': True},
            )

        categorias = ['Naturaleza', 'Cultura', 'Aventura', 'Gastronomía']
        for nombre in categorias:
            Categoria.objects.get_or_create(nombre=nombre, defaults={'activo': True})

        servicios = ['Baños', 'Restaurante', 'Guía', 'Estacionamiento', 'WiFi']
        for nombre in servicios:
            Servicio.objects.get_or_create(nombre=nombre, defaults={'activo': True})

        actividades = ['Senderismo', 'Ciclismo', 'Fotografía', 'Observación de aves']
        for nombre in actividades:
            Actividad.objects.get_or_create(nombre=nombre, defaults={'activo': True})

        from src.infrastructure.repositories.django_configuracion_repository import DjangoConfiguracionRepository

        DjangoConfiguracionRepository().guardar({
            'empresa': {
                'nombre': 'Gobierno Autónomo Descentralizado Municipal de Pelileo',
                'nombre_comercial': 'Pelileo Turismo',
                'ruc': '1790000000001',
                'telefono': '032851234',
                'email': 'turismo@pelileo.gob.ec',
                'sitio_web': 'https://pelileo.gob.ec',
                'provincia': 'Tungurahua',
                'canton': 'Pelileo',
                'parroquia': 'Pelileo',
                'descripcion': 'Promoción turística del cantón San Pedro de Pelileo, Tungurahua – Ecuador.',
                'mision': 'Impulsar el desarrollo turístico sostenible del cantón Pelileo.',
                'vision': 'Ser referente turístico en la región centro del Ecuador.',
                'estado': True,
            },
            'apariencia': {
                'color_primario': '#1D9E75',
                'color_secundario': '#F9A825',
                'color_terciario': '#157A5A',
                'fuente_principal': 'Inter, sans-serif',
                'fuente_secundaria': 'Inter, sans-serif',
                'tamano_fuente_base': 16,
                'borde_radio': 12,
                'modo_oscuro': False,
                'sombra_global': True,
            },
            'header': {
                'mostrar_logo': True,
                'mostrar_menu': True,
                'mostrar_buscador': False,
                'mostrar_redes': False,
                'texto_superior': 'Turismo · GAD Municipal',
                'color_fondo': '#ffffff',
                'color_texto': '#1e293b',
                'altura_header': 72,
                'sticky': True,
            },
            'footer': {
                'descripcion': 'Promoción turística del cantón San Pedro de Pelileo, Tungurahua – Ecuador.',
                'mostrar_redes': True,
                'mostrar_contacto': True,
                'mostrar_mapa': False,
                'copyright_texto': 'GAD Municipal de Pelileo',
                'color_fondo': '#1e293b',
                'color_texto': '#cbd5e1',
            },
            'menus': [
                {'nombre': 'Inicio', 'ruta': '/', 'orden': 0, 'visible': True},
                {'nombre': 'Atractivos', 'ruta': '/atractivos', 'orden': 1, 'visible': True},
                {'nombre': 'Rutas', 'ruta': '/rutas', 'orden': 2, 'visible': True},
                {'nombre': 'Emprendimientos', 'ruta': '/emprendimientos', 'orden': 3, 'visible': True},
                {'nombre': 'Eventos', 'ruta': '/eventos', 'orden': 4, 'visible': True},
                {'nombre': 'Mapa', 'ruta': '/mapa', 'orden': 5, 'visible': True},
            ],
            'redes': [
                {'nombre': 'Facebook', 'url': 'https://facebook.com', 'activo': True},
                {'nombre': 'Instagram', 'url': 'https://instagram.com', 'activo': True},
            ],
        })

        usuario = Usuario.objects.filter(username='cjalomoto').first()
        if usuario:
            usuario.set_password(options['password'])
            usuario.activo = True
            usuario.save()
            admin_rol = Rol.objects.filter(nombre='administrador').first()
            gestor = Rol.objects.filter(nombre='gestor_turistico').first()
            if admin_rol:
                UsuarioRol.objects.get_or_create(usuario=usuario, rol=admin_rol)
            elif gestor:
                UsuarioRol.objects.get_or_create(usuario=usuario, rol=gestor)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Usuario cjalomoto listo. Contraseña de desarrollo: {options["password"]}'
                )
            )
        else:
            self.stdout.write('Usuario cjalomoto no encontrado. Crea uno desde el registro.')

        self.stdout.write(self.style.SUCCESS('Entorno de desarrollo configurado.'))

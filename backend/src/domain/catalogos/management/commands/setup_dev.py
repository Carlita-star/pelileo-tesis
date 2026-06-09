from django.core.management.base import BaseCommand
from django.core.management import call_command

from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.estados_publicacion import EstadoPublicacion
from src.domain.catalogos.parroquias import Parroquia
from src.domain.catalogos.servicios import Servicio
from src.domain.catalogos.actividades import Actividad
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

        usuario = Usuario.objects.filter(username='cjalomoto').first()
        if usuario:
            usuario.set_password(options['password'])
            usuario.activo = True
            usuario.save()
            gestor = Rol.objects.filter(nombre='gestor_turistico').first()
            if gestor:
                UsuarioRol.objects.get_or_create(usuario=usuario, rol=gestor)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Usuario cjalomoto listo. Contraseña de desarrollo: {options["password"]}'
                )
            )
        else:
            self.stdout.write('Usuario cjalomoto no encontrado. Crea uno desde el registro.')

        self.stdout.write(self.style.SUCCESS('Entorno de desarrollo configurado.'))

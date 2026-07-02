from django.core.management.base import BaseCommand, CommandError

from src.domain.roles.models import Rol, UsuarioRol
from src.domain.usuarios.models import Usuario

PANEL_ROLES = {'administrador', 'gestor_turistico'}


class Command(BaseCommand):
    help = 'Asigna un rol de panel administrativo a un usuario.'

    def add_arguments(self, parser):
        parser.add_argument('username', help='Nombre de usuario, ej: cjalomoto')
        parser.add_argument(
            '--rol',
            default='gestor_turistico',
            choices=sorted(PANEL_ROLES),
            help='Rol a asignar (por defecto: gestor_turistico)',
        )

    def handle(self, *args, **options):
        username = options['username'].strip()
        rol_nombre = options['rol']

        usuario = Usuario.objects.filter(username=username, activo=True, eliminado_en__isnull=True).first()
        if not usuario:
            usuario = Usuario.objects.filter(email__iexact=username, activo=True, eliminado_en__isnull=True).first()
        if not usuario:
            raise CommandError(f'No se encontró el usuario activo: {username}')

        rol, _ = Rol.objects.get_or_create(
            nombre=rol_nombre,
            defaults={'descripcion': f'Rol {rol_nombre}'},
        )

        UsuarioRol.objects.get_or_create(usuario=usuario, rol=rol)

        roles = list(usuario.usuario_roles.values_list('rol__nombre', flat=True))
        self.stdout.write(
            self.style.SUCCESS(
                f'Usuario {usuario.username} ahora tiene roles: {", ".join(roles)}'
            )
        )
        self.stdout.write('Cierra sesión en el panel y vuelve a entrar para actualizar el token.')

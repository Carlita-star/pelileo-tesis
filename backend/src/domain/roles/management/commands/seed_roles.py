from django.core.management.base import BaseCommand

from src.domain.roles.models import Rol, UsuarioRol
from src.domain.usuarios.models import Usuario


class Command(BaseCommand):
    help = 'Crea roles del panel admin y los asigna a usuarios existentes sin rol.'

    def handle(self, *args, **options):
        roles_data = [
            ('administrador', 'Administrador del sistema'),
            ('gestor_turistico', 'Gestor turístico del GAD'),
            ('visitante', 'Usuario visitante del portal'),
        ]

        created_roles = {}
        for nombre, descripcion in roles_data:
            rol, created = Rol.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': descripcion},
            )
            created_roles[nombre] = rol
            action = 'creado' if created else 'existente'
            self.stdout.write(f'Rol {nombre}: {action}')

        for usuario in Usuario.objects.filter(activo=True, eliminado_en__isnull=True):
            if usuario.usuario_roles.exists():
                continue
            UsuarioRol.objects.get_or_create(
                usuario=usuario,
                rol=created_roles['gestor_turistico'],
            )
            self.stdout.write(f'Asignado gestor_turistico a {usuario.username}')

        self.stdout.write(self.style.SUCCESS('Roles inicializados correctamente.'))

from src.domain.roles.models import Rol, UsuarioRol

ROLES_PANEL = ('administrador', 'gestor_turistico')
ROLES_SISTEMA = ('visitante', 'administrador', 'gestor_turistico')
ROL_VISITANTE = 'visitante'
PRIORIDAD_ROL = {'administrador': 0, 'gestor_turistico': 1, 'visitante': 2}


def get_or_create_visitante_rol():
    rol, _ = Rol.objects.get_or_create(
        nombre=ROL_VISITANTE,
        defaults={'descripcion': 'Usuario visitante del portal'},
    )
    return rol


def normalizar_rol_ids(rol_ids):
    """Un usuario solo puede tener un rol. Vacío → visitante por defecto."""
    if not rol_ids:
        return None
    unique = list(dict.fromkeys(rol_ids))
    if len(unique) > 1:
        raise ValueError('Solo se puede asignar un rol por usuario.')
    return unique[0]


def asignar_rol_unico(usuario, rol_id=None):
    """Reemplaza todos los roles del usuario por uno solo."""
    UsuarioRol.objects.filter(usuario=usuario).delete()
    if rol_id:
        rol = Rol.objects.filter(id=rol_id, nombre__in=ROLES_SISTEMA).first()
        if not rol:
            raise ValueError('Rol no válido.')
    else:
        rol = get_or_create_visitante_rol()
    UsuarioRol.objects.create(usuario=usuario, rol=rol)
    return rol


def asegurar_rol_visitante(usuario):
    asignar_rol_unico(usuario, None)


def sincronizar_roles_usuario(usuario, rol_ids):
    """Asigna exactamente un rol al usuario."""
    rol_id = normalizar_rol_ids(rol_ids or [])
    asignar_rol_unico(usuario, rol_id)


def rol_principal_de_usuario(usuario):
    """Devuelve el rol con mayor prioridad si hubiera más de uno (datos legacy)."""
    roles = list(usuario.usuario_roles.select_related('rol').all())
    if not roles:
        visitante = get_or_create_visitante_rol()
        return visitante
    return min(roles, key=lambda ur: PRIORIDAD_ROL.get(ur.rol.nombre, 99)).rol

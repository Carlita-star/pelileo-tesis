from src.domain.roles.models import Rol, UsuarioRol

ROLES_PANEL = ('administrador', 'gestor_turistico')
ROL_VISITANTE = 'visitante'


def get_or_create_visitante_rol():
    rol, _ = Rol.objects.get_or_create(
        nombre=ROL_VISITANTE,
        defaults={'descripcion': 'Usuario visitante del portal'},
    )
    return rol


def asegurar_rol_visitante(usuario):
    rol = get_or_create_visitante_rol()
    UsuarioRol.objects.get_or_create(usuario=usuario, rol=rol)


def validar_roles_panel(rol_ids):
    """Valida IDs de roles administrativos (administrador, gestor_turistico). Puede ser vacío."""
    if not rol_ids:
        return []
    ids = list(set(rol_ids))
    validos = list(
        Rol.objects.filter(id__in=ids, nombre__in=ROLES_PANEL).values_list('id', flat=True)
    )
    if len(validos) != len(ids):
        raise ValueError('Uno o más roles seleccionados no son válidos para el panel.')
    return validos


def sincronizar_roles_usuario(usuario, rol_ids_panel):
    """Siempre conserva visitante; los roles de panel son opcionales."""
    visitante = get_or_create_visitante_rol()
    panel_ids = validar_roles_panel(rol_ids_panel or [])
    ids_finales = set(panel_ids) | {visitante.id}
    UsuarioRol.objects.filter(usuario=usuario).exclude(rol_id__in=ids_finales).delete()
    for rol_id in ids_finales:
        UsuarioRol.objects.get_or_create(usuario=usuario, rol_id=rol_id)

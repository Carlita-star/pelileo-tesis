from django.db.models import Avg, Count, Q

from src.domain.atractivos.models import Atractivo
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.eventos.models import Evento
from src.domain.resenas.models import Resena, TIPOS_ENTIDAD
from src.domain.rutas.models import Ruta


ETIQUETAS_TIPO = dict(TIPOS_ENTIDAD)


def resumen_admin():
    base = Resena.objects.filter(activo=True)
    por_tipo = {
        tipo: base.filter(entidad_tipo=tipo).count()
        for tipo, _ in TIPOS_ENTIDAD
    }
    agregado = base.aggregate(total=Count('id'), promedio=Avg('calificacion'))
    return {
        'total': agregado['total'] or 0,
        'promedio_global': round(float(agregado['promedio'] or 0), 1),
        'por_tipo': por_tipo,
    }


def _nombres_entidades(entidad_tipo, ids):
    if not ids:
        return {}

    if entidad_tipo == 'atractivo':
        return dict(Atractivo.objects.filter(id__in=ids).values_list('id', 'nombre'))
    if entidad_tipo == 'ruta':
        return dict(Ruta.objects.filter(id__in=ids).values_list('id', 'nombre'))
    if entidad_tipo == 'emprendimiento':
        return dict(Emprendimiento.objects.filter(id__in=ids).values_list('id', 'nombre'))
    if entidad_tipo == 'evento':
        return dict(Evento.objects.filter(id__in=ids).values_list('id', 'nombre'))
    return {}


def listar_admin(entidad_tipo=None, calificacion=None, activo=None, busqueda=None, limite=100):
    qs = Resena.objects.select_related('usuario').order_by('-creado_en')

    if entidad_tipo:
        qs = qs.filter(entidad_tipo=entidad_tipo)

    if calificacion is not None:
        qs = qs.filter(calificacion=calificacion)

    if activo is not None:
        qs = qs.filter(activo=activo)
    else:
        qs = qs.filter(activo=True)

    if busqueda:
        termino = busqueda.strip()
        if termino:
            qs = qs.filter(
                Q(comentario__icontains=termino)
                | Q(usuario__username__icontains=termino)
                | Q(usuario__nombres__icontains=termino)
                | Q(usuario__apellidos__icontains=termino)
            )

    resenas = list(qs[:limite])
    ids_por_tipo = {}
    for resena in resenas:
        ids_por_tipo.setdefault(resena.entidad_tipo, set()).add(resena.entidad_id)

    nombres = {}
    for tipo, ids in ids_por_tipo.items():
        nombres[tipo] = _nombres_entidades(tipo, ids)

    resultados = []
    for resena in resenas:
        nombre_usuario = resena.usuario.nombre_completo or resena.usuario.username
        entidad_nombre = nombres.get(resena.entidad_tipo, {}).get(
            resena.entidad_id,
            f'ID {resena.entidad_id}',
        )
        resultados.append({
            'id': resena.id,
            'entidad_tipo': resena.entidad_tipo,
            'entidad_tipo_label': ETIQUETAS_TIPO.get(resena.entidad_tipo, resena.entidad_tipo),
            'entidad_id': resena.entidad_id,
            'entidad_nombre': entidad_nombre,
            'calificacion': resena.calificacion,
            'comentario': resena.comentario,
            'activo': resena.activo,
            'creado_en': resena.creado_en.isoformat() if resena.creado_en else None,
            'actualizado_en': resena.actualizado_en.isoformat() if resena.actualizado_en else None,
            'usuario': {
                'id': resena.usuario_id,
                'nombre': nombre_usuario.strip() or 'Visitante',
                'username': resena.usuario.username,
            },
        })

    return resultados

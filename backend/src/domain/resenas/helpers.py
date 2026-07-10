from django.db.models import Avg, Count

from src.domain.atractivos.models import Atractivo
from src.domain.emprendimientos.models import Emprendimiento
from src.domain.eventos.models import Evento
from src.domain.resenas.models import Resena, TIPOS_ENTIDAD
from src.domain.rutas.models import Ruta


def tipos_entidad_validos():
    return {t[0] for t in TIPOS_ENTIDAD}


def resumen_vacio():
    return {'promedio_calificacion': 0.0, 'total_resenas': 0}


def stats_por_entidades(entidad_tipo, ids):
    if not ids:
        return {}

    filas = (
        Resena.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id__in=ids,
            activo=True,
        )
        .values('entidad_id')
        .annotate(promedio=Avg('calificacion'), total=Count('id'))
    )

    resultado = {}
    for fila in filas:
        promedio = float(fila['promedio'] or 0)
        resultado[fila['entidad_id']] = {
            'promedio_calificacion': round(promedio, 1),
            'total_resenas': fila['total'],
        }
    return resultado


def stats_entidad(entidad_tipo, entidad_id):
    fila = (
        Resena.objects.filter(
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            activo=True,
        )
        .aggregate(promedio=Avg('calificacion'), total=Count('id'))
    )
    if not fila['total']:
        return resumen_vacio()
    return {
        'promedio_calificacion': round(float(fila['promedio'] or 0), 1),
        'total_resenas': fila['total'],
    }


def entidad_publicada(entidad_tipo, entidad_id):
    filtro = {
        'pk': entidad_id,
        'activo': True,
        'estado_publicacion__codigo': 'publicado',
    }
    if entidad_tipo == 'atractivo':
        return Atractivo.objects.filter(**filtro).exists()
    if entidad_tipo == 'ruta':
        return Ruta.objects.filter(**filtro).exists()
    if entidad_tipo == 'emprendimiento':
        return Emprendimiento.objects.filter(**filtro).exists()
    if entidad_tipo == 'evento':
        return Evento.objects.filter(**filtro).exists()
    return False


def aplicar_stats_a_item(item, entidad_id, stats_map):
    stats = stats_map.get(entidad_id, resumen_vacio())
    item['promedio_calificacion'] = stats['promedio_calificacion']
    item['total_resenas'] = stats['total_resenas']
    return item

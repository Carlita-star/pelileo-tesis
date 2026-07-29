import json

from datetime import datetime

from django.http import (
    HttpResponse,
    JsonResponse,
    HttpResponseBadRequest,
    HttpResponseNotAllowed,
    HttpResponseForbidden,
    HttpResponseNotFound,
)
from src.application.use_cases.auditorias.listar_auditorias import ListarAuditorias
from src.application.services.auditoria_export_service import auditorias_to_csv, auditorias_to_xlsx
from src.infrastructure.repositories.django_auditoria_repository import DjangoAuditoriaRepository
from django.views.decorators.http import require_GET, require_http_methods

from src.domain.atractivos.models import Atractivo, AtractivoServicio
from src.domain.rutas.models import Ruta, RutaAtractivo
from src.domain.emprendimientos.models import (
    Emprendimiento,
    EmprendimientoRelacion,
    EmprendimientoRedSocial,
    EmprendimientoServicio,
)
from src.domain.usuarios.models import Usuario
from src.domain.eventos.models import Evento
from src.domain.resenas.helpers import aplicar_stats_a_item, stats_entidad, stats_por_entidades
from src.domain.auditorias.models import HistorialPublicacion, Auditoria
from src.domain.reportes.models import ReporteGenerado
from src.domain.empresa.models import Empresa, Configuracion
from django.db.models import F, Q
from src.domain.multimedia.models import Multimedia
from src.domain.catalogos.categorias import Categoria
from src.domain.catalogos.parroquias import Parroquia
from src.application.use_cases.dashboard_summary import ObtenerDashboardSummaryUseCase
from src.application.use_cases.atractivos.listar_atractivos_admin import ListarAtractivosAdminUseCase
from src.application.use_cases.atractivos.eliminar_atractivo_admin import EliminarAtractivoAdminUseCase
from src.application.use_cases.atractivos.cambiar_estado_atractivo_admin import CambiarEstadoAtractivoAdminUseCase
from src.application.use_cases.atractivos.obtener_atractivo_edicion import ObtenerAtractivoEdicionUseCase
from src.application.use_cases.atractivos.guardar_atractivo import GuardarAtractivoUseCase
from src.interfaces.api_rest.error_handlers import json_error_response
from src.domain.shared.field_validation import FormValidationError, validar_texto_ciudad
from src.application.dto.atractivo_dto import AtractivoCompleteDTO, AtractivoGeneralDTO, AtractivoUbicacionDTO, AtractivoDetalleDTO, AtractivoAccesibilidadDTO, AtractivoEstadoConservacionDTO, AtractivoAdministracionDTO
from src.infrastructure.repositories.django_dashboard_repository import DjangoDashboardRepository
from src.infrastructure.repositories.django_atractivo_repository import DjangoAtractivoAdminRepository
from src.interfaces.api_rest.auth_utils import admin_panel_required, administrador_required
from src.domain.shared.media_urls import build_media_url


def _imagen_principal(tipo, entidad_id, request=None):
    m = (
        Multimedia.objects
        .filter(entidad_tipo=tipo, entidad_id=entidad_id, activo=True)
        .order_by('-principal', 'orden')
        .first()
    )
    return build_media_url(m.archivo, request) if m else None


def _batch_datos_emprendimientos_lista(emprendimiento_ids, request=None):
    if not emprendimiento_ids:
        return {}, {}, {}, {}

    imagenes_map = {eid: [] for eid in emprendimiento_ids}
    for media in (
        Multimedia.objects
        .filter(entidad_tipo='emprendimiento', entidad_id__in=emprendimiento_ids, activo=True)
        .order_by('entidad_id', '-principal', 'orden')
    ):
        urls = imagenes_map.get(media.entidad_id, [])
        if len(urls) < 2:
            url = build_media_url(media.archivo, request)
            if url:
                urls.append(url)
                imagenes_map[media.entidad_id] = urls

    servicios_map = {eid: [] for eid in emprendimiento_ids}
    for item in (
        EmprendimientoServicio.objects
        .filter(emprendimiento_id__in=emprendimiento_ids)
        .select_related('servicio')
        .order_by('emprendimiento_id', 'id')
    ):
        servicios = servicios_map.setdefault(item.emprendimiento_id, [])
        if len(servicios) < 5:
            servicios.append({
                'nombre': item.servicio.nombre,
                'icono': item.servicio.icono,
            })

    redes_map = {eid: [] for eid in emprendimiento_ids}
    for red in EmprendimientoRedSocial.objects.filter(
        emprendimiento_id__in=emprendimiento_ids,
        activo=True,
    ).order_by('emprendimiento_id', 'id'):
        redes_map.setdefault(red.emprendimiento_id, []).append({
            'nombre_red': red.nombre_red,
            'url': red.url,
        })

    atractivo_map = {}
    for rel in (
        EmprendimientoRelacion.objects
        .filter(
            emprendimiento_id__in=emprendimiento_ids,
            atractivo__isnull=False,
            atractivo__activo=True,
            atractivo__estado_publicacion__codigo='publicado',
        )
        .select_related('atractivo')
        .order_by('emprendimiento_id', 'id')
    ):
        if rel.emprendimiento_id not in atractivo_map:
            atractivo_map[rel.emprendimiento_id] = rel.atractivo.nombre

    return imagenes_map, servicios_map, redes_map, atractivo_map


def _batch_datos_rutas_lista(ruta_ids, request=None):
    if not ruta_ids:
        return {}, {}

    paradas_map = {rid: [] for rid in ruta_ids}
    for parada in (
        RutaAtractivo.objects
        .filter(
            ruta_id__in=ruta_ids,
            activo=True,
            atractivo__activo=True,
            atractivo__estado_publicacion__codigo='publicado',
        )
        .select_related('atractivo')
        .order_by('ruta_id', 'orden_recorrido')
    ):
        a = parada.atractivo
        paradas_map.setdefault(parada.ruta_id, []).append({
            'orden': parada.orden_recorrido,
            'nombre': a.nombre,
            'lat': float(a.latitud) if a.latitud is not None else None,
            'lng': float(a.longitud) if a.longitud is not None else None,
            'imagen': _imagen_principal('atractivo', a.id, request),
        })

    imagenes_map = {rid: [] for rid in ruta_ids}
    for media in (
        Multimedia.objects
        .filter(entidad_tipo='ruta', entidad_id__in=ruta_ids, activo=True)
        .order_by('entidad_id', '-principal', 'orden')
    ):
        urls = imagenes_map.get(media.entidad_id, [])
        if len(urls) < 3:
            url = build_media_url(media.archivo, request)
            if url:
                urls.append(url)
                imagenes_map[media.entidad_id] = urls

    for rid, paradas in paradas_map.items():
        urls = imagenes_map.get(rid, [])
        if len(urls) >= 3:
            continue
        for parada in paradas:
            if parada.get('imagen') and parada['imagen'] not in urls:
                urls.append(parada['imagen'])
            if len(urls) >= 3:
                break
        imagenes_map[rid] = urls

    return paradas_map, imagenes_map


def _batch_servicios_atractivos_lista(atractivo_ids):
    if not atractivo_ids:
        return {}

    servicios_map = {aid: [] for aid in atractivo_ids}
    for item in (
        AtractivoServicio.objects
        .filter(atractivo_id__in=atractivo_ids)
        .select_related('servicio')
        .order_by('atractivo_id', 'id')
    ):
        servicios = servicios_map.setdefault(item.atractivo_id, [])
        if len(servicios) < 5:
            servicios.append({
                'nombre': item.servicio.nombre,
                'icono': item.servicio.icono,
            })

    return servicios_map


def _serialize_multimedia_item(media, request=None):
    return {
        'archivo': media.archivo,
        'url': build_media_url(media.archivo, request),
        'titulo': media.titulo,
        'tipo': media.tipo,
        'principal': media.principal,
    }


def _filtro_publicado():
    """Solo contenido visible en el portal público."""
    return {'activo': True, 'estado_publicacion__codigo': 'publicado'}


def _recomendar_atractivos(atractivo_actual, request=None, limite=6):
    base = (
        Atractivo.objects
        .filter(**_filtro_publicado())
        .exclude(pk=atractivo_actual.pk)
        .select_related('categoria', 'parroquia')
    )

    seleccionados = []
    vistos = set()

    if atractivo_actual.parroquia_id:
        for item in base.filter(parroquia_id=atractivo_actual.parroquia_id).order_by('-destacado', '-visitas', 'nombre')[:limite]:
            seleccionados.append(item)
            vistos.add(item.pk)

    if len(seleccionados) < limite and atractivo_actual.categoria_id:
        faltan = limite - len(seleccionados)
        for item in base.filter(categoria_id=atractivo_actual.categoria_id).exclude(pk__in=vistos).order_by('-destacado', '-visitas', 'nombre')[:faltan]:
            seleccionados.append(item)
            vistos.add(item.pk)

    if len(seleccionados) < limite:
        faltan = limite - len(seleccionados)
        for item in base.exclude(pk__in=vistos).order_by('-destacado', '-visitas', 'nombre')[:faltan]:
            seleccionados.append(item)

    return [
        {
            'id': item.id,
            'nombre': item.nombre,
            'slug': item.slug,
            'descripcion': item.descripcion,
            'categoria': item.categoria.nombre if item.categoria_id else None,
            'parroquia': item.parroquia.nombre if item.parroquia_id else None,
            'imagen': _imagen_principal('atractivo', item.id, request),
        }
        for item in seleccionados
    ]


def _recomendar_emprendimientos(emprendimiento_actual, request=None, limite=6):
    base = (
        Emprendimiento.objects
        .filter(**_filtro_publicado())
        .exclude(pk=emprendimiento_actual.pk)
        .select_related('categoria', 'parroquia')
    )

    seleccionados = []
    vistos = set()

    if emprendimiento_actual.parroquia_id:
        for item in base.filter(parroquia_id=emprendimiento_actual.parroquia_id).order_by('-destacado', '-visitas', 'nombre')[:limite]:
            seleccionados.append(item)
            vistos.add(item.pk)

    if len(seleccionados) < limite and emprendimiento_actual.categoria_id:
        faltan = limite - len(seleccionados)
        for item in base.filter(categoria_id=emprendimiento_actual.categoria_id).exclude(pk__in=vistos).order_by('-destacado', '-visitas', 'nombre')[:faltan]:
            seleccionados.append(item)
            vistos.add(item.pk)

    if len(seleccionados) < limite:
        faltan = limite - len(seleccionados)
        for item in base.exclude(pk__in=vistos).order_by('-destacado', '-visitas', 'nombre')[:faltan]:
            seleccionados.append(item)

    return [
        {
            'id': item.id,
            'nombre': item.nombre,
            'descripcion': item.descripcion,
            'categoria': item.categoria.nombre if item.categoria_id else None,
            'parroquia': item.parroquia.nombre if item.parroquia_id else None,
            'imagen': _imagen_principal('emprendimiento', item.id, request),
        }
        for item in seleccionados
    ]


@require_GET
def api_root(request):
    return JsonResponse(
        {
            "message": "API Turismo Pelileo",
            "routes": {
                "atractivos": "/api/atractivos/",
                "rutas": "/api/rutas/",
                "emprendimientos": "/api/emprendimientos/",
                "usuarios": "/api/usuarios/",
                "eventos": "/api/eventos/",
                "resenas": "/api/resenas/",
                "publicaciones": "/api/publicaciones/",
                "reportes": "/api/reportes/",
                "auditorias": "/api/auditorias/",
                "admin_atractivos": "/api/admin/atractivos/",
                "admin_eventos": "/api/admin/eventos/",
                "dashboard": "/api/dashboard/",
                "configuracion": "/api/configuracion/",
                "catalogos": "/api/catalogos/publicos/",
            },
        }
    )


@require_GET
def atractivos_list(request):
    atractivos = list(
        Atractivo.objects.filter(**_filtro_publicado())
        .select_related('categoria', 'parroquia', 'detalle')
        .order_by('-destacado', '-creado_en', '-visitas')
    )

    ids = [a.id for a in atractivos]
    servicios_map = _batch_servicios_atractivos_lista(ids)
    resenas_map = stats_por_entidades('atractivo', ids)

    data = []
    for a in atractivos:
        detalle = getattr(a, 'detalle', None)
        horario = a.horario or (detalle.horario if detalle else None)

        data.append({
            'id': a.id,
            'nombre': a.nombre,
            'imagen': _imagen_principal('atractivo', a.id, request),
            'slug': a.slug,
            'descripcion': a.descripcion,
            'categoria': a.categoria.nombre if a.categoria_id else None,
            'parroquia': a.parroquia.nombre if a.parroquia_id else None,
            'latitud': float(a.latitud) if a.latitud is not None else None,
            'longitud': float(a.longitud) if a.longitud is not None else None,
            'horario': horario,
            'servicios': servicios_map.get(a.id, []),
            'visitas': a.visitas,
            'destacado': a.destacado,
        })
        aplicar_stats_a_item(data[-1], a.id, resenas_map)

    return JsonResponse({'results': data})


@require_GET
def galeria_publica_list(request):
    """Todas las imágenes activas de entidades publicadas (atractivos, rutas, emprendimientos, eventos)."""
    filtro = _filtro_publicado()
    grupos = [
        ('atractivo', list(Atractivo.objects.filter(**filtro).values_list('id', flat=True))),
        ('ruta', list(Ruta.objects.filter(**filtro).values_list('id', flat=True))),
        ('emprendimiento', list(Emprendimiento.objects.filter(**filtro).values_list('id', flat=True))),
        ('evento', list(Evento.objects.filter(**filtro).values_list('id', flat=True))),
    ]

    condicion = Q()
    for tipo, ids in grupos:
        if ids:
            condicion |= Q(entidad_tipo=tipo, entidad_id__in=ids)

    if not condicion:
        return JsonResponse({'results': []})

    medias = (
        Multimedia.objects
        .filter(condicion, activo=True)
        .exclude(tipo__in=['video', 'documento'])
        .order_by('-principal', 'orden', '-creado_en')
    )

    results = []
    urls_vistas = set()
    for media in medias:
        if not media.archivo:
            continue
        url = build_media_url(media.archivo, request)
        if not url or url in urls_vistas:
            continue
        urls_vistas.add(url)
        results.append({
            'url': url,
            'titulo': media.titulo or '',
            'entidad_tipo': media.entidad_tipo,
        })

    return JsonResponse({'results': results})


# Valores alineados con el formulario admin de rutas (general.dificultad).
DIFICULTADES_RUTA = [
    {'valor': 'facil', 'etiqueta': 'Fácil'},
    {'valor': 'moderado', 'etiqueta': 'Moderado'},
    {'valor': 'dificil', 'etiqueta': 'Difícil'},
]

# Estado temporal del evento en el portal (calculado por fechas; no es EstadoPublicacion).
ESTADOS_EVENTO_PORTAL = [
    {'valor': 'Próximo', 'etiqueta': 'Próximos'},
    {'valor': 'En curso', 'etiqueta': 'En curso'},
    {'valor': 'Finalizado', 'etiqueta': 'Finalizados'},
]


@require_GET
def catalogos_publicos_list(request):
    """
    Opciones de filtro del portal público, tomadas de las tablas de catálogo.
    Así categoría/parroquia coinciden con lo que se llena en el administrador.
    """
    categorias = [
        {'id': c.id, 'nombre': c.nombre}
        for c in Categoria.objects.filter(activo=True).order_by('nombre')
    ]
    parroquias = [
        {'id': p.id, 'nombre': p.nombre}
        for p in Parroquia.objects.filter(activo=True).order_by('nombre')
    ]
    return JsonResponse({
        'categorias': categorias,
        'parroquias': parroquias,
        'dificultades': DIFICULTADES_RUTA,
        'estados_evento': ESTADOS_EVENTO_PORTAL,
    })


@require_GET
def rutas_list(request):
    rutas = list(
        Ruta.objects.filter(**_filtro_publicado())
        .select_related('parroquia')
        .order_by('-destacado', '-creado_en')
    )

    ids = [r.id for r in rutas]
    paradas_map, imagenes_map = _batch_datos_rutas_lista(ids, request)
    resenas_map = stats_por_entidades('ruta', ids)

    data = []
    for r in rutas:
        paradas = paradas_map.get(r.id, [])
        imagenes = imagenes_map.get(r.id, [])
        imagen_principal = _imagen_principal('ruta', r.id, request)
        if imagen_principal and imagen_principal not in imagenes:
            imagenes = [imagen_principal, *imagenes]
        elif imagen_principal and not imagenes:
            imagenes = [imagen_principal]

        data.append({
            'id': r.id,
            'nombre': r.nombre,
            'descripcion': r.descripcion,
            'distancia_km': float(r.distancia_km) if r.distancia_km is not None else None,
            'duracion_estimada': r.duracion_estimada,
            'dificultad': r.dificultad,
            'parroquia': r.parroquia.nombre if r.parroquia_id else None,
            'num_atractivos': len(paradas) or r.atractivos.filter(activo=True).count(),
            'lat_inicio': float(r.lat_inicio) if r.lat_inicio is not None else None,
            'lon_inicio': float(r.lon_inicio) if r.lon_inicio is not None else None,
            'imagen': imagen_principal,
            'imagenes': imagenes[:3],
            'paradas': paradas,
            'geojson_ruta': r.geojson_ruta,
            'destacado': r.destacado,
        })
        aplicar_stats_a_item(data[-1], r.id, resenas_map)

    return JsonResponse({'results': data})

@require_GET
def emprendimientos_list(request):
    emprendimientos = list(
        Emprendimiento.objects.filter(**_filtro_publicado())
        .select_related('categoria', 'parroquia', 'estado_publicacion')
        .order_by('-destacado', '-creado_en', '-visitas')
    )

    ids = [e.id for e in emprendimientos]
    imagenes_map, servicios_map, redes_map, atractivo_map = _batch_datos_emprendimientos_lista(ids, request)
    resenas_map = stats_por_entidades('emprendimiento', ids)

    data = []
    for e in emprendimientos:
        imagenes = imagenes_map.get(e.id) or []
        imagen_principal = imagenes[0] if imagenes else _imagen_principal('emprendimiento', e.id, request)
        if imagen_principal and not imagenes:
            imagenes = [imagen_principal]

        data.append({
            'id': e.id,
            'nombre': e.nombre,
            'imagen': imagen_principal,
            'imagenes': imagenes,
            'descripcion': e.descripcion,
            'categoria': e.categoria.nombre if e.categoria_id else None,
            'parroquia': e.parroquia.nombre if e.parroquia_id else None,
            'direccion': e.direccion,
            'estado_publicacion': e.estado_publicacion.nombre if e.estado_publicacion_id else None,
            'telefono': e.telefono,
            'email': e.email,
            'sitio_web': e.sitio_web,
            'horario': e.horario,
            'latitud': float(e.latitud) if e.latitud is not None else None,
            'longitud': float(e.longitud) if e.longitud is not None else None,
            'visitas': e.visitas,
            'destacado': e.destacado,
            'servicios': servicios_map.get(e.id, []),
            'redes_sociales': redes_map.get(e.id, []),
            'atractivo_cercano': atractivo_map.get(e.id),
        })
        aplicar_stats_a_item(data[-1], e.id, resenas_map)

    return JsonResponse({'results': data})


@require_GET
def usuarios_list(request):
    usuarios = Usuario.objects.filter(activo=True, eliminado_en__isnull=True).order_by('-creado_en')[:50]

    data = [
        {
            'id': u.id,
            'nombres': u.nombres,
            'apellidos': u.apellidos,
            'nombre_completo': u.nombre_completo,
            'username': u.username,
            'email': u.email,
            'telefono': u.telefono,
            'foto_perfil': u.foto_perfil,
            'ultimo_acceso': u.ultimo_acceso.isoformat() if u.ultimo_acceso else None,
            'creado_en': u.creado_en.isoformat() if u.creado_en else None,
            'activo': u.activo,
        }
        for u in usuarios
    ]

    return JsonResponse({'results': data})


@require_GET
def eventos_list(request):
    eventos = list(
        Evento.objects.filter(**_filtro_publicado())
        .select_related('categoria', 'estado_publicacion')
        .order_by('fecha_inicio')[:20]
    )

    ids = [e.id for e in eventos]
    resenas_map = stats_por_entidades('evento', ids)

    data = []
    for e in eventos:
        item = {
            'id': e.id,
            'nombre': e.nombre,
            'imagen': _imagen_principal('evento', e.id),
            'descripcion': e.descripcion,
            'categoria': e.categoria.nombre if e.categoria_id else None,
            'estado_publicacion': e.estado_publicacion.nombre if e.estado_publicacion_id else None,
            'fecha_inicio': e.fecha_inicio.isoformat() if e.fecha_inicio else None,
            'fecha_fin': e.fecha_fin.isoformat() if e.fecha_fin else None,
            'direccion': e.direccion,
            'latitud': float(e.latitud) if e.latitud is not None else None,
            'longitud': float(e.longitud) if e.longitud is not None else None,
            'costo': float(e.costo) if e.costo is not None else None,
            'organizador': e.organizador,
            'contacto': e.contacto,
        }
        aplicar_stats_a_item(item, e.id, resenas_map)
        data.append(item)

    return JsonResponse({'results': data})


@require_GET
def eventos_detail(request, evento_id):
    try:
        e = (
            Evento.objects
            .select_related('categoria', 'estado_publicacion')
            .get(pk=evento_id, **_filtro_publicado())
        )
    except Evento.DoesNotExist:
        return JsonResponse({'error': 'Evento no encontrado'}, status=404)

    multimedia = [
        _serialize_multimedia_item(m, request)
        for m in Multimedia.objects.filter(entidad_tipo='evento', entidad_id=e.id, activo=True).order_by('-principal', 'orden')
    ]

    resumen = stats_entidad('evento', e.id)

    data = {
        'id': e.id,
        'nombre': e.nombre,
        'descripcion': e.descripcion,
        'categoria': e.categoria.nombre if e.categoria_id else None,
        'estado_publicacion': e.estado_publicacion.nombre if e.estado_publicacion_id else None,
        'fecha_inicio': e.fecha_inicio.isoformat() if e.fecha_inicio else None,
        'fecha_fin': e.fecha_fin.isoformat() if e.fecha_fin else None,
        'direccion': e.direccion,
        'latitud': float(e.latitud) if e.latitud is not None else None,
        'longitud': float(e.longitud) if e.longitud is not None else None,
        'costo': float(e.costo) if e.costo is not None else None,
        'organizador': e.organizador,
        'contacto': e.contacto,
        'imagen': _imagen_principal('evento', e.id, request),
        'multimedia': multimedia,
        'promedio_calificacion': resumen['promedio_calificacion'],
        'total_resenas': resumen['total_resenas'],
    }
    return JsonResponse(data)


@require_GET
@admin_panel_required
def admin_evento_detail(request, evento_id):
    try:
        evento_id = int(evento_id)
    except (TypeError, ValueError):
        return HttpResponseBadRequest('ID de evento inválido.')

    evento = Evento.objects.select_related('categoria', 'estado_publicacion').filter(id=evento_id).first()
    if not evento:
        return HttpResponseNotFound('Evento no encontrado.')

    return JsonResponse({
        'id': evento.id,
        'nombre': evento.nombre,
        'descripcion': evento.descripcion,
        'direccion': evento.direccion,
        'organizador': evento.organizador,
        'contacto': evento.contacto,
        'costo': float(evento.costo) if evento.costo is not None else None,
        'fecha_inicio': evento.fecha_inicio.isoformat() if evento.fecha_inicio else None,
        'fecha_fin': evento.fecha_fin.isoformat() if evento.fecha_fin else None,
        'ubicacion': {
            'latitud': float(evento.latitud) if evento.latitud is not None else None,
            'longitud': float(evento.longitud) if evento.longitud is not None else None,
        },
        'meta': {
            'categoria': evento.categoria.nombre if evento.categoria_id else None,
            'estado_publicacion': evento.estado_publicacion.nombre if evento.estado_publicacion_id else None,
            'creado_en': evento.creado_en.isoformat() if evento.creado_en else None,
        },
        'estado_publicacion_codigo': evento.estado_publicacion.codigo if evento.estado_publicacion_id else None,
    })


@require_GET
def publicaciones_list(request):
    publicaciones = HistorialPublicacion.objects.select_related(
        'estado_anterior', 'estado_nuevo', 'cambiado_por'
    ).order_by('-cambiado_en')[:50]

    data = [
        {
            'id': p.id,
            'entidad_tipo': p.entidad_tipo,
            'entidad_id': p.entidad_id,
            'estado_anterior': p.estado_anterior.nombre if p.estado_anterior_id else None,
            'estado_nuevo': p.estado_nuevo.nombre if p.estado_nuevo_id else None,
            'usuario': p.cambiado_por.nombre_completo if p.cambiado_por_id else None,
            'observacion': p.observacion,
            'cambiado_en': p.cambiado_en.isoformat() if p.cambiado_en else None,
        }
        for p in publicaciones
    ]

    return JsonResponse({'results': data})


@require_GET
def reportes_list(request):
    reportes = ReporteGenerado.objects.select_related('usuario').order_by('-generado_en')[:50]

    data = [
        {
            'id': r.id,
            'tipo_reporte': r.tipo_reporte,
            'formato': r.formato,
            'usuario': r.usuario.nombre_completo if r.usuario_id else None,
            'archivo_generado': r.archivo_generado,
            'generado_en': r.generado_en.isoformat() if r.generado_en else None,
        }
        for r in reportes
    ]

    return JsonResponse({'results': data})

def _parse_fecha_auditoria(valor):
    if not valor:
        return None
    return datetime.strptime(valor, '%Y-%m-%d').date()


def _serializar_auditoria(a):
    return {
        'id': a.id,
        'usuario': a.nombre_usuario,
        'usuario_id': a.usuario_id,
        'tabla_afectada': a.tabla_afectada,
        'entidad_id': a.entidad_id,
        'accion': a.accion,
        'datos_anteriores': a.datos_anteriores,
        'datos_nuevos': a.datos_nuevos,
        'ip_address': a.ip_address,
        'fecha': a.fecha.isoformat() if a.fecha else None,
    }


def _auditorias_a_csv(registros):
    return auditorias_to_csv(registros)


@require_GET
@administrador_required
def auditorias_list(request):
    # 1) Leer filtros del query string (A-14 los exige).
    tabla = request.GET.get('tabla') or None
    accion = request.GET.get('accion') or None
    usuario_id = request.GET.get('usuario_id')
    page = request.GET.get('page', '1')
    page_size = request.GET.get('page_size', '20')
    export_format = (request.GET.get('format') or '').lower()

    try:
        usuario_id = int(usuario_id) if usuario_id else None
        page = int(page)
        page_size = min(100, max(1, int(page_size)))
        desde = _parse_fecha_auditoria(request.GET.get('desde'))
        hasta = _parse_fecha_auditoria(request.GET.get('hasta'))
    except ValueError:
        return HttpResponseBadRequest('Parámetros de filtro o fecha inválidos (fecha: AAAA-MM-DD).')

    # 2) Delegar al caso de uso (tu mismo patrón que en atractivos admin).
    try:
        registros = ListarAuditorias(DjangoAuditoriaRepository()).execute(
            tabla=tabla, usuario_id=usuario_id, accion=accion, desde=desde, hasta=hasta,
        )
    except ValueError as e:
        return HttpResponseBadRequest(str(e))

    if export_format == 'csv':
        csv_content = _auditorias_a_csv(registros)
        response = HttpResponse(csv_content, content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="auditoria.csv"'
        return response

    if export_format in ('xlsx', 'excel'):
        xlsx_content = auditorias_to_xlsx(registros)
        response = HttpResponse(
            xlsx_content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="auditoria.xlsx"'
        return response
    total = len(registros)
    inicio = (page - 1) * page_size
    pagina = registros[inicio:inicio + page_size]

    # 4) Serialización manual (tu estilo). Incluye los campos del modal A-14.
    data = [_serializar_auditoria(a) for a in pagina]

    return JsonResponse({
        'count': total,
        'page': page,
        'page_size': page_size,
        'total_pages': max(1, (total + page_size - 1) // page_size),
        'modulos': _listar_modulos_auditoria(),
        'results': data,
    })


def _listar_modulos_auditoria():
    return list(
        Auditoria.objects.exclude(tabla_afectada__isnull=True)
        .exclude(tabla_afectada='')
        .values_list('tabla_afectada', flat=True)
        .distinct()
        .order_by('tabla_afectada')
    )

@require_GET
@admin_panel_required
def admin_atractivos_list(request):
    search = request.GET.get('search')
    categoria_id = request.GET.get('categoria_id')
    parroquia_id = request.GET.get('parroquia_id')
    estado_codigo = request.GET.get('estado')
    page = request.GET.get('page', '1')
    page_size = request.GET.get('page_size', '20')

    try:
        categoria_id = int(categoria_id) if categoria_id else None
        parroquia_id = int(parroquia_id) if parroquia_id else None
        page = int(page)
        page_size = int(page_size)
    except ValueError:
        return HttpResponseBadRequest('Parámetros de paginación o filtro inválidos.')

    summary = ListarAtractivosAdminUseCase(DjangoAtractivoAdminRepository()).execute(
        search=search,
        categoria_id=categoria_id,
        parroquia_id=parroquia_id,
        estado_codigo=estado_codigo,
        page=page,
        page_size=page_size,
    )

    return JsonResponse(summary)


@require_http_methods(['DELETE'])
@admin_panel_required
def admin_atractivo_delete(request, atractivo_id):
    success = EliminarAtractivoAdminUseCase(DjangoAtractivoAdminRepository()).execute(atractivo_id)
    if not success:
        return HttpResponseBadRequest('No se encontró el atractivo.')
    return JsonResponse({'deleted': True})


@require_http_methods(['POST'])
@admin_panel_required
def admin_atractivo_cambiar_estado(request, atractivo_id):
    try:
        payload = json.loads(request.body or '{}')
        estado_codigo = payload.get('estado_codigo')
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')

    if not estado_codigo:
        return HttpResponseBadRequest('Debe especificar el estado a asignar.')

    success = CambiarEstadoAtractivoAdminUseCase(DjangoAtractivoAdminRepository()).execute(
        atractivo_id, estado_codigo
    )
    if not success:
        return HttpResponseBadRequest('No se pudo cambiar el estado del atractivo.')

    return JsonResponse({'updated': True})


@require_GET
@admin_panel_required
def admin_atractivo_form_data(request):
    """Obtiene datos iniciales para el formulario de nuevo atractivo."""
    data = ObtenerAtractivoEdicionUseCase(DjangoAtractivoAdminRepository()).obtener_datos_iniciales()
    return JsonResponse(data)


@require_GET
@admin_panel_required
def admin_atractivo_get_for_edit(request, atractivo_id):
    """Obtiene datos de un atractivo para editarlo."""
    try:
        atractivo_id = int(atractivo_id)
    except ValueError:
        return HttpResponseBadRequest('ID de atractivo inválido.')

    data = ObtenerAtractivoEdicionUseCase(DjangoAtractivoAdminRepository()).execute(atractivo_id)
    if not data:
        return HttpResponseNotFound('Atractivo no encontrado.')

    return JsonResponse(data)


@require_http_methods(['POST', 'PUT'])
@admin_panel_required
def admin_atractivo_save(request, atractivo_id=None):
    """Crea o actualiza un atractivo con todos sus datos relacionados."""
    try:
        payload = json.loads(request.body or '{}')
        # Construir DTO
        general_data = payload.get('general', {})
        ubicacion_data = payload.get('ubicacion', {})
        detalle_data = payload.get('detalle', {})
        accesibilidad_data = payload.get('accesibilidad', {})
        conservacion_data = payload.get('conservacion', {})
        administracion_data = payload.get('administracion', {})
        servicios_ids = payload.get('servicios_ids', [])
        actividades_ids = payload.get('actividades_ids', [])
        estado_codigo = payload.get('estado_publicacion_codigo', 'borrador')

        dto = AtractivoCompleteDTO(
            id=atractivo_id,
            general=AtractivoGeneralDTO(
                nombre=general_data.get('nombre'),
                categoria_id=general_data.get('categoria_id'),
                parroquia_id=general_data.get('parroquia_id'),
                categoria_nombre=general_data.get('categoria_nombre'),
                parroquia_nombre=general_data.get('parroquia_nombre'),
                descripcion=general_data.get('descripcion'),
                direccion=general_data.get('direccion'),
                horario=general_data.get('horario'),
                precio_referencial=general_data.get('precio_referencial'),
                slug=general_data.get('slug'),
                destacado=bool(general_data.get('destacado', False)),
            ),
            ubicacion=AtractivoUbicacionDTO(
                latitud=ubicacion_data.get('latitud'),
                longitud=ubicacion_data.get('longitud'),
                altitud=ubicacion_data.get('altitud'),
            ),
            detalle=AtractivoDetalleDTO(
                clima=detalle_data.get('clima'),
                temperatura=detalle_data.get('temperatura'),
                precipitacion=detalle_data.get('precipitacion'),
                linea_producto=detalle_data.get('linea_producto'),
                escenario=detalle_data.get('escenario'),
                tipo_ingreso=detalle_data.get('tipo_ingreso'),
                costo=detalle_data.get('costo'),
                formas_pago=detalle_data.get('formas_pago'),
                meses_recomendados=detalle_data.get('meses_recomendados'),
                observaciones=detalle_data.get('observaciones'),
            ),
            accesibilidad=AtractivoAccesibilidadDTO(
                tipo_via=accesibilidad_data.get('tipo_via'),
                estado_via=accesibilidad_data.get('estado_via'),
                tipo_transporte=accesibilidad_data.get('tipo_transporte'),
                tiempo_desplazamiento=accesibilidad_data.get('tiempo_desplazamiento'),
                distancia_referencial_km=accesibilidad_data.get('distancia_referencial_km'),
                posee_senalizacion=accesibilidad_data.get('posee_senalizacion'),
                acceso_discapacidad=accesibilidad_data.get('acceso_discapacidad'),
                observaciones=accesibilidad_data.get('observaciones'),
            ),
            conservacion=AtractivoEstadoConservacionDTO(
                estado_conservacion=conservacion_data.get('estado_conservacion'),
                nivel_seguridad=conservacion_data.get('nivel_seguridad'),
                posee_senal_internet=conservacion_data.get('posee_senal_internet'),
                cobertura_operadora=conservacion_data.get('cobertura_operadora'),
                centro_salud_cercano=conservacion_data.get('centro_salud_cercano'),
                distancia_centro_salud_km=conservacion_data.get('distancia_centro_salud_km'),
                observaciones=conservacion_data.get('observaciones'),
            ),
            administracion=AtractivoAdministracionDTO(
                tipo_administrador=administracion_data.get('tipo_administrador'),
                institucion_responsable=administracion_data.get('institucion_responsable'),
                nombre_administrador=administracion_data.get('nombre_administrador'),
                cargo=administracion_data.get('cargo'),
                telefono=administracion_data.get('telefono'),
                correo=administracion_data.get('correo'),
            ),
            servicios_ids=servicios_ids,
            actividades_ids=actividades_ids,
            estado_publicacion_codigo=estado_codigo,
        )

        result = GuardarAtractivoUseCase(DjangoAtractivoAdminRepository()).execute(dto, request.jwt_user.id)
        return JsonResponse(result, status=201 if not atractivo_id else 200)

    except json.JSONDecodeError:
        return json_error_response(ValueError('El formato JSON de la solicitud no es válido.'), request=request, modulo='atractivos')
    except FormValidationError as e:
        return JsonResponse({'error': str(e), 'errors': e.errors, 'tipo': 'validacion'}, status=400)
    except Exception as e:
        return json_error_response(e, request=request, modulo='atractivos')


def _upsert_categoria(nombre: str) -> dict:
    nombre = validar_texto_ciudad(nombre, 'Categoría', required=True)

    existente = Categoria.objects.filter(nombre__iexact=nombre).first()
    if existente:
        if not existente.activo:
            existente.activo = True
            existente.save(update_fields=['activo'])
        return {'id': existente.id, 'nombre': existente.nombre, 'created': False}

    categoria = Categoria.objects.create(nombre=nombre, activo=True)
    return {'id': categoria.id, 'nombre': categoria.nombre, 'created': True}


def _upsert_parroquia(nombre: str) -> dict:
    nombre = validar_texto_ciudad(nombre, 'Parroquia', required=True)

    existente = Parroquia.objects.filter(nombre__iexact=nombre).first()
    if existente:
        if not existente.activo:
            existente.activo = True
            existente.save(update_fields=['activo'])
        return {'id': existente.id, 'nombre': existente.nombre, 'created': False}

    parroquia = Parroquia.objects.create(nombre=nombre, canton='Pelileo', activo=True)
    return {'id': parroquia.id, 'nombre': parroquia.nombre, 'created': True}


@require_http_methods(['POST'])
@admin_panel_required
def catalogo_categoria_create(request):
    try:
        payload = json.loads(request.body or '{}')
        result = _upsert_categoria(payload.get('nombre', ''))
        return JsonResponse(result, status=201 if result['created'] else 200)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except ValueError as e:
        return HttpResponseBadRequest(str(e))


@require_http_methods(['POST'])
@admin_panel_required
def catalogo_parroquia_create(request):
    try:
        payload = json.loads(request.body or '{}')
        result = _upsert_parroquia(payload.get('nombre', ''))
        return JsonResponse(result, status=201 if result['created'] else 200)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('JSON inválido.')
    except ValueError as e:
        return HttpResponseBadRequest(str(e))


@require_GET
def dashboard_summary(request):

    summary = ObtenerDashboardSummaryUseCase(DjangoDashboardRepository()).execute()
    return JsonResponse(summary)


@require_GET
def configuracion_list(request):
    from src.infrastructure.repositories.django_configuracion_admin_repository import (
        DjangoConfiguracionAdminRepository,
    )
    data = DjangoConfiguracionAdminRepository().obtener_para_portal()
    return JsonResponse(data)

@require_GET
def atractivos_detail(request, slug):
    try:
        a = (
            Atractivo.objects
            .select_related('categoria', 'parroquia', 'estado_publicacion')
            .get(slug=slug, **_filtro_publicado())
        )
    except Atractivo.DoesNotExist:
        return JsonResponse({'error': 'Atractivo no encontrado'}, status=404)

    # P-03 pide subir el contador de visitas en cada carga.
    Atractivo.objects.filter(pk=a.pk).update(visitas=F('visitas') + 1)

    # Galería: tabla multimedia (polimórfica). La principal va primero.
    multimedia = [
        _serialize_multimedia_item(m, request)
        for m in Multimedia.objects
            .filter(entidad_tipo='atractivo', entidad_id=a.id, activo=True)
            .order_by('-principal', 'orden')
    ]

    detalles = None
    if hasattr(a, 'detalle'):
        d = a.detalle
        detalles = {
            'clima': d.clima, 'temperatura': d.temperatura, 'tipo_ingreso': d.tipo_ingreso,
            'costo': float(d.costo) if d.costo is not None else None,
            'horario': d.horario, 'formas_pago': d.formas_pago,
            'meses_recomendados': d.meses_recomendados, 'observaciones': d.observaciones,
        }

    accesibilidad = None
    if hasattr(a, 'accesibilidad'):
        ac = a.accesibilidad
        accesibilidad = {
            'tipo_via': ac.tipo_via, 'estado_via': ac.estado_via,
            'tipo_transporte': ac.tipo_transporte, 'tiempo_desplazamiento': ac.tiempo_desplazamiento,
            'distancia_referencial_km': float(ac.distancia_referencial_km) if ac.distancia_referencial_km is not None else None,
            'posee_senalizacion': ac.posee_senalizacion, 'acceso_discapacidad': ac.acceso_discapacidad,
        }

    servicios = [
        {'nombre': s.servicio.nombre, 'icono': s.servicio.icono}
        for s in a.atractivo_servicios.select_related('servicio').all()
    ]
    actividades = [
        {'nombre': ac.actividad.nombre}
        for ac in a.atractivo_actividades.select_related('actividad').all()
    ]

    atractivos_recomendados = _recomendar_atractivos(a, request)

    data = {
        'id': a.id,
        'nombre': a.nombre,
        'slug': a.slug,
        'descripcion': a.descripcion,
        'direccion': a.direccion,
        'latitud': float(a.latitud) if a.latitud is not None else None,
        'longitud': float(a.longitud) if a.longitud is not None else None,
        'altitud': float(a.altitud) if a.altitud is not None else None,
        'horario': a.horario,
        'precio_referencial': float(a.precio_referencial) if a.precio_referencial is not None else None,
        'visitas': a.visitas + 1,
        'destacado': a.destacado,
        'categoria': a.categoria.nombre if a.categoria_id else None,
        'parroquia': a.parroquia.nombre if a.parroquia_id else None,
        'estado_publicacion': a.estado_publicacion.nombre if a.estado_publicacion_id else None,
        'detalles': detalles,
        'accesibilidad': accesibilidad,
        'servicios': servicios,
        'actividades': actividades,
        'multimedia': multimedia,
        'atractivos_recomendados': atractivos_recomendados,
    }
    resumen = stats_entidad('atractivo', a.id)
    data['promedio_calificacion'] = resumen['promedio_calificacion']
    data['total_resenas'] = resumen['total_resenas']
    return JsonResponse(data)

@require_GET
def rutas_detail(request, ruta_id):
    try:
        r = (Ruta.objects
             .select_related('parroquia', 'estado_publicacion')
             .get(pk=ruta_id, **_filtro_publicado()))
    except Ruta.DoesNotExist:
        return JsonResponse({'error': 'Ruta no encontrada'}, status=404)

    Ruta.objects.filter(pk=r.pk).update(visitas=F('visitas') + 1)

    paradas = [
        {
            'orden': ra.orden_recorrido,
            'atractivo': {
                'id': ra.atractivo.id,
                'nombre': ra.atractivo.nombre,
                'slug': ra.atractivo.slug,
                'descripcion': ra.atractivo.descripcion,
                'imagen': _imagen_principal('atractivo', ra.atractivo.id),
                'latitud': float(ra.atractivo.latitud) if ra.atractivo.latitud is not None else None,
                'longitud': float(ra.atractivo.longitud) if ra.atractivo.longitud is not None else None,
            },
        }
        for ra in r.atractivos.filter(
            activo=True,
            atractivo__activo=True,
            atractivo__estado_publicacion__codigo='publicado',
        ).select_related('atractivo').order_by('orden_recorrido')
    ]

    multimedia = [
        _serialize_multimedia_item(m, request)
        for m in Multimedia.objects.filter(entidad_tipo='ruta', entidad_id=r.id, activo=True).order_by('-principal', 'orden')
    ]

    emprendimientos_cercanos = [
        {
            'id': rel.emprendimiento.id,
            'nombre': rel.emprendimiento.nombre,
            'descripcion': rel.emprendimiento.descripcion,
            'categoria': rel.emprendimiento.categoria.nombre if rel.emprendimiento.categoria_id else None,
            'distancia_referencial': float(rel.distancia_referencial) if rel.distancia_referencial is not None else None,
            'imagen': _imagen_principal('emprendimiento', rel.emprendimiento.id),
        }
        for rel in EmprendimientoRelacion.objects.filter(
            ruta=r,
            emprendimiento__activo=True,
            emprendimiento__estado_publicacion__codigo='publicado',
        ).select_related('emprendimiento', 'emprendimiento__categoria')
    ]

    data = {
        'id': r.id,
        'nombre': r.nombre,
        'descripcion': r.descripcion,
        'distancia_km': float(r.distancia_km) if r.distancia_km is not None else None,
        'duracion_estimada': r.duracion_estimada,
        'dificultad': r.dificultad,
        'punto_inicio': r.punto_inicio,
        'punto_fin': r.punto_fin,
        'lat_inicio': float(r.lat_inicio) if r.lat_inicio is not None else None,
        'lon_inicio': float(r.lon_inicio) if r.lon_inicio is not None else None,
        'geojson_ruta': r.geojson_ruta,
        'parroquia': r.parroquia.nombre if r.parroquia_id else None,
        'destacado': r.destacado,
        'visitas': r.visitas + 1,
        'num_atractivos': len(paradas),
        'paradas': paradas,
        'multimedia': multimedia,
        'emprendimientos_cercanos': emprendimientos_cercanos,
    }
    resumen = stats_entidad('ruta', r.id)
    data['promedio_calificacion'] = resumen['promedio_calificacion']
    data['total_resenas'] = resumen['total_resenas']
    return JsonResponse(data)

@require_GET
def emprendimientos_detail(request, emp_id):
    try:
        e = (Emprendimiento.objects
             .select_related('categoria', 'parroquia', 'estado_publicacion')
             .get(pk=emp_id, **_filtro_publicado()))
    except Emprendimiento.DoesNotExist:
        return JsonResponse({'error': 'Emprendimiento no encontrado'}, status=404)

    Emprendimiento.objects.filter(pk=e.pk).update(visitas=F('visitas') + 1)

    multimedia = [
        _serialize_multimedia_item(m, request)
        for m in Multimedia.objects.filter(entidad_tipo='emprendimiento', entidad_id=e.id, activo=True).order_by('-principal', 'orden')
    ]

    servicios = [
        {'nombre': s.servicio.nombre, 'icono': s.servicio.icono}
        for s in e.servicios.select_related('servicio').all()
    ]

    redes_sociales = [
        {'nombre_red': red.nombre_red, 'url': red.url}
        for red in e.redes_sociales.filter(activo=True)
    ]

    emprendimientos_recomendados = _recomendar_emprendimientos(e, request)

    data = {
        'id': e.id,
        'nombre': e.nombre,
        'descripcion': e.descripcion,
        'categoria': e.categoria.nombre if e.categoria_id else None,
        'parroquia': e.parroquia.nombre if e.parroquia_id else None,
        'direccion': e.direccion,
        'telefono': e.telefono,
        'email': e.email,
        'sitio_web': e.sitio_web,
        'horario': e.horario,
        'latitud': float(e.latitud) if e.latitud is not None else None,
        'longitud': float(e.longitud) if e.longitud is not None else None,
        'visitas': e.visitas + 1,
        'destacado': e.destacado,
        'servicios': servicios,
        'redes_sociales': redes_sociales,
        'emprendimientos_recomendados': emprendimientos_recomendados,
        'multimedia': multimedia,
    }
    resumen = stats_entidad('emprendimiento', e.id)
    data['promedio_calificacion'] = resumen['promedio_calificacion']
    data['total_resenas'] = resumen['total_resenas']
    return JsonResponse(data)
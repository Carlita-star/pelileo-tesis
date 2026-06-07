from django.http import JsonResponse
from django.views.decorators.http import require_GET

from src.domain.atractivos.models import Atractivo
from src.domain.rutas.models import Ruta
from src.domain.emprendimientos.models import Emprendimiento, EmprendimientoRelacion
from src.domain.usuarios.models import Usuario
from src.domain.eventos.models import Evento
from src.domain.auditorias.models import HistorialPublicacion, Auditoria
from src.domain.reportes.models import ReporteGenerado
from src.domain.empresa.models import Empresa, Configuracion
from django.db.models import F
from src.domain.multimedia.models import Multimedia

def _imagen_principal(tipo, entidad_id):
    m = (Multimedia.objects
         .filter(entidad_tipo=tipo, entidad_id=entidad_id, activo=True)
         .order_by('-principal', 'orden')
         .first())
    return m.archivo if m else None

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
                "publicaciones": "/api/publicaciones/",
                "reportes": "/api/reportes/",
                "auditorias": "/api/auditorias/",
                "configuracion": "/api/configuracion/",
            },
        }
    )


@require_GET
def atractivos_list(request):
    atractivos = (
        Atractivo.objects.filter(activo=True)
        .select_related('categoria', 'parroquia')
        .order_by('-destacado', '-visitas')[:20]
    )

    data = [
        {
            'id': a.id,
            'nombre': a.nombre,
            'imagen': _imagen_principal('atractivo', a.id),
            'slug': a.slug,
            'descripcion': a.descripcion,
            'categoria': a.categoria.nombre if a.categoria_id else None,
            'parroquia': a.parroquia.nombre if a.parroquia_id else None,
            'latitud': float(a.latitud) if a.latitud is not None else None,
            'longitud': float(a.longitud) if a.longitud is not None else None,
            'visitas': a.visitas,
            'destacado': a.destacado,
        }
        for a in atractivos
    ]

    return JsonResponse({'results': data})


@require_GET
def rutas_list(request):
    rutas = Ruta.objects.filter(activo=True).order_by('-destacado', '-creado_en')[:20]

    data = [
        {
            'id': r.id,
            'nombre': r.nombre,
            'descripcion': r.descripcion,
            'distancia_km': float(r.distancia_km) if r.distancia_km is not None else None,
            'duracion_estimada': r.duracion_estimada,
            'dificultad': r.dificultad,
            'num_atractivos': r.atractivos.filter(activo=True).count(),
            'lat_inicio': float(r.lat_inicio) if r.lat_inicio is not None else None,
            'lon_inicio': float(r.lon_inicio) if r.lon_inicio is not None else None,
            'imagen': _imagen_principal('ruta', r.id),
            'destacado': r.destacado,
        }
        for r in rutas
    ]

    return JsonResponse({'results': data})

@require_GET
def emprendimientos_list(request):
    emprendimientos = (
        Emprendimiento.objects.filter(activo=True)
        .select_related('categoria', 'parroquia', 'estado_publicacion')
        .order_by('-destacado', '-visitas')[:20]
    )

    data = [
        {
            'id': e.id,
            'nombre': e.nombre,
            'imagen': _imagen_principal('emprendimiento', e.id),
            'descripcion': e.descripcion,
            'categoria': e.categoria.nombre if e.categoria_id else None,
            'parroquia': e.parroquia.nombre if e.parroquia_id else None,
            'estado_publicacion': e.estado_publicacion.nombre if e.estado_publicacion_id else None,
            'telefono': e.telefono,
            'email': e.email,
            'sitio_web': e.sitio_web,
            'horario': e.horario,
            'latitud': float(e.latitud) if e.latitud is not None else None,
            'longitud': float(e.longitud) if e.longitud is not None else None,
            'visitas': e.visitas,
            'destacado': e.destacado,
        }
        for e in emprendimientos
    ]

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
    eventos = Evento.objects.filter(activo=True).select_related('categoria', 'estado_publicacion').order_by('fecha_inicio')[:20]

    data = [
        {
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
        for e in eventos
    ]

    return JsonResponse({'results': data})

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


@require_GET
def auditorias_list(request):
    auditorias = Auditoria.objects.select_related('usuario').order_by('-fecha')[:50]

    data = [
        {
            'id': a.id,
            'usuario': a.nombre_usuario or (a.usuario.nombre_completo if a.usuario_id else None),
            'tabla_afectada': a.tabla_afectada,
            'entidad_id': a.entidad_id,
            'accion': a.accion,
            'ip_address': a.ip_address,
            'fecha': a.fecha.isoformat() if a.fecha else None,
        }
        for a in auditorias
    ]

    return JsonResponse({'results': data})


@require_GET
def configuracion_list(request):
    empresa = Empresa.objects.first()

    if not empresa:
        return JsonResponse({'error': 'No hay configuración de empresa disponible.'}, status=404)

    configuraciones = Configuracion.objects.filter(empresa=empresa)
    headers = list(empresa.headers.values('mostrar_logo', 'mostrar_menu', 'mostrar_buscador', 'mostrar_redes', 'texto_superior', 'color_fondo', 'color_texto', 'altura_header', 'sticky'))
    footers = list(empresa.footers.values('descripcion', 'mostrar_redes', 'mostrar_contacto', 'mostrar_mapa', 'copyright_texto', 'color_fondo', 'color_texto'))

    data = {
        'empresa': {
            'id': empresa.id,
            'nombre': empresa.nombre,
            'nombre_comercial': empresa.nombre_comercial,
            'ruc': empresa.ruc,
            'telefono': empresa.telefono,
            'celular': empresa.celular,
            'email': empresa.email,
            'sitio_web': empresa.sitio_web,
            'direccion': empresa.direccion,
            'provincia': empresa.provincia,
            'canton': empresa.canton,
            'parroquia': empresa.parroquia,
            'descripcion': empresa.descripcion,
            'mision': empresa.mision,
            'vision': empresa.vision,
            'logo_principal': empresa.logo_principal,
            'logo_secundario': empresa.logo_secundario,
            'favicon': empresa.favicon,
            'estado': empresa.estado,
        },
        'apariencia': None,
        'configuraciones': [
            {
                'clave': c.clave,
                'valor': c.valor,
                'descripcion': c.descripcion,
                'tipo': c.tipo,
                'editable': c.editable,
            }
            for c in configuraciones
        ],
        'headers': headers,
        'footers': footers,
    }

    if hasattr(empresa, 'apariencia') and empresa.apariencia is not None:
        apariencia = empresa.apariencia
        data['apariencia'] = {
            'color_primario': apariencia.color_primario,
            'color_secundario': apariencia.color_secundario,
            'color_terciario': apariencia.color_terciario,
            'fuente_principal': apariencia.fuente_principal,
            'fuente_secundaria': apariencia.fuente_secundaria,
            'tamano_fuente_base': apariencia.tamano_fuente_base,
            'modo_oscuro': apariencia.modo_oscuro,
            'borde_radio': apariencia.borde_radio,
            'sombra_global': apariencia.sombra_global,
        }

    return JsonResponse(data)

@require_GET
def atractivos_detail(request, slug):
    try:
        a = (
            Atractivo.objects
            .select_related('categoria', 'parroquia', 'estado_publicacion')
            .get(slug=slug, activo=True)
        )
    except Atractivo.DoesNotExist:
        return JsonResponse({'error': 'Atractivo no encontrado'}, status=404)

    # P-03 pide subir el contador de visitas en cada carga.
    Atractivo.objects.filter(pk=a.pk).update(visitas=F('visitas') + 1)

    # Galería: tabla multimedia (polimórfica). La principal va primero.
    multimedia = [
        {'archivo': m.archivo, 'titulo': m.titulo, 'tipo': m.tipo, 'principal': m.principal}
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

    emprendimientos_cercanos = [
        {
            'id': r.emprendimiento.id,
            'nombre': r.emprendimiento.nombre,
            'descripcion': r.emprendimiento.descripcion,
            'imagen': _imagen_principal('emprendimiento', r.emprendimiento.id),
            'categoria': r.emprendimiento.categoria.nombre if r.emprendimiento.categoria_id else None,
            'distancia_referencial': float(r.distancia_referencial) if r.distancia_referencial is not None else None,
        }
        for r in EmprendimientoRelacion.objects
            .filter(atractivo=a)
            .select_related('emprendimiento', 'emprendimiento__categoria')
    ]

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
        'emprendimientos_cercanos': emprendimientos_cercanos,
    }
    return JsonResponse(data)

@require_GET
def rutas_detail(request, ruta_id):
    try:
        r = (Ruta.objects
             .select_related('parroquia', 'estado_publicacion')
             .get(pk=ruta_id, activo=True))
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
        for ra in r.atractivos.filter(activo=True).select_related('atractivo').order_by('orden_recorrido')
    ]

    multimedia = [
        {'archivo': m.archivo, 'titulo': m.titulo, 'principal': m.principal}
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
        for rel in EmprendimientoRelacion.objects.filter(ruta=r).select_related('emprendimiento', 'emprendimiento__categoria')
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
    return JsonResponse(data)

@require_GET
def emprendimientos_detail(request, emp_id):
    try:
        e = (Emprendimiento.objects
             .select_related('categoria', 'parroquia', 'estado_publicacion')
             .get(pk=emp_id, activo=True))
    except Emprendimiento.DoesNotExist:
        return JsonResponse({'error': 'Emprendimiento no encontrado'}, status=404)

    Emprendimiento.objects.filter(pk=e.pk).update(visitas=F('visitas') + 1)

    multimedia = [
        {'archivo': m.archivo, 'titulo': m.titulo, 'principal': m.principal}
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

    atractivos_cercanos = [
        {
            'id': rel.atractivo.id,
            'nombre': rel.atractivo.nombre,
            'slug': rel.atractivo.slug,
            'categoria': rel.atractivo.categoria.nombre if rel.atractivo.categoria_id else None,
            'descripcion': rel.atractivo.descripcion,
            'distancia_referencial': float(rel.distancia_referencial) if rel.distancia_referencial is not None else None,
            'imagen': _imagen_principal('atractivo', rel.atractivo.id),
        }
        for rel in EmprendimientoRelacion.objects
            .filter(emprendimiento=e, atractivo__isnull=False)
            .select_related('atractivo', 'atractivo__categoria')
    ]

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
        'atractivos_cercanos': atractivos_cercanos,
        'multimedia': multimedia,
    }
    return JsonResponse(data)
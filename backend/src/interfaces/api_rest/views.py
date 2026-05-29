from django.http import JsonResponse
from django.views.decorators.http import require_GET

from src.domain.atractivos.models import Atractivo
from src.domain.rutas.models import Ruta


@require_GET
def api_root(request):
    return JsonResponse(
        {
            "message": "API Turismo Pelileo",
            "routes": {
                "atractivos": "/api/atractivos/",
                "rutas": "/api/rutas/",
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
            'destacado': r.destacado,
        }
        for r in rutas
    ]

    return JsonResponse({'results': data})

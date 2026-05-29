from django.urls import path

from .views import api_root, atractivos_list, rutas_list

urlpatterns = [
    path('api/', api_root, name='api-root'),
    path('api/atractivos/', atractivos_list, name='api-atractivos'),
    path('api/rutas/', rutas_list, name='api-rutas'),
]

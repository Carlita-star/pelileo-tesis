from django.urls import path

from .views import (
    api_root,
    atractivos_list,
    rutas_list,
    emprendimientos_list,
    usuarios_list,
    eventos_list,
    publicaciones_list,
    reportes_list,
    auditorias_list,
    configuracion_list,
)
from .auth_views import register, login

urlpatterns = [
    path('api/', api_root, name='api-root'),
    path('api/atractivos/', atractivos_list, name='api-atractivos'),
    path('api/rutas/', rutas_list, name='api-rutas'),
    path('api/emprendimientos/', emprendimientos_list, name='api-emprendimientos'),
    path('api/usuarios/', usuarios_list, name='api-usuarios'),
    path('api/eventos/', eventos_list, name='api-eventos'),
    path('api/publicaciones/', publicaciones_list, name='api-publicaciones'),
    path('api/reportes/', reportes_list, name='api-reportes'),
    path('api/auditorias/', auditorias_list, name='api-auditorias'),
    path('api/configuracion/', configuracion_list, name='api-configuracion'),
    path('api/auth/register/', register, name='api-auth-register'),
    path('api/auth/login/', login, name='api-auth-login'),
]

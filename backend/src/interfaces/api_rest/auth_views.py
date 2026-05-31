import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from src.domain.usuarios.models import Usuario


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """
    Endpoint para registrar un nuevo usuario.
    
    Body JSON esperado:
    {
        "nombres": "Juan",
        "apellidos": "Pérez",
        "username": "juanperez",
        "email": "juan@example.com",
        "password": "micontraseña123"
    }
    """
    try:
        data = json.loads(request.body)
        
        # Validar campos requeridos
        required_fields = ['nombres', 'apellidos', 'username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse(
                    {'error': f'El campo {field} es requerido.'},
                    status=400
                )
        
        # Verificar si el usuario ya existe
        if Usuario.objects.filter(username=data['username']).exists():
            return JsonResponse(
                {'error': 'El usuario ya existe.'},
                status=400
            )
        
        if Usuario.objects.filter(email=data['email']).exists():
            return JsonResponse(
                {'error': 'El email ya está registrado.'},
                status=400
            )
        
        # Crear el usuario
        usuario = Usuario.objects.create(
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            username=data['username'],
            email=data['email'],
            activo=True
        )
        
        # Establecer la contraseña (Django la hashea automáticamente)
        usuario.set_password(data['password'])
        usuario.save()
        
        return JsonResponse(
            {
                'message': 'Usuario registrado exitosamente.',
                'usuario': {
                    'id': usuario.id,
                    'nombres': usuario.nombres,
                    'apellidos': usuario.apellidos,
                    'username': usuario.username,
                    'email': usuario.email,
                }
            },
            status=201
        )
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """
    Endpoint para autenticar un usuario.
    
    Body JSON esperado:
    {
        "username": "juanperez",
        "password": "micontraseña123"
    }
    """
    try:
        data = json.loads(request.body)
        
        # Validar campos requeridos
        if not data.get('username') or not data.get('password'):
            return JsonResponse(
                {'error': 'Usuario y contraseña son requeridos.'},
                status=400
            )
        
        # Buscar el usuario
        try:
            usuario = Usuario.objects.get(username=data['username'])
        except Usuario.DoesNotExist:
            return JsonResponse(
                {'error': 'Usuario o contraseña incorrectos.'},
                status=401
            )
        
        # Verificar si el usuario está activo
        if not usuario.activo or usuario.eliminado_en is not None:
            return JsonResponse(
                {'error': 'Usuario inactivo o eliminado.'},
                status=401
            )
        
        # Verificar contraseña
        if not usuario.check_password(data['password']):
            return JsonResponse(
                {'error': 'Usuario o contraseña incorrectos.'},
                status=401
            )
        
        # Actualizar último acceso
        from django.utils import timezone
        usuario.ultimo_acceso = timezone.now()
        usuario.save(update_fields=['ultimo_acceso'])
        
        # Retornar datos del usuario (sin la contraseña)
        return JsonResponse(
            {
                'message': 'Login exitoso.',
                'usuario': {
                    'id': usuario.id,
                    'nombres': usuario.nombres,
                    'apellidos': usuario.apellidos,
                    'nombre_completo': usuario.nombre_completo,
                    'username': usuario.username,
                    'email': usuario.email,
                }
            },
            status=200
        )
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

from src.application.dto.usuario_dto import LoginCredentialsDTO
from src.application.services.email_service import EmailService
from src.application.services.jwt_service import JwtService
from src.application.use_cases.usuarios.cambiar_password import RestablecerPasswordUseCase
from src.application.use_cases.usuarios.login_usuario import LoginUsuarioUseCase
from src.application.use_cases.usuarios.recuperar_password import RecuperarPasswordUseCase
from src.application.validators.admin_forms import validar_registro_usuario
from src.domain.shared.field_validation import FormValidationError
from src.infrastructure.repositories.django_usuario_repository import DjangoUsuarioRepository
from src.interfaces.api_rest.auth_utils import user_has_panel_access
from src.domain.roles.helpers import asegurar_rol_visitante
from src.domain.usuarios.models import Usuario


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """Endpoint para registrar un nuevo usuario."""
    try:
        data = json.loads(request.body)
        validar_registro_usuario(data)

        if Usuario.objects.filter(username=data['username']).exists():
            return JsonResponse({'error': 'El usuario ya existe.'}, status=400)

        if Usuario.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'El email ya está registrado.'}, status=400)

        usuario = Usuario.objects.create(
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            username=data['username'],
            email=data['email'],
            activo=True,
        )
        usuario.set_password(data['password'])
        usuario.save()

        asegurar_rol_visitante(usuario)

        return JsonResponse(
            {
                'message': 'Cuenta creada exitosamente. Ya puedes usar el portal turístico.',
                'usuario': {
                    'id': usuario.id,
                    'nombres': usuario.nombres,
                    'apellidos': usuario.apellidos,
                    'username': usuario.username,
                    'email': usuario.email,
                    'roles': ['visitante'],
                },
            },
            status=201,
        )
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except FormValidationError as exc:
        return JsonResponse({'error': str(exc), 'errors': exc.errors}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """Endpoint para autenticar un usuario con JWT."""
    try:
        data = json.loads(request.body)
        username_or_email = data.get('username') or data.get('email')
        password = data.get('password')

        if not username_or_email or not password:
            return JsonResponse({'error': 'Usuario y contraseña son requeridos.'}, status=400)

        repository = DjangoUsuarioRepository()
        jwt_service = JwtService(settings.SECRET_KEY, expiration_seconds=60 * 60 * 24)
        use_case = LoginUsuarioUseCase(repository, jwt_service)

        result = use_case.execute(LoginCredentialsDTO(username_or_email=username_or_email, password=password))
        usuario = result['usuario']

        usuario_model = Usuario.objects.filter(id=usuario.id).prefetch_related('usuario_roles__rol').first()
        panel_access = bool(usuario_model and user_has_panel_access(usuario_model))

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
                    'roles': usuario.roles,
                },
                'token': result['token'],
                'panel_access': panel_access,
            },
            status=200,
        )
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def password_reset_request(request):
    """Endpoint para solicitar el restablecimiento de contraseña."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        if not email:
            return JsonResponse({'error': 'El correo electrónico es requerido.'}, status=400)

        repository = DjangoUsuarioRepository()
        email_service = EmailService()
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        use_case = RecuperarPasswordUseCase(repository, email_service, frontend_url)

        message = use_case.execute(email)
        return JsonResponse({'message': message}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def password_reset_confirm(request):
    """Endpoint para restablecer la contraseña usando un token."""
    try:
        data = json.loads(request.body)
        token = data.get('token')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        repository = DjangoUsuarioRepository()
        use_case = RestablecerPasswordUseCase(repository)
        message = use_case.execute(token, password, confirm_password)

        return JsonResponse({'message': message}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido.'}, status=400)
    except ValueError as exc:
        return JsonResponse({'error': str(exc)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

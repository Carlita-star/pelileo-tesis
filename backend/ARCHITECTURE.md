# Arquitectura del proyecto

## Visión general

El proyecto usa una separación de responsabilidades similar a una arquitectura hexagonal / clean architecture.

- `frontend/` contiene la aplicación React que consume la API REST.
- `backend/` contiene el servidor Django y la lógica de negocio.
- `backend/src/` es la parte del backend que implementa la arquitectura en capas.
- `hexagonal/` parece ser un código adicional o ejemplo, pero no forma parte de la ruta principal del backend.

## Diagrama de capas

```
         +------------------------------+
         |        frontend/ (React)      |
         |  pages/, components/, App.js  |
         +-------------+----------------+
                       |
                       | HTTP REST / AJAX
                       v
+-------------------------------------------------------------+
|                      backend/src/                           |
|                                                             |
|  +----------------+    +------------------+    +-----------+ |
|  |  interfaces/   | -> |  application/    | -> | domain/   | |
|  |  api_rest/     |    |  use_cases/      |    | entities/ | |
|  |  auth_views/   |    |  ports/          |    | models/   | |
|  |  urls.py       |    |  services/       |    +-----------+ |
|  +----------------+    +------------------+                  |
|                             ^    |                          |
|                             |    v                          |
|                      +------------------+                   |
|                      | infrastructure/  |                   |
|                      | repositories/    |                   |
|                      | external_services|                   |
|                      +------------------+                   |
+-------------------------------------------------------------+
```

## Qué hace cada carpeta

- `backend/src/interfaces/`
  - Adaptadores de entrada.
  - Define los endpoints REST y las vistas que reciben las peticiones HTTP.
  - Ejemplo: `api_rest/urls.py`, `auth_views.py`.

- `backend/src/application/`
  - Contiene los casos de uso del sistema.
  - Orquesta operaciones usando puertos y servicios.
  - Incluye:
    - `use_cases/` para funciones como login, creación de usuarios, búsquedas de atractivos.
    - `ports/` para interfaces abstractas de repositorios.
    - `services/` para servicios transversales como JWT, email o mapas.

- `backend/src/domain/`
  - Contiene entidades y reglas de negocio puras.
  - No depende de Django ni de la infraestructura.
  - Ejemplo: `UsuarioEntity` valida username, email y define comportamientos.

- `backend/src/infrastructure/`
  - Implementa los adaptadores concretos.
  - Usa Django ORM y servicios reales.
  - Ejemplo: `django_usuario_repository.py` implementa `UsuarioRepositoryPort`.

## Flujo típico de una petición

1. El usuario hace una petición desde el frontend React.
2. El endpoint en `interfaces/api_rest/` recibe la solicitud.
3. Ese endpoint llama a un caso de uso en `application/use_cases/`.
4. El caso de uso usa un puerto de repositorio definido en `application/ports/`.
5. La implementación concreta del puerto está en `infrastructure/repositories/`.
6. La infraestructura accede a la base de datos y devuelve entidades al caso de uso.
7. El caso de uso devuelve datos al endpoint, que responde al frontend.

## Notas prácticas

- `domain/` es la lógica de negocio.
- `application/` es la lógica de aplicación.
- `infrastructure/` es la parte técnica que conecta con Django, base de datos y servicios.
- `interfaces/` es la capa de presentación / entrada.

## Archivos clave

- `backend/manage.py` → arranque de Django.
- `backend/backend/settings.py` → configuración de Django.
- `backend/db.sqlite3` → base de datos local.
- `backend/media/` → archivos subidos.
- `frontend/src/` → UI React.

## Observación

La carpeta `hexagonal/` no parece ser la ruta activa del backend actual; el backend principal utiliza `backend/src/`.

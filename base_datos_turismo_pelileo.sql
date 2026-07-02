-- =========================================================
-- BASE DE DATOS
-- SISTEMA TURISTICO GAD MUNICIPAL DE PELILEO
-- PostgreSQL
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- EMPRESA E IDENTIDAD INSTITUCIONAL
-- =========================================================

CREATE TABLE empresas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    ruc VARCHAR(13) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    celular VARCHAR(20),
    email VARCHAR(150),
    sitio_web VARCHAR(255),
    direccion TEXT,
    provincia VARCHAR(100),
    canton VARCHAR(100),
    parroquia VARCHAR(100),
    descripcion TEXT,
    historia TEXT,
    mision TEXT,
    vision TEXT,
    logo_principal VARCHAR(255),
    logo_secundario VARCHAR(255),
    favicon VARCHAR(255),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    estado BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE apariencia_sistema (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT UNIQUE NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    color_primario VARCHAR(20),
    color_secundario VARCHAR(20),
    color_terciario VARCHAR(20),
    fuente_principal VARCHAR(100),
    fuente_secundaria VARCHAR(100),
    tamano_fuente_base INTEGER DEFAULT 16,
    modo_oscuro BOOLEAN DEFAULT FALSE,
    borde_radio INTEGER DEFAULT 10,
    sombra_global BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracion_header (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    mostrar_logo BOOLEAN DEFAULT TRUE,
    mostrar_menu BOOLEAN DEFAULT TRUE,
    mostrar_buscador BOOLEAN DEFAULT TRUE,
    mostrar_redes BOOLEAN DEFAULT TRUE,
    texto_superior VARCHAR(255),
    color_fondo VARCHAR(20),
    color_texto VARCHAR(20),
    altura_header INTEGER DEFAULT 80,
    sticky BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracion_footer (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    descripcion TEXT,
    mostrar_redes BOOLEAN DEFAULT TRUE,
    mostrar_contacto BOOLEAN DEFAULT TRUE,
    mostrar_mapa BOOLEAN DEFAULT TRUE,
    copyright_texto VARCHAR(255),
    color_fondo VARCHAR(20),
    color_texto VARCHAR(20),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_navegacion (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    menu_padre_id BIGINT REFERENCES menu_navegacion(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    ruta VARCHAR(255),
    icono VARCHAR(100),
    orden INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    tipo_enlace VARCHAR(50),
    abierto_nueva_pestana BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE redes_sociales (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100),
    icono VARCHAR(100),
    url TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuraciones (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    clave VARCHAR(150) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    tipo VARCHAR(50),
    editable BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEGURIDAD
-- =========================================================

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    last_login TIMESTAMP,
    token_recuperacion TEXT,
    token_expira_en TIMESTAMP,
    foto_perfil VARCHAR(255),
    telefono VARCHAR(20),
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    eliminado_en TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE permisos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuario_roles (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE rol_permisos (
    id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id BIGINT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE
);

-- =========================================================
-- CATALOGOS
-- =========================================================

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE parroquias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    canton VARCHAR(150),
    provincia VARCHAR(150),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE servicios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE actividades (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE catalogo_estados_publicacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    visible_publico BOOLEAN DEFAULT TRUE
);

-- =========================================================
-- ATRACTIVOS
-- =========================================================

CREATE TABLE atractivos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id),
    parroquia_id BIGINT NOT NULL REFERENCES parroquias(id),
    creado_por BIGINT NOT NULL REFERENCES usuarios(id),
    estado_publicacion_id BIGINT NOT NULL REFERENCES catalogo_estados_publicacion(id),
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    altitud DECIMAL(8,2),
    horario VARCHAR(255),
    precio_referencial DECIMAL(10,2),
    visitas INTEGER DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atractivo_detalles (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT UNIQUE NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,011123111111111111111111111111112211
    clima VARCHAR(100),
    temperatura VARCHAR(50),
    precipitacion VARCHAR(50),
    linea_producto VARCHAR(100),
    escenario VARCHAR(100),
    tipo_ingreso VARCHAR(100),
    costo DECIMAL(10,2),
    horario VARCHAR(255),
    formas_pago TEXT,
    meses_recomendados TEXT,
    observaciones TEXT
);

CREATE TABLE atractivo_administracion (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT UNIQUE NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    tipo_administrador VARCHAR(100),
    institucion_responsable VARCHAR(255),
    nombre_administrador VARCHAR(255),
    cargo VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(150)
);

CREATE TABLE atractivo_accesibilidad (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT UNIQUE NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    tipo_via VARCHAR(100),
    estado_via VARCHAR(100),
    tipo_transporte VARCHAR(100),
    tiempo_desplazamiento VARCHAR(100),
    distancia_referencial_km DECIMAL(10,2),
    posee_senalizacion BOOLEAN,
    acceso_discapacidad BOOLEAN,
    observaciones TEXT
);

CREATE TABLE atractivo_estado_conservacion (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT UNIQUE NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    estado_conservacion VARCHAR(100),
    nivel_seguridad VARCHAR(100),
    posee_senal_internet BOOLEAN,
    cobertura_operadora VARCHAR(100),
    centro_salud_cercano VARCHAR(255),
    distancia_centro_salud_km DECIMAL(10,2),
    observaciones TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atractivo_servicios (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id),
    observacion TEXT
);

CREATE TABLE atractivo_actividades (
    id BIGSERIAL PRIMARY KEY,
    atractivo_id BIGINT NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    actividad_id BIGINT NOT NULL REFERENCES actividades(id),
    observacion TEXT
);

-- =========================================================
-- RUTAS
-- =========================================================

CREATE TABLE rutas (
    id BIGSERIAL PRIMARY KEY,
    estado_publicacion_id BIGINT NOT NULL REFERENCES catalogo_estados_publicacion(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    distancia_km DECIMAL(10,2),
    duracion_estimada VARCHAR(100),
    dificultad VARCHAR(50),
    punto_inicio VARCHAR(255),
    punto_fin VARCHAR(255),
    lat_inicio DECIMAL(10,8),
    lon_inicio DECIMAL(11,8),
    lat_fin DECIMAL(10,8),
    lon_fin DECIMAL(11,8),
    geojson_ruta JSONB,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ruta_atractivos (
    id BIGSERIAL PRIMARY KEY,
    ruta_id BIGINT NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    atractivo_id BIGINT NOT NULL REFERENCES atractivos(id) ON DELETE CASCADE,
    orden_recorrido INTEGER
);

-- =========================================================
-- EMPRENDIMIENTOS
-- =========================================================

CREATE TABLE emprendimientos (
    id BIGSERIAL PRIMARY KEY,
    parroquia_id BIGINT NOT NULL REFERENCES parroquias(id),
    categoria_id BIGINT REFERENCES categorias(id),
    estado_publicacion_id BIGINT NOT NULL REFERENCES catalogo_estados_publicacion(id),
    creado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(150),
    sitio_web VARCHAR(255),
    horario VARCHAR(255),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    activo BOOLEAN DEFAULT TRUE,
    visitas INTEGER DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emprendimiento_servicios (
    id BIGSERIAL PRIMARY KEY,
    emprendimiento_id BIGINT NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
    servicio_id BIGINT NOT NULL REFERENCES servicios(id),
    observacion TEXT
);

CREATE TABLE emprendimiento_redes_sociales (
    id BIGSERIAL PRIMARY KEY,
    emprendimiento_id BIGINT NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
    nombre_red VARCHAR(100),
    url TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE emprendimiento_relaciones (
    id BIGSERIAL PRIMARY KEY,
    emprendimiento_id BIGINT NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
    atractivo_id BIGINT REFERENCES atractivos(id),
    ruta_id BIGINT REFERENCES rutas(id),
    distancia_referencial DECIMAL(10,2)
);

-- =========================================================
-- EVENTOS
-- =========================================================

CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id),
    estado_publicacion_id BIGINT NOT NULL REFERENCES catalogo_estados_publicacion(id),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    direccion TEXT,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    costo DECIMAL(10,2),
    organizador VARCHAR(255),
    contacto VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- MULTIMEDIA
-- =========================================================

CREATE TABLE multimedia (
    id BIGSERIAL PRIMARY KEY,
    entidad_tipo VARCHAR(50),
    entidad_id BIGINT,
    archivo VARCHAR(255),
    titulo VARCHAR(255),
    descripcion TEXT,
    tipo VARCHAR(50),
    principal BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- HISTORIAL PUBLICACION
-- =========================================================

CREATE TABLE historial_publicacion (
    id BIGSERIAL PRIMARY KEY,
    entidad_tipo VARCHAR(50),
    entidad_id BIGINT,
    estado_anterior_id BIGINT REFERENCES catalogo_estados_publicacion(id),
    estado_nuevo_id BIGINT REFERENCES catalogo_estados_publicacion(id),
    cambiado_por BIGINT REFERENCES usuarios(id),
    observacion TEXT,
    cambiado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- AUDITORIAS
-- =========================================================

CREATE TABLE auditorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    nombre_usuario VARCHAR(255),
    tabla_afectada VARCHAR(100),
    entidad_id BIGINT,
    accion VARCHAR(50),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- REPORTES
-- =========================================================

CREATE TABLE reportes_generados (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    tipo_reporte VARCHAR(100),
    formato VARCHAR(20),
    parametros JSONB,
    archivo_generado VARCHAR(255),
    generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- ESTADISTICAS
-- =========================================================

CREATE TABLE consultas_estadisticas (
    id BIGSERIAL PRIMARY KEY,
    entidad_tipo VARCHAR(50),
    entidad_id BIGINT,
    fecha DATE,
    visitas INTEGER DEFAULT 0,
    origen VARCHAR(100)
);

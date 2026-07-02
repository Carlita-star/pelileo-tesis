import {
  addError,
  buildValidationResult,
  validateDecimal,
  validateDescription,
  validateEmail,
  validateFreeText,
  validateGalleryRequired,
  validateHexColor,
  validateId,
  validateInteger,
  validateLatitude,
  validateLocationRequired,
  validateLongitude,
  normalize,
  normalizeUrl,
  validatePassword,
  validatePhoneEc,
  validateRucEc,
  validateSlug,
  validateTextName,
  validateUrl,
  validateUsername,
} from './formValidation';

function finish(errors) {
  return buildValidationResult(errors);
}

export function validateAtractivoForm(formData, { publish = false, imageCount = 0, entityId = null } = {}) {
  const g = formData.general || {};
  const u = formData.ubicacion || {};
  const a = formData.administracion || {};
  const errors = {};

  addError(errors, 'general.nombre', validateTextName(g.nombre, 'Nombre del atractivo', { min: 5, max: 100 }));
  addError(errors, 'general.slug', validateSlug(g.slug));
  addError(errors, 'general.categoria_id', validateId(g.categoria_id, 'Categoría'));
  addError(errors, 'general.parroquia_id', validateId(g.parroquia_id, 'Parroquia'));
  addError(errors, 'general.descripcion', validateDescription(g.descripcion, 'Descripción', { required: true }));

  if (g.direccion) addError(errors, 'general.direccion', validateFreeText(g.direccion, 'Dirección', { max: 200 }));
  if (g.horario) addError(errors, 'general.horario', validateFreeText(g.horario, 'Horario', { max: 120 }));
  if (g.precio_referencial != null && g.precio_referencial !== '') {
    addError(errors, 'general.precio_referencial', validateDecimal(g.precio_referencial, 'Precio referencial', { min: 0, max: 999999 }));
  }

  Object.assign(errors, validateLocationRequired(u, { required: publish }));
  addError(errors, 'ubicacion.latitud', validateLatitude(u.latitud, { required: publish }));
  addError(errors, 'ubicacion.longitud', validateLongitude(u.longitud, { required: publish }));

  if (u.altitud != null && u.altitud !== '') {
    addError(errors, 'ubicacion.altitud', validateDecimal(u.altitud, 'Altitud', { min: -500, max: 6500 }));
  }
  if (a.nombre_administrador) {
    addError(errors, 'administracion.nombre_administrador', validateTextName(a.nombre_administrador, 'Nombre del administrador', { required: false }));
  }
  if (a.telefono) addError(errors, 'administracion.telefono', validatePhoneEc(a.telefono));
  if (a.correo) addError(errors, 'administracion.correo', validateEmail(a.correo));

  const galleryError = validateGalleryRequired(imageCount, { publish, hasEntityId: Boolean(entityId) });
  if (galleryError) errors.galeria = galleryError;

  return finish(errors);
}

export function validateRutaForm(formData, { publish = false, imageCount = 0, entityId = null } = {}) {
  const g = formData.general || {};
  const errors = {};
  const dificultades = new Set(['facil', 'moderado', 'dificil']);

  addError(errors, 'general.nombre', validateTextName(g.nombre, 'Nombre de la ruta', { min: 5, max: 100 }));
  addError(errors, 'general.parroquia_id', validateId(g.parroquia_id, 'Parroquia'));
  addError(errors, 'general.descripcion', validateDescription(g.descripcion, 'Descripción', { required: true }));

  if (!g.dificultad) {
    errors['general.dificultad'] = 'La dificultad es obligatoria.';
  } else if (!dificultades.has(g.dificultad)) {
    errors['general.dificultad'] = 'Seleccione una dificultad válida.';
  }

  if (publish || (g.distancia_km != null && g.distancia_km !== '')) {
    addError(errors, 'general.distancia_km', validateDecimal(g.distancia_km, 'Distancia (km)', {
      min: 0.1, max: 9999, required: publish,
    }));
  }

  if (publish && (formData.atractivos_orden || []).length < 2) {
    errors.atractivos_orden = 'Debe asociar al menos 2 atractivos para publicar la ruta.';
  }

  const galleryError = validateGalleryRequired(imageCount, { publish, hasEntityId: Boolean(entityId) });
  if (galleryError) errors.galeria = galleryError;

  return finish(errors);
}

export function validateEmprendimientoForm(formData, { publish = false, imageCount = 0, entityId = null } = {}) {
  const g = formData.general || {};
  const u = formData.ubicacion || {};
  const errors = {};

  addError(errors, 'general.nombre', validateTextName(g.nombre, 'Nombre del emprendimiento', { min: 4, max: 100 }));
  addError(errors, 'general.parroquia_id', validateId(g.parroquia_id, 'Parroquia'));
  addError(errors, 'general.descripcion', validateDescription(g.descripcion, 'Descripción', { required: true }));

  if (g.direccion) addError(errors, 'general.direccion', validateFreeText(g.direccion, 'Dirección', { min: 5, max: 200 }));
  if (publish || g.telefono) addError(errors, 'general.telefono', validatePhoneEc(g.telefono, 'Teléfono', { required: publish }));
  if (g.email) addError(errors, 'general.email', validateEmail(g.email));

  Object.assign(errors, validateLocationRequired(u, { required: publish }));
  addError(errors, 'ubicacion.latitud', validateLatitude(u.latitud, { required: publish }));
  addError(errors, 'ubicacion.longitud', validateLongitude(u.longitud, { required: publish }));

  const galleryError = validateGalleryRequired(imageCount, { publish, hasEntityId: Boolean(entityId) });
  if (galleryError) errors.galeria = galleryError;

  return finish(errors);
}

export function validateConfiguracionForm(form) {
  const empresa = form.empresa || {};
  const apariencia = form.apariencia || {};
  const header = form.header || {};
  const footer = form.footer || {};
  const errors = {};

  addError(errors, 'empresa.nombre', validateFreeText(empresa.nombre, 'Nombre institucional', { min: 5, max: 200, required: true }));
  addError(errors, 'empresa.nombre_comercial', validateFreeText(empresa.nombre_comercial, 'Nombre comercial', { min: 3, max: 100, required: true }));
  addError(errors, 'empresa.ruc', validateRucEc(empresa.ruc));
  addError(errors, 'empresa.email', validateEmail(empresa.email, 'Correo electrónico', { required: true }));
  addError(errors, 'empresa.telefono', validatePhoneEc(empresa.telefono, 'Teléfono', { required: true }));
  if (empresa.celular) addError(errors, 'empresa.celular', validatePhoneEc(empresa.celular, 'Celular'));
  if (empresa.sitio_web) addError(errors, 'empresa.sitio_web', validateUrl(normalizeUrl(empresa.sitio_web), 'Sitio web'));
  addError(errors, 'empresa.descripcion', validateDescription(empresa.descripcion, 'Descripción', { min: 20, max: 1000 }));
  if (empresa.mision?.trim()) {
    addError(errors, 'empresa.mision', validateDescription(empresa.mision, 'Misión', { min: 20, max: 1000, required: false }));
  }
  if (empresa.vision?.trim()) {
    addError(errors, 'empresa.vision', validateDescription(empresa.vision, 'Visión', { min: 20, max: 1000, required: false }));
  }
  addError(errors, 'apariencia.color_primario', validateHexColor(apariencia.color_primario, 'Color primario'));
  addError(errors, 'apariencia.color_secundario', validateHexColor(apariencia.color_secundario, 'Color secundario'));
  addError(errors, 'apariencia.tamano_fuente_base', validateInteger(apariencia.tamano_fuente_base, 'Tamaño de fuente', { min: 12, max: 30, required: true }));
  addError(errors, 'header.texto_superior', validateFreeText(header.texto_superior, 'Texto del encabezado', { min: 3, max: 120, required: true }));
  if (footer.copyright_texto?.trim()) {
    addError(errors, 'footer.copyright_texto', validateFreeText(footer.copyright_texto, 'Copyright', { min: 5, max: 200 }));
  }
  if (footer.descripcion?.trim()) {
    addError(errors, 'footer.descripcion', validateDescription(footer.descripcion, 'Descripción del pie', { min: 10, max: 500, required: false }));
  }

  (form.menus || []).forEach((item, index) => {
    if (item.visible === false) return;
    addError(errors, `menus.${index}.nombre`, validateFreeText(item.nombre, 'Nombre del menú', { min: 2, max: 40, required: true }));
    addError(errors, `menus.${index}.ruta`, validateFreeText(item.ruta, 'Ruta del menú', { min: 1, max: 120, required: true }));
  });

  (form.redes || []).forEach((item, index) => {
    const url = normalize(item.url);
    const nombre = normalize(item.nombre);
    if (!url && !nombre) return;
    if (!url) {
      errors[`redes.${index}.url`] = 'Ingrese la URL de la red social (ejemplo: https://facebook.com/gad).';
      return;
    }
    addError(errors, `redes.${index}.nombre`, validateFreeText(nombre, 'Nombre de la red social', { min: 2, max: 40, required: true }));
    addError(errors, `redes.${index}.url`, validateUrl(normalizeUrl(url), 'URL de red social', { required: true }));
  });

  if (
    apariencia.color_primario
    && apariencia.color_secundario
    && apariencia.color_primario.toUpperCase() === apariencia.color_secundario.toUpperCase()
  ) {
    errors['apariencia.color_secundario'] = 'El color secundario debe ser diferente al primario.';
  }

  return finish(errors);
}

export function getConfiguracionErrorTab(errors) {
  const key = Object.keys(errors)[0] || '';
  if (key.startsWith('empresa.')) return 'institucional';
  if (key.startsWith('apariencia.')) return 'identidad';
  if (key.startsWith('header.')) return 'header';
  if (key.startsWith('footer.')) return 'footer';
  if (key.startsWith('menus.')) return 'menu';
  if (key.startsWith('redes.')) return 'redes';
  return 'institucional';
}

export function validateRegisterForm({ nombres, apellidos, registerUsername, registerEmail, registerPassword, registerConfirmPassword }) {
  const errors = {};
  addError(errors, 'nombres', validateTextName(nombres, 'Nombres', { min: 2, max: 50 }));
  addError(errors, 'apellidos', validateTextName(apellidos, 'Apellidos', { min: 2, max: 50 }));
  addError(errors, 'registerUsername', validateUsername(registerUsername));
  addError(errors, 'registerEmail', validateEmail(registerEmail, 'Correo electrónico', { required: true }));
  addError(errors, 'registerPassword', validatePassword(registerPassword));
  if (registerPassword !== registerConfirmPassword) {
    errors.registerConfirmPassword = 'Las contraseñas no coinciden.';
  }
  return finish(errors);
}

/** Devuelve el índice de pestaña del formulario de atractivo según el primer error. */
export function getAtractivoErrorTab(errors) {
  const key = Object.keys(errors)[0] || '';
  if (key.startsWith('general.')) return 0;
  if (key.startsWith('ubicacion.')) return 1;
  if (key.startsWith('administracion.')) return 5;
  if (key === 'galeria') return 7;
  return 0;
}

export function getRutaErrorSection(errors) {
  if (errors.galeria) return 'gallery';
  if (errors.atractivos_orden) return 'atractivos';
  return 'general';
}

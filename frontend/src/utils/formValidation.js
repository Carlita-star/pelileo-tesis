/**
 * Validadores compartidos para formularios del panel administrativo.
 */

const EMAIL_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const TEXT_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,49}$/;
const TEXT_CITY_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü][A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]{2,59}$/;
const SIGNED_DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;
const DIGITS_ONLY_PATTERN = /^\d+$/;
const PHONE_EC_PATTERN = /^(09\d{8}|0[2-7]\d{7,8})$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

const BLOCKED_VALUES = new Set([
  'test', 'prueba', 'xxxxx', 'aaaaaa', 'bbbbbb', 'cccccc',
  '123456', '1234567', '12345678', '000000', '111111', '222222',
  'asdf', 'qwerty', 'dummy', 'lorem', 'ipsum', 'nombre', 'apellido',
  'usuario', 'admin', 'sin nombre', 'n/a', 'na', 'xxx', 'yyy', 'zzz',
]);

export function normalize(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function isFillerText(value) {
  const text = normalize(value).toLowerCase();
  if (!text) return false;
  if (BLOCKED_VALUES.has(text)) return true;

  const compact = text.replace(/\s+/g, '');
  if (compact.length >= 4 && /^\d+$/.test(compact)) return true;
  if (compact.length >= 4 && new Set(compact).size === 1) return true;
  if (/(.)\1{4,}/.test(compact)) return true;
  return false;
}

export function normalizeUrl(value) {
  const text = normalize(value);
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

export function validateTextName(value, label, { min = 3, max = 50, required = true } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (text.length < min || text.length > max) {
    return `${label} debe tener entre ${min} y ${max} caracteres.`;
  }
  if (!TEXT_NAME_PATTERN.test(text)) {
    return `${label} solo puede contener letras, espacios, guiones y apóstrofes.`;
  }
  if (isFillerText(text)) return `${label} no parece un valor válido. Ingresa un dato real.`;
  return null;
}

export function validateTextCity(value, label, { required = false } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (!TEXT_CITY_PATTERN.test(text)) {
    return `${label} solo puede contener letras y espacios.`;
  }
  if (isFillerText(text)) return `${label} no parece un valor válido.`;
  return null;
}

export function validateDescription(value, label = 'Descripción', { min = 20, max = 2000, required = true } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatoria.` : null;
  if (text.length < min || text.length > max) {
    return `${label} debe tener entre ${min} y ${max} caracteres.`;
  }
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(text)) {
    return `${label} debe incluir al menos letras.`;
  }
  if (isFillerText(text)) return `${label} no parece un texto válido.`;
  return null;
}

export function validateFreeText(value, label, { min = 0, max = 255, required = false } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (text.length < min || text.length > max) {
    return `${label} debe tener entre ${min} y ${max} caracteres.`;
  }
  if (isFillerText(text)) return `${label} no parece un valor válido.`;
  return null;
}

export function validateSlug(value, { required = true } = {}) {
  const text = normalize(value).toLowerCase();
  if (!text) return required ? 'El slug es obligatorio.' : null;
  if (text.length < 3 || text.length > 80) return 'El slug debe tener entre 3 y 80 caracteres.';
  if (!SLUG_PATTERN.test(text)) {
    return 'El slug solo puede usar letras minúsculas, números y guiones.';
  }
  if (isFillerText(text)) return 'El slug no es válido.';
  return null;
}

export function validateEmail(value, label = 'Correo electrónico', { required = false } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (!EMAIL_PATTERN.test(text)) {
    return `${label} debe tener un formato válido (ejemplo: usuario@dominio.com).`;
  }
  if (isFillerText(text.split('@')[0])) return `${label} no parece válido.`;
  return null;
}

export function validatePhoneEc(value, label = 'Teléfono', { required = false } = {}) {
  const text = normalize(value).replace(/[\s\-()]/g, '');
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (!DIGITS_ONLY_PATTERN.test(text)) return `${label} solo puede contener números.`;
  if (!PHONE_EC_PATTERN.test(text)) {
    return `${label} inválido. Use formato ecuatoriano: 09XXXXXXXX o código de área 02-07.`;
  }
  return null;
}

export function validateInteger(value, label, { min, max, required = false } = {}) {
  if (value === null || value === undefined || value === '') {
    return required ? `${label} es obligatorio.` : null;
  }
  const text = normalize(value);
  if (!DIGITS_ONLY_PATTERN.test(text)) return `${label} solo puede contener números enteros.`;
  const number = Number(text);
  if (min !== undefined && number < min) return `${label} no puede ser menor que ${min}.`;
  if (max !== undefined && number > max) return `${label} no puede ser mayor que ${max}.`;
  return null;
}

export function validateDecimal(value, label, { min, max, required = false } = {}) {
  if (value === null || value === undefined || value === '') {
    return required ? `${label} es obligatorio.` : null;
  }
  const text = normalize(value).replace(',', '.');
  if (!SIGNED_DECIMAL_PATTERN.test(text)) {
    return `${label} debe ser un número válido (puede usar signo negativo y decimales).`;
  }
  const number = Number(text);
  if (Number.isNaN(number)) return `${label} debe ser un número válido.`;
  if (min !== undefined && number < min) return `${label} no puede ser menor que ${min}.`;
  if (max !== undefined && number > max) return `${label} no puede ser mayor que ${max}.`;
  return null;
}

export function validateLatitude(value, { required = false } = {}) {
  return validateDecimal(value, 'Latitud', { min: -90, max: 90, required });
}

export function validateLongitude(value, { required = false } = {}) {
  return validateDecimal(value, 'Longitud', { min: -180, max: 180, required });
}

export function validateUrl(value, label = 'URL', { required = false } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatoria.` : null;
  if (!URL_PATTERN.test(text)) {
    return `${label} debe comenzar con http:// o https:// y tener formato válido.`;
  }
  return null;
}

export function validateHexColor(value, label = 'Color', { required = true } = {}) {
  const text = normalize(value);
  if (!text) return required ? `${label} es obligatorio.` : null;
  if (!HEX_COLOR_PATTERN.test(text)) return `${label} debe tener formato hexadecimal (#RRGGBB).`;
  return null;
}

export function validateRucEc(value) {
  const text = normalize(value).replace(/\D/g, '');
  if (!text) return null;
  if (!DIGITS_ONLY_PATTERN.test(text)) return 'El RUC debe contener únicamente números.';
  if (text.length !== 13) return 'El RUC debe tener 13 dígitos.';
  if (!text.endsWith('001')) return 'El RUC debe terminar en 001.';
  return null;
}

export function validateUsername(value) {
  const text = normalize(value);
  if (text.length < 4 || text.length > 30) {
    return 'El usuario debe tener entre 4 y 30 caracteres.';
  }
  if (!USERNAME_PATTERN.test(text)) {
    return 'El usuario solo puede contener letras, números, punto, guion y guion bajo.';
  }
  if (isFillerText(text)) return 'El nombre de usuario no es válido.';
  return null;
}

export function validatePassword(value) {
  const text = value || '';
  if (text.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (!/[A-Z]/.test(text)) return 'La contraseña debe contener una letra mayúscula.';
  if (!/[a-z]/.test(text)) return 'La contraseña debe contener una letra minúscula.';
  if (!/[0-9]/.test(text)) return 'La contraseña debe contener un número.';
  return null;
}

export function validateId(value, label) {
  if (value === null || value === undefined || value === '' || value === 0) {
    return `${label} es obligatorio.`;
  }
  return null;
}

/** Agrega error al mapa si la validación falla. */
export function addError(errors, field, message) {
  if (message) errors[field] = message;
}

/** Filtra entrada a solo dígitos. */
export function filterDigitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Filtra entrada a solo letras y espacios. */
export function filterLettersOnly(value) {
  return String(value || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g, '');
}

/** Filtra entrada numérica decimal (solo positivos). */
export function filterDecimalInput(value) {
  const cleaned = String(value || '').replace(',', '.').replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

/** Filtra coordenadas GPS: permite signo negativo y decimales. */
export function filterSignedDecimalInput(value) {
  let text = String(value || '').trim().replace(',', '.');
  const negative = text.startsWith('-');
  const cleaned = text.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  const normalized = parts.length <= 1 ? cleaned : `${parts[0]}.${parts.slice(1).join('')}`;
  if (!normalized) return negative ? '-' : '';
  return negative ? `-${normalized}` : normalized;
}

/** Convierte texto o número de coordenada a float (acepta coma decimal). */
export function parseCoordinate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const text = normalize(value).replace(',', '.');
  const num = Number(text);
  return Number.isNaN(num) ? null : num;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export const REQUIRED_FIELDS_BANNER = 'Por favor, complete todos los campos obligatorios.';

export function buildValidationResult(errors) {
  const keys = Object.keys(errors);
  if (keys.length === 0) {
    return { errors, valid: true, message: '', banner: '' };
  }
  const first = errors[keys[0]];
  return {
    errors,
    valid: false,
    message: keys.length > 1 ? REQUIRED_FIELDS_BANNER : first,
    banner: keys.length > 1 ? REQUIRED_FIELDS_BANNER : first,
  };
}

export function validateLocationRequired(ubicacion, { required = false } = {}) {
  const errors = {};
  const u = ubicacion || {};
  const hasLat = u.latitud !== null && u.latitud !== undefined && u.latitud !== '';
  const hasLng = u.longitud !== null && u.longitud !== undefined && u.longitud !== '';

  if (required && (!hasLat || !hasLng)) {
    const msg = 'La ubicación es obligatoria.';
    if (!hasLat) errors['ubicacion.latitud'] = msg;
    if (!hasLng) errors['ubicacion.longitud'] = msg;
  }
  return errors;
}

export function validateGalleryRequired(imageCount, { publish = false, hasEntityId = false } = {}) {
  if (!publish) return null;
  if (!hasEntityId && (!imageCount || imageCount < 1)) {
    return 'Suba al menos una imagen en la galería antes de publicar.';
  }
  if (!imageCount || imageCount < 1) {
    return 'Debe seleccionar al menos una imagen.';
  }
  return null;
}

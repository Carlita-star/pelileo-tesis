const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

export function getApiBase() {
  return API_BASE;
}

export function getAuthHeaders(includeJson = true) {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(!isFormData && options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`);
  }
  return data;
}

export default apiRequest;

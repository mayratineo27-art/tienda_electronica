// Bloque de configuracion central: URL base del backend para todas las peticiones HTTP.
export const API_BASE_URL = "http://localhost:3000/api";

// Bloque de llaves de almacenamiento: evita cadenas repetidas y errores de tipeo.
export const STORAGE_KEYS = {
  cart: "tienda_redes_cart",
  accessToken: "tienda_redes_access_token",
  user: "tienda_redes_user"
};

// Bloque de sanitizacion: neutraliza caracteres especiales para prevenir XSS en render HTML.
export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Bloque de limpieza de entrada: elimina etiquetas y espacios redundantes antes de enviar datos.
export function sanitizeInput(value) {
  return String(value || "")
    .replace(/<[^>]*>?/gm, "")
    .trim();
}

// Bloque de formato monetario: presenta montos en pesos con formato legible.
export function formatPrice(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(amount);
}

// Bloque de lectura de JSON desde localStorage: recupera estado persistente del navegador.
export function readFromStorage(key, fallback = null) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }
    return JSON.parse(rawValue);
  } catch (error) {
    console.error("No fue posible leer localStorage:", error);
    return fallback;
  }
}

// Bloque de escritura de JSON en localStorage: persiste datos entre recargas del navegador.
export function writeToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Bloque de sesion: lee access token actual desde almacenamiento local.
export function getAccessToken() {
  return readFromStorage(STORAGE_KEYS.accessToken, null);
}

// Bloque de sesion: guarda access token de corta duracion.
export function setAccessToken(token) {
  writeToStorage(STORAGE_KEYS.accessToken, token);
}

// Bloque de sesion: elimina token y usuario al cerrar sesion.
export function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.user);
}

// Bloque de utilidades de interfaz: muestra mensajes de estado accesibles para usuario.
export function showAlert(element, message, type = "info") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove("badge-success", "badge-danger");

  if (type === "success") {
    element.classList.add("badge", "badge-success");
  }

  if (type === "error") {
    element.classList.add("badge", "badge-danger");
  }
}

// Bloque de limpieza de mensajes: deja el contenedor de estado en blanco.
export function clearAlert(element) {
  if (!element) {
    return;
  }
  element.textContent = "";
  element.classList.remove("badge", "badge-success", "badge-danger");
}

// Bloque de validacion: correo basico para formularios de autenticacion.
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email || "").trim());
}

// Bloque de validacion: contrasena minima para registro seguro inicial.
export function validatePassword(password) {
  const normalized = String(password || "");
  return normalized.length >= 8;
}

// Bloque de validacion generica: revisa campos obligatorios de un formulario.
export function validateRequiredFields(formData, requiredFields) {
  return requiredFields.every((field) => {
    const fieldValue = String(formData.get(field) || "").trim();
    return fieldValue.length > 0;
  });
}

// Bloque de debounce (closure): reduce ejecuciones repetidas en busqueda en tiempo real.
export function debounce(callback, delayMs = 300) {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delayMs);
  };
}

// Bloque de wrapper HTTP GET: simplifica consumo de API con manejo de error uniforme.
export async function getJSON(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`GET ${endpoint} fallo con estado ${response.status}`);
  }

  return response.json();
}

// Bloque de renovacion de token: usa refresh token en cookie httpOnly para emitir nuevo access token.
export async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/usuarios/refresh`, {
    method: "POST",
    credentials: "include"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.accessToken) {
    throw new Error(data.message || "No fue posible renovar la sesion");
  }

  setAccessToken(data.accessToken);
  return data.accessToken;
}

// Bloque de wrapper HTTP con cuerpo: reutilizable para POST, PUT y PATCH.
export async function requestJSON(endpoint, method, payload, token = null) {
  const finalToken = token || getAccessToken();

  const headers = {
    "Content-Type": "application/json"
  };

  if (finalToken) {
    headers.Authorization = `Bearer ${finalToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: JSON.stringify(payload),
    credentials: "include"
  });

  // Si el access token expiro, intenta renovarlo una vez y reintenta la peticion.
  if (response.status === 401 && finalToken) {
    try {
      const renewedToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${renewedToken}`;

      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(payload),
        credentials: "include"
      });
    } catch (error) {
      clearAuthStorage();
      throw error;
    }
  }

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || `${method} ${endpoint} fallo con estado ${response.status}`);
  }

  return responseData;
}

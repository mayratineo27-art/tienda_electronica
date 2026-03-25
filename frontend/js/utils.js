// Bloque de configuracion central: URL base del backend para todas las peticiones HTTP.
export const API_BASE_URL = "http://localhost:3000/api";

// Bloque de llaves de almacenamiento: evita cadenas repetidas y errores de tipeo.
export const STORAGE_KEYS = {
  cart: "tienda_redes_cart",
  token: "tienda_redes_token",
  user: "tienda_redes_user"
};

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`GET ${endpoint} fallo con estado ${response.status}`);
  }

  return response.json();
}

// Bloque de wrapper HTTP con cuerpo: reutilizable para POST, PUT y PATCH.
export async function requestJSON(endpoint, method, payload, token = null) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: JSON.stringify(payload)
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || `${method} ${endpoint} fallo con estado ${response.status}`);
  }

  return responseData;
}

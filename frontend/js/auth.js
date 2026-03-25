import {
  requestJSON,
  validateEmail,
  validatePassword,
  validateRequiredFields,
  STORAGE_KEYS,
  writeToStorage,
  showAlert,
  clearAlert
} from "./utils.js";

// Bloque de referencias DOM: formularios de login y registro en paginas separadas.
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authStatus = document.getElementById("auth-status");

// Bloque de persistencia de sesion: guarda token y datos minimos de usuario.
function saveAuthSession(token, userData) {
  writeToStorage(STORAGE_KEYS.token, token);
  writeToStorage(STORAGE_KEYS.user, userData);
}

// Bloque de validacion de login: revisa campos requeridos y formato de correo.
function validateLoginForm(formData) {
  const requiredOk = validateRequiredFields(formData, ["email", "password"]);
  const emailOk = validateEmail(formData.get("email"));

  if (!requiredOk) {
    throw new Error("Debes completar todos los campos obligatorios.");
  }

  if (!emailOk) {
    throw new Error("El correo no tiene un formato valido.");
  }
}

// Bloque de validacion de registro: asegura datos completos y password fuerte minima.
function validateRegisterForm(formData) {
  const requiredOk = validateRequiredFields(formData, ["name", "email", "password", "confirmPassword"]);
  const emailOk = validateEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!requiredOk) {
    throw new Error("Todos los campos del registro son obligatorios.");
  }

  if (!emailOk) {
    throw new Error("El correo de registro no es valido.");
  }

  if (!validatePassword(password)) {
    throw new Error("La contrasena debe tener al menos 8 caracteres.");
  }

  if (password !== confirmPassword) {
    throw new Error("Las contrasenas no coinciden.");
  }
}

// Bloque de envio de login: consume endpoint y guarda JWT para sesion de usuario.
async function submitLogin(formData) {
  const payload = {
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password"))
  };

  const response = await requestJSON("/auth/login", "POST", payload);
  saveAuthSession(response.token, response.user);
  showAlert(authStatus, "Inicio de sesion exitoso.", "success");
  window.location.href = "./catalogo.html";
}

// Bloque de envio de registro: crea usuario y, opcionalmente, inicia sesion automatica.
async function submitRegister(formData) {
  const payload = {
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password"))
  };

  await requestJSON("/auth/register", "POST", payload);
  showAlert(authStatus, "Cuenta creada correctamente. Ahora puedes iniciar sesion.", "success");
  window.location.href = "./login.html";
}

// Bloque de control de errores: centraliza mensajes amigables de autenticacion.
function handleAuthError(error) {
  console.error("Error de autenticacion:", error);
  showAlert(authStatus, error.message || "No fue posible completar la autenticacion.", "error");
}

// Bloque de binding login: asocia submit del formulario a flujo async/await.
function bindLoginForm() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert(authStatus);

    try {
      const formData = new FormData(loginForm);
      validateLoginForm(formData);
      await submitLogin(formData);
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// Bloque de binding registro: asocia submit del formulario de alta de usuarios.
function bindRegisterForm() {
  if (!registerForm) {
    return;
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert(authStatus);

    try {
      const formData = new FormData(registerForm);
      validateRegisterForm(formData);
      await submitRegister(formData);
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// Bloque de inicializacion: activa solo el flujo que corresponde a cada pagina.
function initAuthPages() {
  bindLoginForm();
  bindRegisterForm();
}

// Bloque de arranque seguro de autenticacion.
document.addEventListener("DOMContentLoaded", initAuthPages);

// Bloque de importaciones: limitador de peticiones por IP para mitigar fuerza bruta.
const rateLimit = require("express-rate-limit");

// Bloque de limite para login: maximo 5 intentos por IP en ventana de 15 minutos.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos de login. Intenta nuevamente en 15 minutos."
  }
});

module.exports = {
  loginRateLimiter
};

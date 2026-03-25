// Bloque de importaciones: utilidades de reglas y resultado de validacion.
const { body, param, validationResult } = require("express-validator");

// Bloque de sanitizacion: elimina etiquetas peligrosas para reducir riesgo XSS almacenado.
function stripTags(value) {
  return String(value || "").replace(/<[^>]*>?/gm, "").trim();
}

// Bloque de middleware comun: responde 400 si existen errores de datos de entrada.
function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Datos de entrada invalidos",
      errors: errors.array()
    });
  }

  return next();
}

// Bloque de reglas para productos: valida alta y actualizacion de catalogo.
const validateProducto = [
  body("name").customSanitizer(stripTags).isLength({ min: 3, max: 120 }).withMessage("name debe tener entre 3 y 120 caracteres"),
  body("description").customSanitizer(stripTags).isLength({ min: 5, max: 255 }).withMessage("description debe tener entre 5 y 255 caracteres"),
  body("price").isFloat({ min: 0 }).withMessage("price debe ser un numero positivo"),
  body("stock").isInt({ min: 0 }).withMessage("stock debe ser un entero mayor o igual a 0"),
  body("category").customSanitizer(stripTags).isLength({ min: 3, max: 60 }).withMessage("category debe tener entre 3 y 60 caracteres"),
  body("slug").optional().customSanitizer(stripTags),
  body("image").optional().trim().isLength({ max: 255 }).withMessage("image no debe superar 255 caracteres"),
  handleValidation
];

// Bloque de reglas para id en URL: asegura que el id sea entero positivo.
const validateIdParam = [
  param("id").isInt({ min: 1 }).withMessage("id debe ser un entero positivo"),
  handleValidation
];

// Bloque de reglas para registro de usuarios.
const validateRegistro = [
  body("name").customSanitizer(stripTags).isLength({ min: 3, max: 120 }).withMessage("name debe tener entre 3 y 120 caracteres"),
  body("email").trim().normalizeEmail().isEmail().withMessage("email invalido"),
  body("password").isLength({ min: 8 }).withMessage("password debe tener al menos 8 caracteres"),
  handleValidation
];

// Bloque de reglas para login.
const validateLogin = [
  body("email").trim().normalizeEmail().isEmail().withMessage("email invalido"),
  body("password").isLength({ min: 1 }).withMessage("password es obligatorio"),
  handleValidation
];

// Bloque de reglas para creacion de orden.
const validateOrden = [
  body("direccion_envio")
    .customSanitizer(stripTags)
    .isLength({ min: 8, max: 255 })
    .withMessage("direccion_envio debe tener entre 8 y 255 caracteres"),
  body("items").isArray({ min: 1 }).withMessage("items debe ser un arreglo con al menos un producto"),
  body("items.*.productId").isInt({ min: 1 }).withMessage("productId invalido"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("quantity debe ser entero mayor a 0"),
  handleValidation
];

// Bloque de reglas para cambio de estado de orden por administrador.
const validateEstadoOrden = [
  param("id").isInt({ min: 1 }).withMessage("id de orden invalido"),
  body("status").isIn(["pendiente", "pagada", "enviada", "entregada", "cancelada"]).withMessage("status invalido"),
  handleValidation
];

module.exports = {
  validateProducto,
  validateIdParam,
  validateRegistro,
  validateLogin,
  validateOrden,
  validateEstadoOrden,
  handleValidation
};

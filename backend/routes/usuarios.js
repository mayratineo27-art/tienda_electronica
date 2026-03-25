// Bloque de importaciones: router, controladores y middlewares de auth/validacion.
const express = require("express");
const usuariosController = require("../controllers/usuariosController");
const { verifyToken } = require("../middlewares/auth");
const { validateRegistro, validateLogin } = require("../middlewares/validacion");
const { loginRateLimiter } = require("../middlewares/rateLimit");

const router = express.Router();

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registrar usuario
 *     tags: [Usuarios]
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *       400:
 *         description: Datos invalidos.
 */
// POST /api/usuarios/registro
// Registra usuario nuevo en la base de datos.
router.post("/registro", validateRegistro, usuariosController.register);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Login exitoso con access token.
 *       401:
 *         description: Credenciales invalidas.
 *       429:
 *         description: Demasiados intentos por IP.
 */
// POST /api/usuarios/login
// Autentica usuario y entrega token JWT.
router.post("/login", loginRateLimiter, validateLogin, usuariosController.login);

/**
 * @swagger
 * /api/usuarios/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Access token renovado.
 *       401:
 *         description: Refresh token invalido o expirado.
 */
// POST /api/usuarios/refresh
// Renueva access token usando refresh token en cookie segura.
router.post("/refresh", usuariosController.refresh);

/**
 * @swagger
 * /api/usuarios/logout:
 *   post:
 *     summary: Cerrar sesion
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Sesion cerrada y refresh revocado.
 */
// POST /api/usuarios/logout
// Cierra sesion y revoca refresh token persistido.
router.post("/logout", usuariosController.logout);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido.
 *       401:
 *         description: No autenticado.
 */
// GET /api/usuarios/perfil
// Obtiene perfil del usuario autenticado.
router.get("/perfil", verifyToken, usuariosController.profile);

module.exports = router;

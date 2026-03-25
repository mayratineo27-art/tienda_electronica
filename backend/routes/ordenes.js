// Bloque de importaciones: router, controladores y middlewares de seguridad/validacion.
const express = require("express");
const productosController = require("../controllers/productosController");
const { verifyToken, requireAdmin } = require("../middlewares/auth");
const { validateOrden, validateEstadoOrden } = require("../middlewares/validacion");

const router = express.Router();

/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear orden
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Orden creada.
 *       400:
 *         description: Datos invalidos o stock insuficiente.
 */
// POST /api/ordenes
// Crea una nueva orden del usuario autenticado.
router.post("/", verifyToken, validateOrden, productosController.createOrden);

/**
 * @swagger
 * /api/ordenes/mias:
 *   get:
 *     summary: Listar mis ordenes
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ordenes del usuario autenticado.
 */
// GET /api/ordenes/mias
// Lista ordenes pertenecientes al usuario autenticado.
router.get("/mias", verifyToken, productosController.getMisOrdenes);

/**
 * @swagger
 * /api/ordenes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de orden (admin)
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado actualizado.
 *       403:
 *         description: Rol insuficiente.
 */
// PATCH /api/ordenes/:id/estado
// Cambia el estado de una orden (solo admin).
router.patch("/:id/estado", verifyToken, requireAdmin, validateEstadoOrden, productosController.updateEstadoOrden);

module.exports = router;

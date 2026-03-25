// Bloque de importaciones: router, controladores y middlewares de seguridad/validacion.
const express = require("express");
const productosController = require("../controllers/productosController");
const { verifyToken, requireAdmin } = require("../middlewares/auth");
const { validateProducto, validateIdParam } = require("../middlewares/validacion");

const router = express.Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
// GET /api/productos
// Lista todos los productos activos del catalogo.
router.get("/", productosController.getAllProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por id
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *       404:
 *         description: Producto no encontrado.
 */
// GET /api/productos/:id
// Retorna un producto por id.
router.get("/:id", validateIdParam, productosController.getProductoById);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, category]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado.
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Rol insuficiente.
 */
// POST /api/productos
// Crea producto nuevo (requiere token y rol admin).
router.post("/", verifyToken, requireAdmin, validateProducto, productosController.createProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Productos]
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
 *         description: Producto actualizado.
 *       404:
 *         description: Producto no encontrado.
 */
// PUT /api/productos/:id
// Actualiza producto existente (requiere token y rol admin).
router.put("/:id", verifyToken, requireAdmin, validateIdParam, validateProducto, productosController.updateProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Productos]
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
 *         description: Producto eliminado.
 *       404:
 *         description: Producto no encontrado.
 */
// DELETE /api/productos/:id
// Elimina producto de forma logica (requiere token y rol admin).
router.delete("/:id", verifyToken, requireAdmin, validateIdParam, productosController.deleteProducto);

module.exports = router;

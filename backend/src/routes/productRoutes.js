// Bloque de importaciones: router y controlador de productos.
const express = require("express");
const { getAllProducts } = require("../controllers/productController");

// Bloque de definicion de rutas REST para recursos de productos.
const router = express.Router();

// Endpoint GET /api/products: lista productos del catalogo.
router.get("/", getAllProducts);

module.exports = router;

// Bloque de importaciones: librerias y modulos internos del backend.
const express = require("express");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middlewares/errorHandler");

// Bloque de inicializacion: creamos la aplicacion Express.
const app = express();

// Bloque de middlewares globales: parseo JSON para peticiones REST.
app.use(express.json());

// Bloque de CORS simple: habilita consumo desde frontend local en desarrollo.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// Bloque de health-check: endpoint basico para verificar que la API esta viva.
app.get("/api/health", (req, res) => {
  res.json({ message: "API de tienda de redes operativa" });
});

// Bloque de rutas de dominio: productos del catalogo.
app.use("/api/products", productRoutes);

// Bloque de manejo centralizado de errores: siempre al final del pipeline.
app.use(errorHandler);

module.exports = app;

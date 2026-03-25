// Bloque de configuracion inicial: carga variables de entorno y dependencias.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// Bloque de importacion de rutas REST por dominio.
const productosRoutes = require("./routes/productos");
const usuariosRoutes = require("./routes/usuarios");
const ordenesRoutes = require("./routes/ordenes");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Bloque de confianza proxy: necesario si se despliega detras de reverse proxy (Nginx, Cloudflare).
app.set("trust proxy", 1);

// Bloque de cabeceras de seguridad: reduce superficie frente a ataques comunes de navegador.
app.use(helmet());

// Bloque de parseo de cookies: permite leer refresh token httpOnly desde req.cookies.
app.use(cookieParser());

// Bloque de forzado HTTPS en produccion (opcional por variable de entorno).
app.use((req, res, next) => {
  const forceHttps = String(process.env.FORCE_HTTPS || "false") === "true";
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

  if (forceHttps && !isSecure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  return next();
});

// Bloque de CORS: controla que origenes pueden consumir la API desde navegador.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5500",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Bloque de parseo JSON: convierte body JSON en req.body utilizable.
app.use(express.json({ limit: "1mb" }));

// Bloque de logging simple: ayuda a observar flujo request-response en desarrollo.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Bloque de endpoint de salud: verifica que el servidor esta operativo.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API backend operativa",
    timestamp: new Date().toISOString()
  });
});

// Bloque de montaje de rutas: distribuye peticiones a cada modulo.
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ordenes", ordenesRoutes);

// Bloque de 404: captura rutas inexistentes de forma explicita.
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada"
  });
});

// Bloque de manejo global de errores: evita fugas de detalle interno.
app.use((error, req, res, next) => {
  console.error("Error no controlado:", error);

  res.status(500).json({
    message: "Error interno del servidor",
    detail: error.message
  });
});

// Bloque de arranque del servidor HTTP.
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en puerto ${PORT}`);
});

// Bloque de middleware: centraliza respuesta de errores de la API.
function errorHandler(error, req, res, next) {
  // En entorno real se puede enriquecer con logger estructurado.
  console.error("Error capturado por middleware:", error);

  // Respuesta estandar para no filtrar detalles internos al cliente.
  return res.status(500).json({
    message: "Error interno del servidor",
    detail: error.message
  });
}

module.exports = errorHandler;

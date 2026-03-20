// Bloque de importacion: servicio que contiene logica de negocio.
const productService = require("../services/productService");

// Bloque de controlador: recibe request y responde con productos.
async function getAllProducts(req, res, next) {
  try {
    // Delegamos la obtencion de datos al servicio para mantener separacion de capas.
    const products = await productService.listProducts();
    return res.status(200).json(products);
  } catch (error) {
    // En caso de error, delegamos al middleware centralizado.
    return next(error);
  }
}

module.exports = {
  getAllProducts
};

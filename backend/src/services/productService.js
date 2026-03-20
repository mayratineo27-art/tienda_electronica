// Bloque de importacion: modelo para acceso a datos de productos.
const productModel = require("../models/productModel");

// Bloque de servicio: aplica reglas de negocio y transforma datos si es necesario.
async function listProducts() {
  // Obtenemos filas desde el modelo (capa de persistencia).
  const rows = await productModel.findAll();

  // Transformacion ligera: normaliza tipos numericos para consistencia en frontend.
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stock: Number(row.stock),
    category: row.category
  }));
}

module.exports = {
  listProducts
};

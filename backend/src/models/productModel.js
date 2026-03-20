// Bloque de importacion: pool de conexiones a MySQL.
const pool = require("../config/db");

// Bloque de consultas: recupera productos activos para catalogo.
async function findAll() {
  const sql = `
    SELECT
      id,
      name,
      description,
      price,
      stock,
      category
    FROM products
    WHERE is_active = 1
    ORDER BY id DESC
  `;

  // Ejecutamos consulta preparada y retornamos filas.
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  findAll
};

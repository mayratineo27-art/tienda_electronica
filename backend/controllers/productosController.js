// Bloque de importaciones: pool de base de datos para operaciones de productos y ordenes.
const pool = require("../src/config/db");

// Bloque de utilidad: resuelve categoria por id numerico o por nombre/slug.
async function resolveCategoriaId(categoryInput) {
  if (typeof categoryInput === "number" || /^\d+$/.test(String(categoryInput || ""))) {
    const categoryId = Number(categoryInput);
    const [rows] = await pool.query("SELECT id FROM categorias WHERE id = ? LIMIT 1", [categoryId]);
    return rows.length ? rows[0].id : null;
  }

  const normalized = String(categoryInput || "").trim();
  if (!normalized) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT id FROM categorias WHERE nombre = ? OR slug = ? LIMIT 1",
    [normalized, normalized]
  );

  return rows.length ? rows[0].id : null;
}

// Bloque de productos: lista todo el catalogo activo.
async function getAllProductos(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.nombre AS name,
         p.slug,
         p.descripcion AS description,
         p.precio AS price,
         p.stock,
         p.categoria_id,
         c.nombre AS category,
         p.imagen,
         p.specs_json,
         p.created_at,
         p.updated_at
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       ORDER BY p.id DESC`
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

// Bloque de productos: consulta un producto por id.
async function getProductoById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.nombre AS name,
         p.slug,
         p.descripcion AS description,
         p.precio AS price,
         p.stock,
         p.categoria_id,
         c.nombre AS category,
         p.imagen,
         p.specs_json,
         p.created_at,
         p.updated_at
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

// Bloque de productos: crea un producto nuevo en catalogo.
async function createProducto(req, res, next) {
  try {
    const { name, description, price, stock, category, slug, image, specs_json } = req.body;
    const categoriaId = await resolveCategoriaId(category);

    if (!categoriaId) {
      return res.status(400).json({ message: "Categoria invalida o inexistente" });
    }

    const generatedSlug =
      String(slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const sql = `
      INSERT INTO productos (nombre, slug, descripcion, precio, stock, categoria_id, imagen, specs_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      name,
      generatedSlug,
      description,
      price,
      stock,
      categoriaId,
      image || null,
      specs_json ? JSON.stringify(specs_json) : null
    ]);

    return res.status(201).json({
      message: "Producto creado correctamente",
      productId: result.insertId
    });
  } catch (error) {
    return next(error);
  }
}

// Bloque de productos: actualiza producto existente por id.
async function updateProducto(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, slug, image, specs_json } = req.body;
    const categoriaId = await resolveCategoriaId(category);

    if (!categoriaId) {
      return res.status(400).json({ message: "Categoria invalida o inexistente" });
    }

    const generatedSlug =
      String(slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const sql = `
      UPDATE productos
      SET nombre = ?, slug = ?, descripcion = ?, precio = ?, stock = ?, categoria_id = ?, imagen = ?, specs_json = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      name,
      generatedSlug,
      description,
      price,
      stock,
      categoriaId,
      image || null,
      specs_json ? JSON.stringify(specs_json) : null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado para actualizar" });
    }

    return res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    return next(error);
  }
}

// Bloque de productos: borrado logico para preservar historial.
async function deleteProducto(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado para eliminar" });
    }

    return res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    return next(error);
  }
}

// Bloque de ordenes: crea orden para usuario autenticado y descuenta stock.
async function createOrden(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { items, direccion_envio } = req.body;

    await connection.beginTransaction();

    // Se valida stock por cada item para evitar sobreventa.
    let total = 0;
    for (const item of items) {
      const [productRows] = await connection.query(
        "SELECT id, precio, stock FROM productos WHERE id = ? LIMIT 1",
        [item.productId]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Producto ${item.productId} no encontrado` });
      }

      if (productRows[0].stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para producto ${item.productId}`
        });
      }

      total += Number(productRows[0].precio) * Number(item.quantity);
    }

    // Se crea cabecera de orden para asociar detalle de productos.
    const [orderResult] = await connection.query(
      `INSERT INTO ordenes (usuario_id, total, estado, direccion_envio)
       VALUES (?, ?, 'pendiente', ?)`,
      [userId, total, direccion_envio || "Direccion pendiente"]
    );

    const orderId = orderResult.insertId;

    // Se crea detalle por item y se descuenta stock en la misma transaccion.
    for (const item of items) {
      const [productRows] = await connection.query(
        "SELECT precio FROM productos WHERE id = ? LIMIT 1",
        [item.productId]
      );

      const unitPrice = Number(productRows[0].precio);

      await connection.query(
        `INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, unitPrice]
      );

      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.productId]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Orden creada correctamente",
      orderId,
      totalAmount: total
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

// Bloque de ordenes: lista ordenes del usuario autenticado.
async function getMisOrdenes(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, usuario_id, estado, total, created_at
       FROM ordenes
       WHERE usuario_id = ?
       ORDER BY id DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    return next(error);
  }
}

// Bloque de ordenes: cambia estado de orden (solo admin).
async function updateEstadoOrden(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query(
      "UPDATE ordenes SET estado = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    return res.status(200).json({ message: "Estado de orden actualizado correctamente" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  createOrden,
  getMisOrdenes,
  updateEstadoOrden
};

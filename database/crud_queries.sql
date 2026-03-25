-- =========================================================
-- GUIA CRUD + JOINS + TRANSACCIONES
-- Proyecto: tienda_redes
-- =========================================================
USE tienda_redes;

-- =========================================================
-- 1) USUARIOS
-- =========================================================

-- CREATE
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Nuevo Cliente', 'nuevo@correo.com', 'hash_seguro', 'cliente');

-- READ (lista basica)
SELECT id, nombre, email, rol, created_at
FROM usuarios
ORDER BY id DESC;

-- UPDATE
UPDATE usuarios
SET nombre = 'Cliente Actualizado', rol = 'cliente'
WHERE id = 2;

-- DELETE (fisico, usar con cuidado)
DELETE FROM usuarios
WHERE id = 999;

-- =========================================================
-- 2) CATEGORIAS
-- =========================================================

-- CREATE
INSERT INTO categorias (nombre, slug, descripcion)
VALUES ('Gabinetes', 'gabinetes', 'Gabinetes para rack y cableado');

-- READ
SELECT id, nombre, slug, descripcion
FROM categorias;

-- UPDATE
UPDATE categorias
SET descripcion = 'Gabinetes y accesorios para racks de comunicaciones'
WHERE slug = 'gabinetes';

-- DELETE
DELETE FROM categorias
WHERE slug = 'gabinetes';

-- =========================================================
-- 3) PRODUCTOS
-- =========================================================

-- CREATE
INSERT INTO productos (nombre, slug, descripcion, precio, stock, categoria_id, imagen, specs_json)
VALUES (
  'Switch PoE 8 Puertos',
  'switch-poe-8-puertos',
  'Switch con alimentacion PoE para camaras IP',
  650000,
  10,
  2,
  'switch-poe-8.jpg',
  '{"poe":"si","puertos":8}'
);

-- READ con INNER JOIN (producto + categoria)
SELECT p.id, p.nombre, p.precio, p.stock, c.nombre AS categoria
FROM productos p
INNER JOIN categorias c ON c.id = p.categoria_id
ORDER BY p.id DESC;

-- UPDATE
UPDATE productos
SET precio = 630000,
    stock = 12
WHERE id = 1;

-- DELETE
DELETE FROM productos
WHERE id = 999;

-- =========================================================
-- 4) ORDENES
-- =========================================================

-- CREATE (solo cabecera)
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio)
VALUES (2, 980000, 'pendiente', 'Carrera 50 #10-20, Medellin');

-- READ con LEFT JOIN (ordenes incluso si no tienen items)
SELECT o.id, o.estado, o.total, o.created_at, u.nombre AS cliente
FROM ordenes o
LEFT JOIN usuarios u ON u.id = o.usuario_id
ORDER BY o.id DESC;

-- UPDATE estado
UPDATE ordenes
SET estado = 'pagada'
WHERE id = 1;

-- DELETE
DELETE FROM ordenes
WHERE id = 999;

-- =========================================================
-- 5) ORDEN_ITEMS
-- =========================================================

-- CREATE
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
VALUES (1, 3, 2, 710000);

-- READ con INNER JOIN (detalle completo de una orden)
SELECT
  oi.id,
  oi.orden_id,
  p.nombre AS producto,
  oi.cantidad,
  oi.precio_unitario,
  (oi.cantidad * oi.precio_unitario) AS subtotal
FROM orden_items oi
INNER JOIN productos p ON p.id = oi.producto_id
WHERE oi.orden_id = 1;

-- UPDATE
UPDATE orden_items
SET cantidad = 3
WHERE id = 1;

-- DELETE
DELETE FROM orden_items
WHERE id = 999;

-- =========================================================
-- 6) CARRITOS
-- =========================================================

-- CREATE
INSERT INTO carritos (usuario_id, producto_id, cantidad)
VALUES (2, 1, 1)
ON DUPLICATE KEY UPDATE cantidad = cantidad + 1;

-- READ con JOIN (contenido del carrito)
SELECT
  c.id,
  c.usuario_id,
  p.nombre,
  p.precio,
  c.cantidad,
  (p.precio * c.cantidad) AS subtotal
FROM carritos c
INNER JOIN productos p ON p.id = c.producto_id
WHERE c.usuario_id = 2;

-- UPDATE cantidad
UPDATE carritos
SET cantidad = 4
WHERE usuario_id = 2 AND producto_id = 1;

-- DELETE item de carrito
DELETE FROM carritos
WHERE usuario_id = 2 AND producto_id = 1;

-- =========================================================
-- EJEMPLOS DE JOINS (INNER, LEFT, RIGHT)
-- =========================================================

-- INNER JOIN: solo ordenes que tienen usuario valido.
SELECT o.id AS orden_id, u.nombre AS cliente
FROM ordenes o
INNER JOIN usuarios u ON u.id = o.usuario_id;

-- LEFT JOIN: todas las categorias, tengan o no productos asociados.
SELECT c.nombre AS categoria, p.nombre AS producto
FROM categorias c
LEFT JOIN productos p ON p.categoria_id = c.id
ORDER BY c.nombre;

-- RIGHT JOIN: todos los productos y su categoria (si existe).
SELECT c.nombre AS categoria, p.nombre AS producto
FROM categorias c
RIGHT JOIN productos p ON p.categoria_id = c.id;

-- =========================================================
-- EJEMPLO DE TRANSACCION CRITICA EN E-COMMERCE
-- Crear orden + detalle + descontar stock en una sola unidad atomica.
-- =========================================================

START TRANSACTION;

-- 1. Crear cabecera de orden.
INSERT INTO ordenes (usuario_id, total, estado, direccion_envio)
VALUES (2, 1230000, 'pendiente', 'Av. Siempre Viva 123');

-- Guardar ID generado para usarlo en detalles.
SET @orden_id := LAST_INSERT_ID();

-- 2. Insertar items de la orden.
INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
VALUES
(@orden_id, 1, 1, 520000),
(@orden_id, 2, 1, 710000);

-- 3. Actualizar stock de productos vendidos.
UPDATE productos
SET stock = stock - 1
WHERE id IN (1, 2);

-- 4. Confirmar cambios.
COMMIT;

-- Si algo falla en pasos intermedios, usar:
-- ROLLBACK;

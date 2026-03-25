-- Bloque de creacion de base de datos para la tienda de redes.
CREATE DATABASE IF NOT EXISTS tienda_redes;

-- Bloque de seleccion de esquema para ejecutar sentencias en contexto correcto.
USE tienda_redes;

-- Bloque de limpieza opcional para recrear esquema en entorno de desarrollo.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS carritos;
DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- Tabla usuarios: credenciales y rol del cliente/admin.
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
  refresh_token_hash VARCHAR(255) NULL,
  refresh_token_expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_usuarios_rol CHECK (rol IN ('cliente', 'admin'))
);

-- Tabla categorias: clasificacion del catalogo.
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT NULL,
  UNIQUE KEY uk_categorias_nombre (nombre)
);

-- Tabla productos: inventario de venta y datos tecnicos.
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  precio DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoria_id INT NOT NULL,
  imagen VARCHAR(255) NULL,
  specs_json TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_productos_precio CHECK (precio >= 0),
  CONSTRAINT chk_productos_stock CHECK (stock >= 0)
);

-- Tabla ordenes: cabecera de compra por usuario.
CREATE TABLE ordenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ordenes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_ordenes_total CHECK (total >= 0),
  CONSTRAINT chk_ordenes_estado CHECK (estado IN ('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'))
);

-- Tabla orden_items: detalle de productos dentro de cada orden.
CREATE TABLE orden_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  CONSTRAINT fk_orden_items_orden FOREIGN KEY (orden_id) REFERENCES ordenes (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_orden_items_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_orden_items_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_orden_items_precio CHECK (precio_unitario >= 0)
);

-- Tabla carritos: carrito persistente por usuario y producto.
CREATE TABLE carritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_carritos_producto FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_carritos_cantidad CHECK (cantidad > 0),
  UNIQUE KEY uk_carritos_usuario_producto (usuario_id, producto_id)
);

-- Bloque de indices orientados a consultas frecuentes.
CREATE INDEX idx_productos_categoria ON productos (categoria_id);
CREATE INDEX idx_productos_precio ON productos (precio);
CREATE INDEX idx_ordenes_usuario ON ordenes (usuario_id);
CREATE INDEX idx_ordenes_estado ON ordenes (estado);
CREATE INDEX idx_orden_items_orden ON orden_items (orden_id);
CREATE INDEX idx_orden_items_producto ON orden_items (producto_id);
CREATE INDEX idx_carritos_usuario ON carritos (usuario_id);

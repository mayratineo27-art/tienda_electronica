-- =========================================================
-- Schema PostgreSQL para Supabase
-- Ejecutar en SQL Editor de Supabase
-- =========================================================

-- Tabla usuarios: autenticacion y roles.
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
  refresh_token_hash VARCHAR(255) NULL,
  refresh_token_expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_usuarios_rol CHECK (rol IN ('cliente', 'admin'))
);

-- Tabla categorias: clasificacion del catalogo.
CREATE TABLE IF NOT EXISTS categorias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT NULL
);

-- Tabla productos: inventario y datos tecnicos.
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  precio NUMERIC(12, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  imagen VARCHAR(255) NULL,
  specs_json TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_productos_precio CHECK (precio >= 0),
  CONSTRAINT chk_productos_stock CHECK (stock >= 0)
);

-- Tabla ordenes: cabecera de compra.
CREATE TABLE IF NOT EXISTS ordenes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  total NUMERIC(12, 2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  direccion_envio VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_ordenes_total CHECK (total >= 0),
  CONSTRAINT chk_ordenes_estado CHECK (estado IN ('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'))
);

-- Tabla orden_items: detalle por producto dentro de una orden.
CREATE TABLE IF NOT EXISTS orden_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  orden_id BIGINT NOT NULL REFERENCES ordenes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(12, 2) NOT NULL,
  CONSTRAINT chk_orden_items_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_orden_items_precio CHECK (precio_unitario >= 0)
);

-- Tabla carritos: carrito persistente por usuario y producto.
CREATE TABLE IF NOT EXISTS carritos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_carritos_cantidad CHECK (cantidad > 0),
  CONSTRAINT uk_carritos_usuario_producto UNIQUE (usuario_id, producto_id)
);

-- Indices recomendados para consultas frecuentes.
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos (precio);
CREATE INDEX IF NOT EXISTS idx_ordenes_usuario ON ordenes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes (estado);
CREATE INDEX IF NOT EXISTS idx_orden_items_orden ON orden_items (orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto ON orden_items (producto_id);
CREATE INDEX IF NOT EXISTS idx_carritos_usuario ON carritos (usuario_id);

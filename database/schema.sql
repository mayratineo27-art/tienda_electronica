-- Bloque de creacion de base de datos para la tienda de redes.
CREATE DATABASE IF NOT EXISTS tienda_redes;

-- Bloque de seleccion de esquema para ejecutar sentencias en contexto correcto.
USE tienda_redes;

-- Bloque de tabla principal de productos del catalogo.
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(60) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

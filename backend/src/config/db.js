// Bloque de configuracion: carga variables para conexion a MySQL.
require("dotenv").config();
const mysql = require("mysql2/promise");

// Bloque de pool: reutiliza conexiones para mejor rendimiento en API concurrente.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

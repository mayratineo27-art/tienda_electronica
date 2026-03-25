// Bloque de configuracion: selecciona motor de base de datos por variable de entorno.
require("dotenv").config();

const DB_CLIENT = String(process.env.DB_CLIENT || "mysql").toLowerCase();

// Bloque de utilidades SQL: convierte placeholders "?" a "$1, $2..." para PostgreSQL.
function toPostgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

// Bloque de utilidades SQL: agrega RETURNING id en INSERT para compatibilidad con insertId.
function ensureReturningId(sql) {
  const isInsert = /^\s*insert\s+/i.test(sql);
  const hasReturning = /\sreturning\s+/i.test(sql);

  if (isInsert && !hasReturning) {
    return `${sql.trim()} RETURNING id`;
  }

  return sql;
}

// Bloque de utilidades de resultado: adapta forma de respuesta PostgreSQL a estilo mysql2.
function mapPgResult(sql, result) {
  const isSelect = /^\s*select\s+/i.test(sql);

  if (isSelect) {
    return [result.rows];
  }

  return [
    {
      affectedRows: result.rowCount,
      insertId: result.rows && result.rows[0] ? result.rows[0].id : null
    }
  ];
}

// Bloque de factory: crea pool mysql2 si DB_CLIENT es mysql.
function createMysqlAdapter() {
  const mysql = require("mysql2/promise");
  const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return {
    query: (sql, params = []) => mysqlPool.query(sql, params),
    getConnection: () => mysqlPool.getConnection()
  };
}

// Bloque de factory: crea pool PostgreSQL (Supabase) con interfaz compatible.
function createPostgresAdapter() {
  const { Pool } = require("pg");

  const pgPool = new Pool({
    host: process.env.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT || 5432),
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME || "postgres",
    ssl: String(process.env.SUPABASE_DB_SSL || "true") === "true" ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000
  });

  return {
    async query(sql, params = []) {
      const normalizedSql = ensureReturningId(toPostgresPlaceholders(sql));
      const result = await pgPool.query(normalizedSql, params);
      return mapPgResult(sql, result);
    },
    async getConnection() {
      const client = await pgPool.connect();

      return {
        async query(sql, params = []) {
          const normalizedSql = ensureReturningId(toPostgresPlaceholders(sql));
          const result = await client.query(normalizedSql, params);
          return mapPgResult(sql, result);
        },
        async beginTransaction() {
          await client.query("BEGIN");
        },
        async commit() {
          await client.query("COMMIT");
        },
        async rollback() {
          await client.query("ROLLBACK");
        },
        release() {
          client.release();
        }
      };
    }
  };
}

// Bloque de seleccion final del adaptador segun DB_CLIENT.
const pool = DB_CLIENT === "supabase" || DB_CLIENT === "postgres" ? createPostgresAdapter() : createMysqlAdapter();

module.exports = pool;

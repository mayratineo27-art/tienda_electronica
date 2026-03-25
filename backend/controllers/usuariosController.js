// Bloque de importaciones: hash de password, JWT y pool MySQL existente.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../src/config/db");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Bloque de utilidades JWT: emite access token de vida corta.
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.rol
    },
    ACCESS_SECRET,
    {
      expiresIn: ACCESS_EXPIRES
    }
  );
}

// Bloque de utilidades de fecha: genera expiracion de refresh token a 7 dias.
function buildRefreshExpiryDate() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

// Bloque de utilidades JWT: emite refresh token de vida larga.
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.rol,
      type: "refresh"
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_EXPIRES
    }
  );
}

// Bloque de utilidades de cookie: define opciones seguras para refresh token.
function buildRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: String(process.env.COOKIE_SECURE || "false") === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/usuarios"
  };
}

// Bloque de registro: crea usuario nuevo y evita duplicado de email.
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Se valida unicidad de email para evitar cuentas duplicadas.
    const [existingRows] = await pool.query("SELECT id FROM usuarios WHERE email = ? LIMIT 1", [email]);
    if (existingRows.length > 0) {
      return res.status(400).json({ message: "El email ya esta registrado" });
    }

    // Se hashea password antes de guardar para proteger credenciales.
    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES (?, ?, ?, 'cliente')
    `;

    const [result] = await pool.query(sql, [name, email, hashedPassword]);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: result.insertId,
        name,
        email,
        role: "cliente"
      }
    });
  } catch (error) {
    return next(error);
  }
}

// Bloque de login: valida credenciales y emite token JWT.
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    const refreshExpiresAt = buildRefreshExpiryDate();

    // Se persiste hash del refresh token para permitir rotacion y revocacion.
    await pool.query(
      `UPDATE usuarios
       SET refresh_token_hash = ?, refresh_token_expires_at = ?
       WHERE id = ?`,
      [refreshTokenHash, refreshExpiresAt, user.id]
    );

    // Se envía refresh token en cookie httpOnly para reducir superficie XSS.
    res.cookie("refresh_token", refreshToken, buildRefreshCookieOptions());

    return res.status(200).json({
      message: "Login exitoso",
      accessToken,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email,
        role: user.rol
      }
    });
  } catch (error) {
    return next(error);
  }
}

// Bloque de refresh: valida refresh token y rota par de tokens.
async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Refresh token invalido o expirado" });
    }

    const [rows] = await pool.query(
      "SELECT id, nombre, email, rol, refresh_token_hash, refresh_token_expires_at FROM usuarios WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario no valido para refresh" });
    }

    const user = rows[0];
    if (!user.refresh_token_hash) {
      return res.status(401).json({ message: "Sesion no vigente" });
    }

    if (user.refresh_token_expires_at && new Date(user.refresh_token_expires_at) < new Date()) {
      return res.status(401).json({ message: "Refresh token vencido" });
    }

    const refreshMatches = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!refreshMatches) {
      return res.status(401).json({ message: "Refresh token revocado" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 12);
    const refreshExpiresAt = buildRefreshExpiryDate();

    await pool.query(
      `UPDATE usuarios
       SET refresh_token_hash = ?, refresh_token_expires_at = ?
       WHERE id = ?`,
      [newRefreshHash, refreshExpiresAt, user.id]
    );

    res.cookie("refresh_token", newRefreshToken, buildRefreshCookieOptions());

    return res.status(200).json({
      message: "Token renovado correctamente",
      accessToken: newAccessToken
    });
  } catch (error) {
    return next(error);
  }
}

// Bloque de logout: revoca refresh token persistido y limpia cookie de sesion.
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        await pool.query(
          "UPDATE usuarios SET refresh_token_hash = NULL, refresh_token_expires_at = NULL WHERE id = ?",
          [decoded.id]
        );
      } catch (error) {
        // Si el token ya expiro o es invalido, igual limpiamos cookie sin filtrar detalle.
      }
    }

    res.clearCookie("refresh_token", {
      ...buildRefreshCookieOptions(),
      maxAge: undefined
    });

    return res.status(200).json({ message: "Sesion cerrada correctamente" });
  } catch (error) {
    return next(error);
  }
}

// Bloque de perfil: retorna datos del usuario autenticado por token.
async function profile(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      id: rows[0].id,
      name: rows[0].nombre,
      email: rows[0].email,
      role: rows[0].rol,
      created_at: rows[0].created_at
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  profile,
  refresh,
  logout
};

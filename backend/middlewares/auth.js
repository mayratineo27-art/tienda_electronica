// Bloque de importaciones: libreria JWT para verificar identidad y autorizacion.
const jwt = require("jsonwebtoken");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

// Bloque de middleware de autenticacion: valida token y adjunta usuario al request.
function verifyToken(req, res, next) {
  // Se obtiene cabecera Authorization con formato: Bearer <token>.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token no proporcionado o formato invalido"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Se valida firma y expiracion del token usando secreto del entorno.
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // Se guarda usuario autenticado para uso en controladores siguientes.
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalido o expirado"
    });
  }
}

// Bloque de autorizacion por roles: permite restringir recursos por perfil.
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acceso denegado: rol insuficiente"
      });
    }

    return next();
  };
}

// Bloque de compatibilidad: alias para rutas que ya usan requireAdmin.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado: se requiere rol administrador"
    });
  }

  return next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireRoles
};

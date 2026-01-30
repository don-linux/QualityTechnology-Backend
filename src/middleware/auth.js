import jwt from "jsonwebtoken";
import pool from "../config/database.js";

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT y añade la información del usuario al request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_secreta_dev"
    );

    // Añadir información del usuario al request
    req.user = {
      usuario_id: decoded.usuario_id,
      rol_id: decoded.rol_id,
      rol: decoded.rol,
      nombre: decoded.nombre,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Token inválido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expirado" });
    }
    return res.status(500).json({ error: "Error en la autenticación" });
  }
};

/**
 * Middleware de autorización por roles
 * @param {...string} roles - Roles permitidos
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const userRole = req.user.rol?.toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para esta acción" });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero añade la info del usuario si existe
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "clave_secreta_dev"
      );
      req.user = {
        usuario_id: decoded.usuario_id,
        rol_id: decoded.rol_id,
        rol: decoded.rol,
        nombre: decoded.nombre,
      };
    }
    next();
  } catch (error) {
    // Si hay error, continuar sin usuario (autenticación opcional)
    next();
  }
};

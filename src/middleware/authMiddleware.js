import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  console.error("FATAL: La variable de entorno JWT_SECRET no está definida.");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn(`[AUTH] Token ausente — ${req.method} ${req.originalUrl} — IP: ${req.ip}`);
    return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.warn(`[AUTH] Token inválido — ${req.method} ${req.originalUrl} — IP: ${req.ip} — ${err.message}`);
    res.status(403).json({ error: "Token inválido o expirado." });
  }
};

/**
 * Variante que acepta token desde query param `?token=` además del header.
 * Útil para recursos estáticos cargados con <img src="...">.
 */
export const authStaticMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado." });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Token inválido o expirado." });
  }
};

export default authMiddleware;

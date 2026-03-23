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
    return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado." });
  }
};

export default authMiddleware;

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó un token." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "clave_secreta_dev");
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: "Token inválido o expirado." });
    }
};

export default authMiddleware;

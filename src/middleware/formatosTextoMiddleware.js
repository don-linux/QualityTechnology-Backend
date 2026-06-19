import { formatearStringsEnBody } from "../utils/formatosTexto.js";

/** Normaliza cadenas de texto libre en el body de POST/PUT/PATCH. */
export function formatosTextoMiddleware(req, res, next) {
  if (!req.body || typeof req.body !== "object") return next();
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();

  req.body = formatearStringsEnBody(req.body);
  next();
}

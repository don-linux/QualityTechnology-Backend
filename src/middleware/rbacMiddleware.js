import RolesModulosModel from "../models/RolesModulosModel.js";

const cache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000;

async function getModulosConCache(rolId) {
  const entry = cache.get(rolId);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.modulos;
  }
  const modulos = await RolesModulosModel.getModulosByRol(rolId);
  cache.set(rolId, { modulos, timestamp: Date.now() });
  return modulos;
}

export function invalidarCacheRbac(rolId) {
  if (rolId !== undefined) {
    cache.delete(Number(rolId));
  } else {
    cache.clear();
  }
}

/**
 * Factory que retorna un middleware de control de acceso por módulo.
 * @param {string} moduloRequerido — fc_ruta del módulo (ej. "/usuarios")
 */
const rbacMiddleware = (moduloRequerido) => async (req, res, next) => {
  try {
    const { rol_id } = req.user;
    if (!rol_id) {
      return res.status(403).json({ error: "No se pudo determinar el rol del usuario." });
    }

    const modulos = await getModulosConCache(rol_id);

    const tieneAcceso = modulos.some(
      (m) => m.fc_ruta === moduloRequerido || m.fc_nombre === moduloRequerido
    );

    if (!tieneAcceso) {
      return res.status(403).json({ error: "No tienes permisos para acceder a este recurso." });
    }

    next();
  } catch (err) {
    console.error("Error en rbacMiddleware:", err);
    res.status(500).json({ error: "Error al verificar permisos." });
  }
};

export default rbacMiddleware;

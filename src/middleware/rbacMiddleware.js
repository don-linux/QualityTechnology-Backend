import prisma from "../prisma.js";
import { serializeModulo } from "../utils/serializers.js";

const cache = new Map();
const CACHE_TTL_MS = Number(process.env.RBAC_CACHE_TTL_MS) || 2 * 60 * 1000;

async function getModulosByRol(rolId) {
  const rol = await prisma.rol.findUnique({ where: { rolId: Number(rolId) } });
  if (!rol) return [];

  if (rol.esRoot) {
    const modulos = await prisma.modulo.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return modulos.map(serializeModulo);
  }

  const relaciones = await prisma.rolModulo.findMany({
    where: { rolId: Number(rolId) },
    include: { modulo: true },
    orderBy: { modulo: { nombre: "asc" } },
  });
  return relaciones.map((r) => serializeModulo(r.modulo));
}

async function getModulosConCache(rolId) {
  if (!CACHE_TTL_MS) return getModulosByRol(rolId);

  const key = Number(rolId);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.modulos;
  }
  const modulos = await getModulosByRol(rolId);
  cache.set(key, { modulos, timestamp: Date.now() });
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
 * Devuelve un middleware que valida si el usuario autenticado tiene acceso al
 * modulo cuya ruta o nombre se pasa como parametro. La validacion se hace
 * contra los registros sembrados en la tabla `modulos` (ej. "/usuarios").
 */
const rbacMiddleware = (moduloRequerido) => async (req, res, next) => {
  try {
    const { rol_id } = req.user || {};
    if (!rol_id) {
      return res.status(403).json({ error: "No se pudo determinar el rol del usuario." });
    }

    const modulos = await getModulosConCache(rol_id);

    const tieneAcceso = modulos.some(
      (m) => m.ruta === moduloRequerido || m.nombre === moduloRequerido
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

import prisma from "../prisma.js";

/**
 * Resuelve un parametro de "granja" (id numerico o nombre) a una ubicacion
 * registrada en la tabla `ubicaciones`. Compatibilidad con el frontend que
 * sigue enviando `granja` como string (Ej. "GRANJA SUR").
 *
 * @param {string|number|null|undefined} granjaParam
 * @returns {Promise<{ ubicacionId: number, nombre: string } | null>}
 */
export async function resolverUbicacion(granjaParam) {
  if (granjaParam === undefined || granjaParam === null) return null;
  const trimmed = String(granjaParam).trim();
  if (!trimmed) return null;

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    const u = await prisma.ubicacion.findUnique({ where: { ubicacionId: asNumber } });
    if (u) return { ubicacionId: u.ubicacionId, nombre: u.nombre };
  }

  const u = await prisma.ubicacion.findUnique({ where: { nombre: trimmed } });
  return u ? { ubicacionId: u.ubicacionId, nombre: u.nombre } : null;
}

/**
 * Variante que crea la ubicacion si no existe. Util para mantener
 * compatibilidad con flujos antiguos donde el frontend envia un nombre
 * libre sin haber dado de alta la ubicacion previamente.
 */
export async function resolverOCrearUbicacion(granjaParam) {
  const existente = await resolverUbicacion(granjaParam);
  if (existente) return existente;

  const trimmed = String(granjaParam ?? "").trim();
  if (!trimmed) return null;

  const creada = await prisma.ubicacion.create({
    data: { nombre: trimmed, activo: true },
  });
  return { ubicacionId: creada.ubicacionId, nombre: creada.nombre };
}

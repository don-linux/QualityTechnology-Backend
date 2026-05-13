import prisma from "../prisma.js";
import { resolverUbicacionFlexible } from "./granjaUbicacion.js";

/**
 * Resuelve un parametro de "granja" (id numerico o nombre) a una ubicacion
 * registrada en la tabla `ubicacion`. Compatibilidad con el frontend que
 * sigue enviando `granja` como string (Ej. "GRANJA SUR").
 *
 * También reconoce alias cortos (Medellin, La Ceiba) alineados con Unidad de Negocio.
 *
 * @param {string|number|null|undefined} granjaParam
 * @returns {Promise<{ ubicacionId: number, nombre: string } | null>}
 */
export async function resolverUbicacion(granjaParam) {
  return resolverUbicacionFlexible(granjaParam);
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
    data: { nombre: trimmed },
  });
  return { ubicacionId: creada.id, nombre: creada.nombre };
}

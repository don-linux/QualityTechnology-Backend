import prisma from "../prisma.js";

/**
 * Normaliza texto para comparar nombres de granja desde query params o payloads.
 */
export function normalizarGranjaParam(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Construye filtros sobre `ubicacion.nombre` que coincidan con el nombre corto del
 * catálogo (Unidad de Negocio), abreviaturas típicas o el nombre registrado en BD.
 *
 * @param {string} granjaParam — ej. "Medellin", "La Ceiba", "Granja Acuicola Medellin"
 * @returns {object|null} condición usable en `where: { ubicacion: ... }` o `{}` dentro de ubicacion
 */
export function ubicacionNombreWhereFromGranja(granjaParam) {
  const g = String(granjaParam ?? "").trim();
  if (!g) return null;
  const n = normalizarGranjaParam(g);

  const variants = new Set([g]);

  if (n === "medellin") {
    variants.add("Granja Acuicola Medellin");
  }
  if (n === "la ceiba" || n === "ceiba") {
    variants.add("Granja Acuicola La Ceiba");
    variants.add("Granja Acuicola Ceiba");
  }

  if (n.includes("medellin")) variants.add("Granja Acuicola Medellin");
  if (n.includes("ceiba")) {
    variants.add("Granja Acuicola La Ceiba");
    variants.add("Granja Acuicola Ceiba");
  }

  const list = [...variants];
  if (list.length === 1) {
    return { nombre: { equals: list[0], mode: "insensitive" } };
  }
  return { OR: list.map((nombre) => ({ nombre: { equals: nombre, mode: "insensitive" } })) };
}

/**
 * Primera ubicación que responde al parámetro de granja (incluye alias cortos).
 * @returns {Promise<{ ubicacionId: number, nombre: string } | null>}
 */
export async function resolverUbicacionFlexible(granjaParam) {
  if (granjaParam === undefined || granjaParam === null) return null;
  const trimmed = String(granjaParam).trim();
  if (!trimmed) return null;

  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    const u = await prisma.ubicacion.findUnique({ where: { id: asNumber } });
    if (u) return { ubicacionId: u.id, nombre: u.nombre };
  }

  const condNombre = ubicacionNombreWhereFromGranja(trimmed);
  if (condNombre) {
    const u = await prisma.ubicacion.findFirst({ where: condNombre });
    if (u) return { ubicacionId: u.id, nombre: u.nombre };
  }

  const uExact = await prisma.ubicacion.findUnique({ where: { nombre: trimmed } });
  return uExact ? { ubicacionId: uExact.id, nombre: uExact.nombre } : null;
}

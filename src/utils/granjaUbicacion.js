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

const STOP_UNIDAD_MATCH = new Set(
  ["granja", "acuicola", "la", "el", "de", "y", "del", "los", "las"].map(normalizarGranjaParam),
);

/**
 * Indica si dos nombres de unidad de negocio / granja se refieren a la misma:
 * igualdad normalizada o subcadena significativa (≥4 caracteres, sin palabras
 * genéricas). Cubre variantes como "Medellin" vs "Granja Acuicola Medellin".
 */
export function nombresUnidadCoinciden(a, b) {
  const na = normalizarGranjaParam(a);
  const nb = normalizarGranjaParam(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  if (shorter.length < 4 || !longer.includes(shorter)) return false;
  return !STOP_UNIDAD_MATCH.has(shorter);
}

/**
 * Alcance de visibilidad por unidad de negocio del usuario autenticado, resuelto
 * contra BD a partir del empleado vinculado (`empleados.unidad_negocio_id`):
 *
 * 1. Rol `esRoot` → sin restricción (`esRoot: true`).
 * 2. Unidad de negocio del empleado vinculado al usuario.
 * 3. Sin empleado o sin unidad asignada → `unidad: null` (no ve registros de ventas).
 *
 * @param {{ usuario_id?: number }} jwtUser — `req.user` del authMiddleware
 * @returns {Promise<{ esRoot: boolean, unidad: { id: number, nombre: string } | null }>}
 */
export async function alcanceUnidadNegocio(jwtUser) {
  const usuarioId = Number(jwtUser?.usuario_id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return { esRoot: false, unidad: null };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      rol: true,
      empleados: { include: { unidadNegocio: true } },
    },
  });
  if (!usuario) return { esRoot: false, unidad: null };
  if (usuario.rol?.esRoot) return { esRoot: true, unidad: null };

  const unidadEmpleado = usuario.empleados?.unidadNegocio;
  if (unidadEmpleado) {
    return { esRoot: false, unidad: { id: unidadEmpleado.id, nombre: unidadEmpleado.nombre } };
  }

  return { esRoot: false, unidad: null };
}

/**
 * Visibilidad de un registro (por su texto de empresa/granja: `ventas.empresa`,
 * `lista_espera.granja`) dentro del alcance del usuario:
 * root ve todo; con unidad asignada solo lo que coincide; sin unidad, nada.
 *
 * @param {string} texto
 * @param {{ esRoot: boolean, unidad: { nombre: string } | null }} alcance
 */
export function textoEnAlcanceUnidad(texto, alcance) {
  if (alcance?.esRoot) return true;
  if (!alcance?.unidad) return false;
  return nombresUnidadCoinciden(texto, alcance.unidad.nombre);
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
 * Primer ID de ubicación válido (>0) encontrado entre varias fuentes opcionales.
 */
export function primerUbicacionIdValido(...candidatos) {
  for (const c of candidatos) {
    if (c === undefined || c === null || c === "") continue;
    const n = Number(c);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return null;
}

/**
 * Filtro aplicable sobre el modelo `Pileta`, o igual en `where: { piletas: ... }`.
 *
 * Preferencia: `ubicacion_id` (FK en `piletas.ubicacion_id`) frente al nombre texto
 * heredado (`granja` en query/path). Así la “sede” se resuelve por catálogo
 * `ubicacion`, no solo por igualar strings.
 *
 * Compatibilidad: si no hay id, siguen funcionando rutas `:granja` y `?granja=` con aliases.
 *
 * @param {express.Request|null|undefined} req
 * @returns {{ ubicacionId: number } | { ubicacion: object } | null}
 */
export function piletaWhereUbicacionFromRequest(req) {
  const q = req?.query ?? {};
  const p = req?.params ?? {};

  const ubicacionId = primerUbicacionIdValido(q.ubicacion_id, q.ubicacionId, p.ubicacion_id);
  if (ubicacionId != null) {
    return { ubicacionId };
  }

  const granjaNombre =
    typeof q.granja === "string" && q.granja.trim()
      ? q.granja.trim()
      : typeof p.granja === "string"
        ? p.granja.trim()
        : "";

  if (!granjaNombre) return null;
  const cond = ubicacionNombreWhereFromGranja(granjaNombre);
  return cond ? { ubicacion: cond } : null;
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
  if (uExact) return { ubicacionId: uExact.id, nombre: uExact.nombre };

  /**
   * Último recurso: nombres de `unidades_negocio.fc_nombre` suelen incluir sólo parte
   * del texto del catálogo `ubicacion.nombre`. Coincidimos por igualdad normalizada o
   * por subcadena (evitando palabras muertas muy cortas / genéricas).
   */
  const STOP_MATCH = new Set(
    ["granja", "acuícola", "la", "el", "de", "y", "del", "los", "las"].map(normalizarGranjaParam),
  );
  const todas = await prisma.ubicacion.findMany({
    select: { id: true, nombre: true },
    orderBy: { id: "asc" },
  });
  const nt = normalizarGranjaParam(trimmed);
  let best = null;
  let bestScore = 0;
  for (const u of todas) {
    const un = normalizarGranjaParam(u.nombre);
    if (un === nt) return { ubicacionId: u.id, nombre: u.nombre };
    const shorter = un.length <= nt.length ? un : nt;
    const longer = un.length <= nt.length ? nt : un;
    if (shorter.length < 4 || !longer.includes(shorter)) continue;
    if (STOP_MATCH.has(shorter)) continue;
    if (shorter.length > bestScore) {
      bestScore = shorter.length;
      best = u;
    }
  }
  return best ? { ubicacionId: best.id, nombre: best.nombre } : null;
}

/**
 * Resuelve unidad de negocio tipo granja a partir del nombre del rol (gam → Medellín, gac → Ceiba).
 * Misma convención que el frontend (`resolveUnidadByRol`).
 *
 * @param {Array<{ id: number, nombre: string }>} unidades
 * @param {string} rolNombre
 * @returns {{ id: number, nombre: string } | null}
 */
export function resolveUnidadNegocioFromRol(unidades, rolNombre) {
  const rol = normalizarGranjaParam(rolNombre);
  if (!rol) return null;

  const granjas = (unidades || []).filter((u) =>
    normalizarGranjaParam(u.nombre).includes("granja"),
  );

  if (rol.includes("gam")) {
    return (
      granjas.find((u) => normalizarGranjaParam(u.nombre).includes("medellin")) ?? null
    );
  }

  if (rol.includes("gac")) {
    return (
      granjas.find((u) => normalizarGranjaParam(u.nombre).includes("ceiba")) ?? null
    );
  }

  return null;
}

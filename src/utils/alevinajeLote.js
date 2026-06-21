/**
 * Lote genético en alevinaje (misma convención que incubación / reproductores).
 */

import { normalizarLoteOpcional } from "./eficienciaReproductivaLote.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

export function parseLoteDesdeBody(body, pick) {
  return normalizarLoteOpcional(
    pick(body, "lote", "fc_lote", "lote_genetico", "fc_lote_genetico"),
  );
}

async function loteEficienciaReproductivaEnPileta(tx, piletaId, { soloActivo = false } = {}) {
  const where = { pileta_id: piletaId };
  if (soloActivo) where.fecha_egreso = null;
  const inc = await tx.eficiencia_reproductiva.findFirst({
    where,
    orderBy: { id: "desc" },
    select: { lote: true },
  });
  return inc?.lote ?? null;
}

async function loteAlevinajeVigenteEnPileta(tx, piletaId) {
  const row = await tx.alevinaje.findFirst({
    where: { pileta_id: piletaId },
    orderBy: { id: "desc" },
    select: { lote: true },
  });
  return row?.lote ?? null;
}

async function loteDesdePiletaOrigen(tx, piletaOrigenId) {
  const origenId = toInt(piletaOrigenId);
  if (!origenId) return null;

  const pil = await tx.pileta.findUnique({
    where: { id: origenId },
    select: { tipo: true },
  });
  if (!pil) return null;

  if (pil.tipo === "alevinaje") {
    return loteAlevinajeVigenteEnPileta(tx, origenId);
  }
  if (pil.tipo === "incubacion") {
    return (
      (await loteEficienciaReproductivaEnPileta(tx, origenId, { soloActivo: true })) ??
      (await loteEficienciaReproductivaEnPileta(tx, origenId))
    );
  }
  return null;
}

async function loteDesdeSiembraOrigen(tx, siembraOrigenId) {
  const siembraId = toInt(siembraOrigenId);
  if (!siembraId) return null;

  const siembra = await tx.siembra.findUnique({
    where: { id: siembraId },
    select: {
      pileta_origen: true,
      piletas_siembra_pileta_origenTopiletas: { select: { tipo: true } },
    },
  });
  if (!siembra?.pileta_origen) return null;

  const tipoOrigen = siembra.piletas_siembra_pileta_origenTopiletas?.tipo;
  if (tipoOrigen === "incubacion") {
    return loteEficienciaReproductivaEnPileta(tx, siembra.pileta_origen);
  }
  if (tipoOrigen === "alevinaje") {
    return loteAlevinajeVigenteEnPileta(tx, siembra.pileta_origen);
  }
  return null;
}

/**
 * Resuelve el lote para un registro de alevinaje: body explícito, vigente en pileta,
 * pileta de origen (trazabilidad) o cadena de siembra desde incubación.
 */
export async function resolverLoteAlevinaje(
  tx,
  { loteBody = null, piletaId = null, siembraOrigenId = null, piletaOrigenId = null },
) {
  const explicito = normalizarLoteOpcional(loteBody);
  if (explicito) return explicito;

  const pid = toInt(piletaId);
  if (pid) {
    const prev = await loteAlevinajeVigenteEnPileta(tx, pid);
    if (prev) return prev;
  }

  const desdeOrigen = await loteDesdePiletaOrigen(tx, piletaOrigenId);
  if (desdeOrigen) return desdeOrigen;

  return loteDesdeSiembraOrigen(tx, siembraOrigenId);
}

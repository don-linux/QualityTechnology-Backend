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
    pick(body, "lote", "lote_genetico"),
  );
}

async function loteEficienciaReproductivaEnInfraestructuraFisica(tx, infraestructuraFisicaId, { soloActivo = false } = {}) {
  const where = { infraestructura_fisica_id: infraestructuraFisicaId };
  if (soloActivo) where.fecha_egreso = null;
  const inc = await tx.eficiencia_reproductiva.findFirst({
    where,
    orderBy: { id: "desc" },
    select: { lote: true },
  });
  return inc?.lote ?? null;
}

async function loteAlevinajeVigenteEnInfraestructuraFisica(tx, infraestructuraFisicaId) {
  const row = await tx.alevinaje.findFirst({
    where: { infraestructura_fisica_id: infraestructuraFisicaId },
    orderBy: { id: "desc" },
    select: { lote: true },
  });
  return row?.lote ?? null;
}

async function loteDesdeInfraestructuraFisicaOrigen(tx, infraestructuraFisicaOrigenId) {
  const origenId = toInt(infraestructuraFisicaOrigenId);
  if (!origenId) return null;

  const pil = await tx.infraestructuraFisica.findUnique({
    where: { id: origenId },
    select: { tipo: true },
  });
  if (!pil) return null;

  if (pil.tipo === "alevinaje") {
    return loteAlevinajeVigenteEnInfraestructuraFisica(tx, origenId);
  }
  if (pil.tipo === "incubacion") {
    return (
      (await loteEficienciaReproductivaEnInfraestructuraFisica(tx, origenId, { soloActivo: true })) ??
      (await loteEficienciaReproductivaEnInfraestructuraFisica(tx, origenId))
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
      infraestructura_fisica_origen: true,
      infraestructuraFisicaOrigen: { select: { tipo: true } },
    },
  });
  if (!siembra?.infraestructura_fisica_origen) return null;

  const tipoOrigen = siembra.infraestructuraFisicaOrigen?.tipo;
  if (tipoOrigen === "incubacion") {
    return loteEficienciaReproductivaEnInfraestructuraFisica(tx, siembra.infraestructura_fisica_origen);
  }
  if (tipoOrigen === "alevinaje") {
    return loteAlevinajeVigenteEnInfraestructuraFisica(tx, siembra.infraestructura_fisica_origen);
  }
  return null;
}

/**
 * Resuelve el lote para un registro de alevinaje: body explícito, vigente en infraestructura física,
 * infraestructura física de origen (trazabilidad) o cadena de siembra desde incubación.
 */
export async function resolverLoteAlevinaje(
  tx,
  { loteBody = null, infraestructuraFisicaId = null, siembraOrigenId = null, infraestructuraFisicaOrigenId = null },
) {
  const explicito = normalizarLoteOpcional(loteBody);
  if (explicito) return explicito;

  const pid = toInt(infraestructuraFisicaId);
  if (pid) {
    const prev = await loteAlevinajeVigenteEnInfraestructuraFisica(tx, pid);
    if (prev) return prev;
  }

  const desdeOrigen = await loteDesdeInfraestructuraFisicaOrigen(tx, infraestructuraFisicaOrigenId);
  if (desdeOrigen) return desdeOrigen;

  return loteDesdeSiembraOrigen(tx, siembraOrigenId);
}

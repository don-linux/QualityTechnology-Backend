/**
 * Registros periódicos (alevinaje, engorda): varias filas por infraestructura física en BD.
 * La vista operativa y el inventario vigente usan solo el último registro por infraestructura física.
 */

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ infraestructuraFisicaKey?: string, idKey?: string }} [opts]
 */
export function ultimoRegistroPorInfraestructuraFisica(rows, opts = {}) {
  const infraestructuraFisicaKey = opts.infraestructuraFisicaKey ?? "infraestructura_fisica_id";
  const idKey = opts.idKey ?? "id";
  const map = new Map();

  for (const row of rows) {
    if (!row) continue;
    const pid = row[infraestructuraFisicaKey];
    if (pid == null) continue;
    const prev = map.get(pid);
    const id = Number(row[idKey] ?? 0);
    const prevId = prev ? Number(prev[idKey] ?? 0) : -1;
    if (!prev || id >= prevId) map.set(pid, row);
  }

  return Array.from(map.values());
}

/**
 * Cantidad vigente a partir de filas periódicas incluidas en una infraestructuraFisica (Prisma include).
 * @param {Array<{ cantidad_total?: number, id?: number }>} rows
 */
export function cantidadVigenteDesdeRegistrosPeriodicos(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;

  const hasInfraestructuraFisicaKey = rows.some((r) => r?.infraestructura_fisica_id != null);
  let row;
  if (hasInfraestructuraFisicaKey) {
    const ultimo = ultimoRegistroPorInfraestructuraFisica(rows, { infraestructuraFisicaKey: "infraestructura_fisica_id", idKey: "id" });
    row = ultimo[0];
  } else {
    // Include desde InfraestructuraFisica sin infraestructura_fisica_id en el select: el más reciente por id
    row = rows.reduce((best, r) => {
      if (!r) return best;
      const id = Number(r.id ?? 0);
      const bestId = Number(best?.id ?? -1);
      return id >= bestId ? r : best;
    }, null);
  }

  const ct = Number(row?.cantidad_total);
  return Number.isFinite(ct) && ct > 0 ? ct : 0;
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number} infraestructuraFisicaId
 * @param {"alevinaje"|"engorda"|"incubacion"|"reproductores"} etapa
 */
export async function cantidadVigenteEnInfraestructuraFisica(tx, infraestructuraFisicaId, etapa) {
  const id = Number(infraestructuraFisicaId);
  if (!Number.isFinite(id)) return 0;

  if (etapa === "reproductores") {
    const row = await tx.reproductor.findFirst({
      where: { infraestructura_fisica_id: id, activo: true },
      orderBy: { id: "desc" },
      select: { cantidad_total: true },
    });
    return row?.cantidad_total ?? 0;
  }

  if (etapa === "alevinaje") {
    const row = await tx.alevinaje.findFirst({
      where: { infraestructura_fisica_id: id },
      orderBy: { id: "desc" },
      select: { cantidad_total: true },
    });
    return row?.cantidad_total ?? 0;
  }

  if (etapa === "incubacion") {
    const row = await tx.eficiencia_reproductiva.findFirst({
      where: { infraestructura_fisica_id: id },
      orderBy: { id: "desc" },
      select: { fecha_egreso: true },
    });
    return row && !row.fecha_egreso ? 1 : 0;
  }

  const row = await tx.engorda.findFirst({
    where: { infraestructura_fisica_id: id },
    orderBy: { id: "desc" },
    select: { cantidad_total: true },
  });
  return row?.cantidad_total ?? 0;
}

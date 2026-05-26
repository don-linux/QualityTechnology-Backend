/**
 * Registros periódicos (alevinaje, engorda): varias filas por pileta en BD.
 * La vista operativa y el inventario vigente usan solo el último registro por pileta.
 */

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ piletaKey?: string, idKey?: string }} [opts]
 */
export function ultimoRegistroPorPileta(rows, opts = {}) {
  const piletaKey = opts.piletaKey ?? "pileta_id";
  const idKey = opts.idKey ?? "id";
  const map = new Map();

  for (const row of rows) {
    if (!row) continue;
    const pid = row[piletaKey];
    if (pid == null) continue;
    const prev = map.get(pid);
    const id = Number(row[idKey] ?? 0);
    const prevId = prev ? Number(prev[idKey] ?? 0) : -1;
    if (!prev || id >= prevId) map.set(pid, row);
  }

  return Array.from(map.values());
}

/**
 * Cantidad vigente a partir de filas periódicas incluidas en una pileta (Prisma include).
 * @param {Array<{ cantidad_total?: number, id?: number }>} rows
 */
export function cantidadVigenteDesdeRegistrosPeriodicos(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const ultimo = ultimoRegistroPorPileta(rows, { piletaKey: "pileta_id", idKey: "id" });
  const row = ultimo[0];
  const ct = Number(row?.cantidad_total);
  return Number.isFinite(ct) && ct > 0 ? ct : 0;
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number} piletaId
 * @param {"alevinaje"|"engorda"} etapa
 */
export async function cantidadVigenteEnPileta(tx, piletaId, etapa) {
  const id = Number(piletaId);
  if (!Number.isFinite(id)) return 0;

  if (etapa === "alevinaje") {
    const row = await tx.alevinaje.findFirst({
      where: { pileta_id: id },
      orderBy: { id: "desc" },
      select: { cantidad_total: true },
    });
    return row?.cantidad_total ?? 0;
  }

  const row = await tx.engorda.findFirst({
    where: { pileta_id: id },
    orderBy: { id: "desc" },
    select: { cantidad_total: true },
  });
  return row?.cantidad_total ?? 0;
}

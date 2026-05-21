/**
 * Descuentos en filas `engorda` cuando egresa inventario hacia otra pileta.
 */

import { aplicarEstadoPiletaPorCantidad } from "./reproductorInventario.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number|null} piletaOrigenId
 * @param {{ piletaDestinoId?: number|null, cantidadTotalSinSexo?: number, cantidad?: number, cantidad_total?: number }} opciones
 */
export async function descontarEngordaPorEgresoHaciaEngorda(tx, piletaOrigenId, opciones = {}) {
  const ori = toInt(piletaOrigenId);
  const dest = toInt(opciones.piletaDestinoId ?? null);
  if (!ori || (dest && ori === dest)) return;

  const qty = Math.max(
    0,
    Math.floor(
      Number(
        opciones.cantidadTotalSinSexo ??
          opciones.cantidad ??
          opciones.cantidad_total ??
          0,
      ) || 0,
    ),
  );
  if (qty <= 0) return;

  const rows = await tx.engorda.findMany({
    where: { pileta_id: ori },
    orderBy: { id: "asc" },
    select: { id: true, cantidad_total: true },
  });

  const total = rows.reduce((s, r) => s + (r.cantidad_total ?? 0), 0);
  if (rows.length === 0 || qty > total) {
    const err = new Error("Cantidad mayor al inventario de engorda en la pileta de origen");
    err.code = "ENGORDA_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  let rest = qty;
  for (const row of rows) {
    if (rest <= 0) break;
    const disponible = row.cantidad_total ?? 0;
    if (disponible <= 0) continue;
    const take = Math.min(disponible, rest);
    rest -= take;
    await tx.engorda.update({
      where: { id: row.id },
      data: { cantidad_total: disponible - take },
    });
  }

  const suma = await tx.engorda.aggregate({
    where: { pileta_id: ori },
    _sum: { cantidad_total: true },
  });
  const vivas = suma._sum.cantidad_total ?? 0;
  await aplicarEstadoPiletaPorCantidad(tx, ori, vivas);
}

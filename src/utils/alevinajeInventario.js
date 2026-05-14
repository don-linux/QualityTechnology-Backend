/**
 * Descuentos en filas `alevinaje` cuando egresa inventario hacia otra pileta (p. ej. engorda).
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
 * @param {{ piletaDestinoId?: number|null, machosDeducir?: number, hembrasDeducir?: number, cantidadTotalSinSexo?: number }} opciones
 */
export async function descontarAlevinajePorEgresoHaciaEngorda(tx, piletaOrigenId, opciones = {}) {
  const ori = toInt(piletaOrigenId);
  const dest = toInt(opciones.piletaDestinoId ?? null);
  if (!ori || (dest && ori === dest)) return;

  const md = Math.max(0, Math.floor(Number(opciones.machosDeducir ?? opciones.machos ?? 0) || 0));
  const hd = Math.max(0, Math.floor(Number(opciones.hembrasDeducir ?? opciones.hembras ?? 0) || 0));
  const qtySexo = md + hd;
  const qtyFallback = Math.max(0, Math.floor(Number(opciones.cantidadTotalSinSexo ?? 0) || 0));

  const rows = await tx.alevinaje.findMany({
    where: { pileta_id: ori },
    orderBy: { id: "asc" },
    select: { id: true, machos: true, hembras: true },
  });

  const totalM = rows.reduce((s, r) => s + (r.machos ?? 0), 0);
  const totalH = rows.reduce((s, r) => s + (r.hembras ?? 0), 0);

  if (rows.length === 0 && (qtySexo > 0 || qtyFallback > 0)) {
    const err = new Error("No hay registros de alevinaje en la pileta de origen");
    err.code = "ALEV_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  if (qtySexo > 0) {
    if (md > totalM || hd > totalH) {
      const err = new Error(
        "Cantidad mayor al inventario de alevinaje (machos/hembras) en la pileta de origen",
      );
      err.code = "ALEV_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    let remM = md;
    let remH = hd;
    for (const row of rows) {
      if (remM <= 0 && remH <= 0) break;
      const takeM = Math.min(row.machos ?? 0, remM);
      const takeH = Math.min(row.hembras ?? 0, remH);
      const nm = (row.machos ?? 0) - takeM;
      const nh = (row.hembras ?? 0) - takeH;
      remM -= takeM;
      remH -= takeH;
      await tx.alevinaje.update({
        where: { id: row.id },
        data: { machos: nm, hembras: nh, cantidad_total: nm + nh },
      });
    }
  } else if (qtyFallback > 0) {
    if (qtyFallback > totalM + totalH) {
      const err = new Error("Cantidad mayor al inventario de alevinaje en la pileta de origen");
      err.code = "ALEV_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    const copies = rows.map((r) => ({
      id: r.id,
      machos: r.machos ?? 0,
      hembras: r.hembras ?? 0,
    }));
    let rest = qtyFallback;
    for (const row of copies) {
      while (rest > 0 && row.machos + row.hembras > 0) {
        if (row.machos >= row.hembras && row.machos > 0) {
          row.machos -= 1;
          rest -= 1;
          continue;
        }
        if (row.hembras > 0) {
          row.hembras -= 1;
          rest -= 1;
          continue;
        }
        break;
      }
    }
    for (const row of copies) {
      await tx.alevinaje.update({
        where: { id: row.id },
        data: {
          machos: row.machos,
          hembras: row.hembras,
          cantidad_total: row.machos + row.hembras,
        },
      });
    }
  }

  const suma = await tx.alevinaje.aggregate({
    where: { pileta_id: ori },
    _sum: { machos: true, hembras: true },
  });
  const vivas = (suma._sum.machos ?? 0) + (suma._sum.hembras ?? 0);
  await aplicarEstadoPiletaPorCantidad(tx, ori, vivas);
}

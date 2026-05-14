/**
 * Descuentos en `engorda` cuando se trasladan organismos desde una pileta engorda hacia otra.
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
export async function descontarEngordaPorEgresoHaciaEngorda(tx, piletaOrigenId, opciones = {}) {
  const ori = toInt(piletaOrigenId);
  const dest = toInt(opciones.piletaDestinoId ?? null);
  if (!ori || (dest && ori === dest)) return;

  const md = Math.max(0, Math.floor(Number(opciones.machosDeducir ?? opciones.machos ?? 0) || 0));
  const hd = Math.max(0, Math.floor(Number(opciones.hembrasDeducir ?? opciones.hembras ?? 0) || 0));
  const qtySexo = md + hd;
  const qtyFallback = Math.max(0, Math.floor(Number(opciones.cantidadTotalSinSexo ?? 0) || 0));

  const eg = await tx.engorda.findUnique({
    where: { pileta_id: ori },
    select: { id: true, machos: true, hembras: true, cantidad: true },
  });
  if (!eg) {
    const err = new Error("La pileta de origen no tiene registro de engorda");
    err.code = "ENGORDA_ORIGEN_VACIA";
    throw err;
  }

  let m = eg.machos ?? 0;
  let h = eg.hembras ?? 0;
  const cantLegacy = eg.cantidad ?? 0;
  if (m === 0 && h === 0 && cantLegacy > 0) {
    m = cantLegacy;
  }

  if (qtySexo > 0) {
    if (md > m || hd > h) {
      const err = new Error(
        "Cantidad mayor al inventario de engorda (machos/hembras) en la pileta de origen",
      );
      err.code = "ENGORDA_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    m -= md;
    h -= hd;
  } else if (qtyFallback > 0) {
    const inv = m + h;
    if (qtyFallback > inv) {
      const err = new Error("Cantidad mayor al inventario de engorda en la pileta de origen");
      err.code = "ENGORDA_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    let rest = qtyFallback;
    while (rest > 0 && m + h > 0) {
      if (m >= h && m > 0) {
        m -= 1;
        rest -= 1;
        continue;
      }
      if (h > 0) {
        h -= 1;
        rest -= 1;
        continue;
      }
      break;
    }
  }

  const cantidadActual = m + h;
  await tx.engorda.update({
    where: { id: eg.id },
    data: {
      machos: m,
      hembras: h,
      cantidad: cantidadActual,
    },
  });
  await aplicarEstadoPiletaPorCantidad(tx, ori, cantidadActual);
}

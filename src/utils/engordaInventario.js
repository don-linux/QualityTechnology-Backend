/**
 * Descuentos en filas `engorda` cuando egresa inventario hacia otra pileta.
 * Solo el último registro periódico por pileta representa el inventario vigente.
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

  const vigente = await tx.engorda.findFirst({
    where: { pileta_id: ori },
    orderBy: { id: "desc" },
    select: { id: true, cantidad_total: true },
  });

  const disponible = vigente?.cantidad_total ?? 0;
  if (!vigente || qty > disponible) {
    const err = new Error("Cantidad mayor al inventario de engorda en la pileta de origen");
    err.code = "ENGORDA_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  const restante = disponible - qty;
  await tx.engorda.update({
    where: { id: vigente.id },
    data: { cantidad_total: restante },
  });

  await aplicarEstadoPiletaPorCantidad(tx, ori, restante);
}

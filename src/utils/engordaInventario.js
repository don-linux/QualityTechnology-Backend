/**
 * Descuentos en filas `engorda` cuando egresa inventario (venta, traslado, mortalidad).
 * Crea un registro periódico nuevo con el stock restante; solo el último registro por pileta
 * representa el inventario vigente (mismo criterio que los ingresos por traslado).
 */

import { aplicarEstadoPiletaPorCantidad } from "./reproductorInventario.js";
import { crearObservacionSiHay } from "./observacion.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number|null} piletaOrigenId
 * @param {{
 *   piletaDestinoId?: number|null,
 *   cantidadTotalSinSexo?: number,
 *   cantidad?: number,
 *   cantidad_total?: number,
 *   siembraOrigenId?: number|null,
 *   observacion?: string|null,
 *   usuarioId?: number|null,
 *   procesoObservacion?: string,
 * }} opciones
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
    select: {
      id: true,
      cantidad_total: true,
      cantidad_alimento: true,
      peso: true,
      biometria_id: true,
      observacion_id: true,
    },
  });

  const disponible = vigente?.cantidad_total ?? 0;
  if (!vigente || qty > disponible) {
    const err = new Error("Cantidad mayor al inventario de engorda en la pileta de origen");
    err.code = "ENGORDA_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  const restante = disponible - qty;
  const siembraOrigenId = toInt(opciones.siembraOrigenId ?? null);
  const obsTexto = opciones.observacion?.trim?.() ? String(opciones.observacion).trim() : "";
  const usuarioId = toInt(opciones.usuarioId ?? null);

  if (obsTexto && usuarioId) {
    await crearObservacionSiHay(tx, obsTexto, usuarioId, {
      piletaId: ori,
      proceso: opciones.procesoObservacion ?? "trazabilidad",
    });
  }

  await tx.engorda.create({
    data: {
      pileta_id: ori,
      cantidad_total: restante,
      cantidad_alimento: vigente.cantidad_alimento ?? 0,
      peso: vigente.peso ?? null,
      biometria_id: vigente.biometria_id ?? null,
      observacion_id: vigente.observacion_id ?? null,
      siembra_origen_id: siembraOrigenId,
    },
  });

  await aplicarEstadoPiletaPorCantidad(tx, ori, restante);
}

/**
 * Descuentos en filas `alevinaje` cuando egresa inventario (venta, traslado, mortalidad).
 * Crea un registro periódico nuevo con el stock restante; solo el último registro por pileta
 * representa el inventario vigente (mismo criterio que los ingresos por traslado).
 */

import { aplicarEstadoPiletaPorCantidad } from "./reproductorInventario.js";
import { crearObservacionEgresoInventario } from "./observacion.js";

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
 *   folioVenta?: string|number|null,
 * }} opciones
 */
export async function descontarAlevinajePorEgresoHaciaEngorda(tx, piletaOrigenId, opciones = {}) {
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

  const vigente = await tx.alevinaje.findFirst({
    where: { pileta_id: ori },
    orderBy: { id: "desc" },
    select: {
      id: true,
      cantidad_total: true,
      peso: true,
      biometria_id: true,
      lote: true,
    },
  });

  const disponible = vigente?.cantidad_total ?? 0;
  if (!vigente || qty > disponible) {
    const err = new Error("Cantidad mayor al inventario de alevinaje en la pileta de origen");
    err.code = "ALEV_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  const restante = disponible - qty;
  const siembraOrigenId = toInt(opciones.siembraOrigenId ?? null);
  const obsTexto = opciones.observacion?.trim?.() ? String(opciones.observacion).trim() : "";
  const usuarioId = toInt(opciones.usuarioId ?? null);
  if (usuarioId) {
    await crearObservacionEgresoInventario(
      tx,
      {
        textoNuevo: obsTexto,
        folioVenta: opciones.folioVenta ?? null,
      },
      usuarioId,
      {
        piletaId: ori,
        proceso: opciones.procesoObservacion ?? "trazabilidad",
      },
    );
  }

  await tx.alevinaje.create({
    data: {
      pileta_id: ori,
      lote: vigente.lote ?? null,
      cantidad_total: restante,
      peso: vigente.peso ?? null,
      biometria_id: vigente.biometria_id ?? null,
      siembra_origen_id: siembraOrigenId,
    },
  });

  await aplicarEstadoPiletaPorCantidad(tx, ori, restante);
}

/**
 * Descuentos en filas `alevinaje` cuando egresa inventario (venta, traslado, mortalidad).
 * Crea un registro periódico nuevo con el stock restante; solo el último registro por infraestructura física
 * representa el inventario vigente (mismo criterio que los ingresos por traslado).
 */

import { aplicarEstadoInfraestructuraFisicaPorCantidad } from "./reproductorInventario.js";
import { crearObservacionEgresoInventario } from "./observacion.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number|null} infraestructuraFisicaOrigenId
 * @param {{
 *   infraestructuraFisicaDestinoId?: number|null,
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
export async function descontarAlevinajePorEgresoHaciaEngorda(tx, infraestructuraFisicaOrigenId, opciones = {}) {
  const ori = toInt(infraestructuraFisicaOrigenId);
  const dest = toInt(opciones.infraestructuraFisicaDestinoId ?? null);
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
    where: { infraestructura_fisica_id: ori },
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
    const err = new Error("Cantidad mayor al inventario de alevinaje en la infraestructura física de origen");
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
        infraestructuraFisicaId: ori,
        proceso: opciones.procesoObservacion ?? "trazabilidad",
      },
    );
  }

  await tx.alevinaje.create({
    data: {
      infraestructura_fisica_id: ori,
      lote: vigente.lote ?? null,
      cantidad_total: restante,
      peso: vigente.peso ?? null,
      biometria_id: vigente.biometria_id ?? null,
      siembra_origen_id: siembraOrigenId,
    },
  });

  await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, ori, restante);
}

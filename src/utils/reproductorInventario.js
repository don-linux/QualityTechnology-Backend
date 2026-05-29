/**
 * Inventario `@map("reproductores")`: descuentos cuando los organismos egresan de la pileta reproductora.
 * Crea un registro periódico nuevo con el stock restante (mismo criterio que alevinaje / engorda).
 */

import { crearObservacionEgresoInventario } from "./observacion.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/** `Pileta.estado`: vacía u ocupada según cantidad declarada en inventario. */
export async function aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal) {
  const id = toInt(piletaId);
  if (!id) return;
  const estado = Number(cantidadTotal) > 0 ? "ocupada" : "vacia";
  await tx.pileta.update({
    where: { id },
    data: { estado },
  });
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number|null} piletaOrigenId
 * @param {{
 *   piletaDestinoAlevinajeId?: number|null,
 *   piletaDestinoId?: number|null,
 *   machosDeducir?: number,
 *   hembrasDeducir?: number,
 *   machos?: number,
 *   hembras?: number,
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
export async function descontarReproductorPorEgresoHaciaAlevinaje(tx, piletaOrigenId, opciones = {}) {
  const ori = toInt(piletaOrigenId);
  const destinoAlevId = opciones.piletaDestinoAlevinajeId ?? opciones.piletaDestinoId ?? null;

  const destino = destinoAlevId != null ? toInt(destinoAlevId) : null;
  if (!ori || (destino && ori === destino)) return;

  const md = Math.max(0, Math.floor(Number(opciones.machosDeducir ?? opciones.machos ?? 0) || 0));
  const hd = Math.max(0, Math.floor(Number(opciones.hembrasDeducir ?? opciones.hembras ?? 0) || 0));
  const qtySexo = md + hd;
  const qtyFallback = Math.max(
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
  const qty = qtySexo > 0 ? qtySexo : qtyFallback;
  if (qty <= 0) return;

  const vigente = await tx.reproductor.findFirst({
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
    const err = new Error("Cantidad mayor al inventario de reproductores en la pileta de origen");
    err.code = "REPRO_CANTIDAD_INSUFICIENTE";
    throw err;
  }

  const restante = disponible - qty;
  const siembraOrigenId = toInt(opciones.siembraOrigenId ?? null);
  const obsTexto = opciones.observacion?.trim?.() ? String(opciones.observacion).trim() : "";
  const usuarioId = toInt(opciones.usuarioId ?? null);
  const obsId = usuarioId
    ? await crearObservacionEgresoInventario(
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
      )
    : null;

  await tx.reproductor.create({
    data: {
      pileta_id: ori,
      cantidad_total: restante,
      cantidad_alimento: vigente.cantidad_alimento ?? 0,
      peso: vigente.peso ?? null,
      biometria_id: vigente.biometria_id ?? null,
      observacion_id: obsId,
      siembra_origen_id: siembraOrigenId,
    },
  });

  await aplicarEstadoPiletaPorCantidad(tx, ori, restante);
}

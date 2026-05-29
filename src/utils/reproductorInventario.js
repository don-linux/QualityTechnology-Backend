/**
 * Inventario `@map("reproductores")`: descuentos cuando los organismos egresan de la pileta reproductora.
 * Crea un registro periódico nuevo con el stock restante (mismo criterio que alevinaje / engorda).
 */

import { crearObservacionEgresoInventario } from "./observacion.js";
import { calcularRatioReproductor } from "./reproductorCampos.js";

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

  const vigente = await tx.reproductor.findFirst({
    where: { pileta_id: ori },
    orderBy: { id: "desc" },
    select: {
      id: true,
      machos: true,
      hembras: true,
      cantidad_total: true,
      cantidad_alimento: true,
      genetica_machos: true,
      familia_machos: true,
      procedencia_machos: true,
      genetica_hembras: true,
      familia_hembras: true,
      procedencia_hembras: true,
      talla: true,
      peso: true,
      biometria_id: true,
      observacion_id: true,
    },
  });

  if (!vigente) return;

  let m = vigente.machos ?? 0;
  let h = vigente.hembras ?? 0;
  const inv0 = m + h;
  if (inv0 <= 0) return;

  let sacar = 0;

  if (qtySexo > 0) {
    if (md > m || hd > h) {
      const err = new Error(
        "Cantidad declarada mayor al inventario de reproductores (machos/hembras) en la pileta de origen",
      );
      err.code = "REPRO_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    m -= md;
    h -= hd;
    sacar = qtySexo;
  } else if (qtyFallback > 0) {
    sacar = Math.min(qtyFallback, inv0);
    if (sacar < qtyFallback) {
      const err = new Error("Cantidad mayor al inventario de reproductores en la pileta de origen");
      err.code = "REPRO_CANTIDAD_INSUFICIENTE";
      throw err;
    }
    let rest = sacar;
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

  if (sacar <= 0) return;

  const cantidadActual = m + h;
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

  const base = {
    pileta_id: ori,
    machos: m,
    hembras: h,
    cantidad_total: cantidadActual,
    ratio: calcularRatioReproductor(m, h),
    genetica_machos: vigente.genetica_machos,
    familia_machos: vigente.familia_machos,
    procedencia_machos: vigente.procedencia_machos,
    genetica_hembras: vigente.genetica_hembras,
    familia_hembras: vigente.familia_hembras,
    procedencia_hembras: vigente.procedencia_hembras,
    talla: vigente.talla,
    cantidad_alimento: vigente.cantidad_alimento ?? 0,
    peso: vigente.peso ?? null,
    biometria_id: vigente.biometria_id ?? null,
    observacion_id: obsId,
    siembra_origen_id: siembraOrigenId,
  };

  await tx.reproductor.create({ data: base });

  await aplicarEstadoPiletaPorCantidad(tx, ori, cantidadActual);
}

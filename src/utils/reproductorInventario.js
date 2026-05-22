/**
 * Inventario `@map("reproductores")`: descuentos cuando los organismos egresan de la pileta reproductora
 * (p. ej. alta en `alevinaje` desde control reproductivo).
 */

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function calcularRatio(machos, hembras) {
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    return `1:${Math.round(r * 100) / 100}`;
  }
  return null;
}

/** `Pileta.estado`: vacía u ocupada según organismos declarados en la fila repro. */
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
 * Deduce desde la fila `reproductores` pegada a `piletaOrigenId` los machos y hembras indicados (traslado a alevinaje).
 *
 * Si `machosDeducir` y `hembrasDeducir` son ambos cero pero `cantidadTotalSinSexo > 0`, aplica la misma heurística que
 * traslados internos (`mayor subpoblación primero`).
 */
export async function descontarReproductorPorEgresoHaciaAlevinaje(tx, piletaOrigenId, opciones = {}) {
  const ori = toInt(piletaOrigenId);
  const destinoAlevId = opciones.piletaDestinoAlevinajeId ?? opciones.piletaDestinoId ?? null;

  /** No descontamos origen cuando no hay cambio físico esperado desde este flujo. */
  const destino = destinoAlevId != null ? toInt(destinoAlevId) : null;
  if (!ori || (destino && ori === destino)) return;

  const md = Math.max(0, Math.floor(Number(opciones.machosDeducir ?? opciones.machos ?? 0) || 0));
  const hd = Math.max(0, Math.floor(Number(opciones.hembrasDeducir ?? opciones.hembras ?? 0) || 0));
  const qtySexo = md + hd;
  const qtyFallback = Math.max(0, Math.floor(Number(opciones.cantidadTotalSinSexo ?? 0) || 0));

  const repOrig = await tx.reproductor.findUnique({
    where: { pileta_id: ori },
    select: { id: true, machos: true, hembras: true },
  });

  /** Pileta reproductora sin fila inventario — no hay nada que descontar */
  if (!repOrig) return;

  let m = repOrig.machos ?? 0;
  let h = repOrig.hembras ?? 0;
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

  if (cantidadActual <= 0) {
    await tx.reproductor.delete({ where: { id: repOrig.id } });
    await aplicarEstadoPiletaPorCantidad(tx, ori, 0);
    return;
  }

  await tx.reproductor.update({
    where: { id: repOrig.id },
    data: {
      machos: m,
      hembras: h,
      ratio: calcularRatio(m, h),
    },
  });

  await aplicarEstadoPiletaPorCantidad(tx, ori, cantidadActual);
}

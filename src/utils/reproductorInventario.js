/**
 * Inventario `@map("reproductores")`: descuentos cuando los organismos egresan de la pileta reproductora.
 * Crea un registro periódico nuevo con el stock restante (mismo criterio que alevinaje / engorda).
 */

import { crearObservacionEgresoInventario } from "./observacion.js";
import { calcularRatioReproductor, pickRepro, toIntRepro } from "./reproductorCampos.js";
import { crearSiembraMovimiento } from "./siembraMovimiento.js";
import { descontarEngordaPorEgresoHaciaEngorda } from "./engordaInventario.js";
import { cantidadVigenteEnPileta } from "./inventarioVigente.js";

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
      desovez: true,
      estado_ciclo: true,
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
    desovez: vigente.desovez ?? 0,
    estado_ciclo: vigente.estado_ciclo ?? "activo",
  };

  await tx.reproductor.create({ data: base });

  await aplicarEstadoPiletaPorCantidad(tx, ori, cantidadActual);
}

const VIGENTE_REPRODUCTOR_SELECT = {
  id: true,
  pileta_id: true,
  fecha_siembra: true,
  lote_genetico: true,
  activo: true,
  machos: true,
  hembras: true,
  cantidad_total: true,
  genetica_machos: true,
  familia_machos: true,
  procedencia_machos: true,
  genetica_hembras: true,
  familia_hembras: true,
  procedencia_hembras: true,
  talla: true,
  cantidad_alimento: true,
  peso: true,
  biometria_id: true,
  siembra_origen_id: true,
  desovez: true,
  estado_ciclo: true,
};

function normalizarEstadoCiclo(value) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  if (v === "agotado") return "agotado";
  if (v === "activo") return "activo";
  return null;
}

/**
 * Tras un evento de cosecha, crea un registro periódico con desovez incrementado.
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {{
 *   reproductorId: number,
 *   estadoCiclo?: string|null,
 *   marcarAgotado?: boolean,
 * }} opciones
 */
export async function registrarDesoveEnInventarioReproductor(tx, opciones = {}) {
  const reproductorId = toInt(opciones.reproductorId);
  if (!reproductorId) return null;

  const vigente = await tx.reproductor.findUnique({
    where: { id: reproductorId },
    select: VIGENTE_REPRODUCTOR_SELECT,
  });
  if (!vigente) {
    const err = new Error("Lote de reproductores no encontrado");
    err.code = "NOT_FOUND";
    throw err;
  }

  const nuevoDesovez = (vigente.desovez ?? 0) + 1;
  let estadoCiclo = vigente.estado_ciclo ?? "activo";
  if (opciones.marcarAgotado === true) {
    estadoCiclo = "agotado";
  } else {
    const parsed = normalizarEstadoCiclo(opciones.estadoCiclo);
    if (parsed) estadoCiclo = parsed;
  }

  const machos = vigente.machos ?? 0;
  const hembras = vigente.hembras ?? 0;

  return tx.reproductor.create({
    data: {
      pileta_id: vigente.pileta_id,
      fecha_siembra: vigente.fecha_siembra,
      lote_genetico: vigente.lote_genetico,
      activo: true,
      machos,
      hembras,
      cantidad_total: vigente.cantidad_total ?? machos + hembras,
      genetica_machos: vigente.genetica_machos,
      familia_machos: vigente.familia_machos,
      procedencia_machos: vigente.procedencia_machos,
      genetica_hembras: vigente.genetica_hembras,
      familia_hembras: vigente.familia_hembras,
      procedencia_hembras: vigente.procedencia_hembras,
      ratio: calcularRatioReproductor(machos, hembras),
      talla: vigente.talla,
      cantidad_alimento: vigente.cantidad_alimento ?? 0,
      peso: vigente.peso ?? null,
      biometria_id: vigente.biometria_id ?? null,
      siembra_origen_id: vigente.siembra_origen_id ?? null,
      desovez: nuevoDesovez,
      estado_ciclo: estadoCiclo,
    },
  });
}

function errValidacion(message) {
  const err = new Error(message);
  err.code = "VALIDACION";
  return err;
}

/**
 * Agrupa cantidades por pileta de engorda cuando la procedencia es interna.
 * @returns {{ movimientosInternos: { piletaOrigenId: number, cantidad: number }[], cantidadExterna: number }}
 */
export function analizarProcedenciaSeleccionInterna(body, campos) {
  const tipoMachos = String(
    pickRepro(body, "fc_tipo_procedencia_machos", "tipo_procedencia_machos") ?? "",
  )
    .trim()
    .toLowerCase();
  const tipoHembras = String(
    pickRepro(body, "fc_tipo_procedencia_hembras", "tipo_procedencia_hembras") ?? "",
  )
    .trim()
    .toLowerCase();
  const piletaMachos = toIntRepro(
    pickRepro(body, "fc_procedencia_machos_pileta_id", "procedencia_machos_pileta_id"),
  );
  const piletaHembras = toIntRepro(
    pickRepro(body, "fc_procedencia_hembras_pileta_id", "procedencia_hembras_pileta_id"),
  );

  const tieneTipos = Boolean(tipoMachos || tipoHembras);
  const movimientosInternos = new Map();
  let cantidadExterna = 0;

  const acumularInterno = (tipo, piletaId, cantidad) => {
    if (tipo !== "interna" || !piletaId || cantidad <= 0) return;
    movimientosInternos.set(piletaId, (movimientosInternos.get(piletaId) || 0) + cantidad);
  };

  const acumularExterno = (tipo, cantidad) => {
    if (tipo === "interna" || cantidad <= 0) return;
    cantidadExterna += cantidad;
  };

  acumularInterno(tipoMachos, piletaMachos, campos.machos ?? 0);
  acumularInterno(tipoHembras, piletaHembras, campos.hembras ?? 0);

  if (tieneTipos) {
    if (tipoMachos === "interna" && (campos.machos ?? 0) > 0 && !piletaMachos) {
      throw errValidacion("Debe seleccionar la pileta de engorda para procedencia interna de machos");
    }
    if (tipoHembras === "interna" && (campos.hembras ?? 0) > 0 && !piletaHembras) {
      throw errValidacion("Debe seleccionar la pileta de engorda para procedencia interna de hembras");
    }
    acumularExterno(tipoMachos, campos.machos ?? 0);
    acumularExterno(tipoHembras, campos.hembras ?? 0);
  }

  return {
    tieneTipos,
    movimientosInternos: [...movimientosInternos.entries()].map(([piletaOrigenId, cantidad]) => ({
      piletaOrigenId,
      cantidad,
    })),
    cantidadExterna,
  };
}

async function assertPiletaEngorda(tx, piletaId, rol) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion(`pileta de ${rol} inválida para selección interna`);

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion(`Pileta de ${rol} no encontrada`);
  if (pil.tipo !== "engorda") {
    throw errValidacion(
      `La pileta de ${rol} '${pil.nombre}' debe ser de engorda para selección interna`,
    );
  }
  return pil;
}

async function assertPiletaReproductores(tx, piletaId) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion("pileta destino inválida");

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion("Pileta destino no encontrada");
  if (pil.tipo !== "reproductores") {
    throw errValidacion(`La pileta destino '${pil.nombre}' debe ser de reproductores`);
  }
  return pil;
}

/**
 * Selección interna: traslado engorda → reproductores con descuento de inventario.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMovimientoEngordaAReproductor(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidad, usuarioId, observacion },
) {
  const origen = toInt(piletaOrigenId);
  const destino = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidad) || 0);
  if (!origen || !destino || cant <= 0) {
    throw errValidacion("Origen, destino y cantidad son obligatorios para selección interna");
  }
  if (origen === destino) {
    throw errValidacion("La pileta de engorda no puede ser la misma pileta de reproductores");
  }

  const pilOr = await assertPiletaEngorda(tx, origen, "origen");
  await assertPiletaReproductores(tx, destino);

  const stock = await cantidadVigenteEnPileta(tx, pilOr.id, "engorda");
  if (cant > stock) {
    throw errValidacion(
      `Stock insuficiente en '${pilOr.nombre}': disponible ${stock}, solicitado ${cant}`,
    );
  }

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: origen,
    piletaDestinoId: destino,
    cantidadEntera: cant,
    usuarioId,
  });
  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de trazabilidad hacia reproductores");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  await descontarEngordaPorEgresoHaciaEngorda(tx, origen, {
    piletaDestinoId: destino,
    cantidad_total: cant,
    siembraOrigenId: siembraId,
    observacion,
    usuarioId,
    procesoObservacion: "reproductor",
  });

  return siembraId;
}

/**
 * Registra uno o más traslados engorda → reproductores según procedencia interna.
 * @returns {Promise<number[]>} ids de siembra creados
 */
export async function registrarSeleccionInternaDesdeEngorda(
  tx,
  { piletaDestinoId, movimientos, usuarioId, observacion },
) {
  const ids = [];
  for (const mov of movimientos ?? []) {
    const id = await registrarMovimientoEngordaAReproductor(tx, {
      piletaOrigenId: mov.piletaOrigenId,
      piletaDestinoId,
      cantidad: mov.cantidad,
      usuarioId,
      observacion,
    });
    ids.push(id);
  }
  return ids;
}

async function assertPiletaIncubacion(tx, piletaId) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion("pileta destino inválida");

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion("Pileta destino no encontrada");
  if (pil.tipo !== "incubacion") {
    throw errValidacion(`La pileta destino '${pil.nombre}' debe ser de incubación`);
  }
  return pil;
}

/**
 * Recepción de cosecha en incubación: registra siembra reproductores → incubación (solo trazabilidad).
 * @returns {Promise<{ siembraId: number, observacionTrazabilidad: string|null }>}
 */
export async function registrarMovimientoReproductorAEficienciaReproductiva(
  tx,
  {
    piletaOrigenId,
    piletaDestinoId,
    cantidad,
    usuarioId,
    observacion,
    fechaMovimiento,
    eventoCodigo,
    loteGenetico,
    huevosMl,
  },
) {
  const origen = toInt(piletaOrigenId);
  const destino = toInt(piletaDestinoId);
  const cant = Math.max(1, Math.floor(Number(cantidad) || 0));
  if (!origen || !destino) {
    throw errValidacion("Origen y destino son obligatorios para incubación");
  }
  if (origen === destino) {
    throw errValidacion("La pileta de reproductores no puede ser la misma pileta de incubación");
  }

  await assertPiletaReproductores(tx, origen);
  await assertPiletaIncubacion(tx, destino);

  const partes = [];
  if (eventoCodigo) partes.push(`Evento: ${eventoCodigo}`);
  if (loteGenetico) partes.push(`Lote: ${loteGenetico}`);
  if (huevosMl != null && Number.isFinite(Number(huevosMl))) {
    partes.push(`${Number(huevosMl)} ml`);
  }
  const obsBase = observacion?.trim?.() ? String(observacion).trim() : "";
  const obsCompleta = [obsBase, ...partes].filter(Boolean).join(" · ") || null;

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: origen,
    piletaDestinoId: destino,
    cantidadEntera: cant,
    usuarioId,
    fechaMovimiento,
  });
  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de trazabilidad hacia incubación");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  return { siembraId, observacionTrazabilidad: obsCompleta };
}

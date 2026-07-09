/**
 * Inventario `@map("reproductores")`: descuentos cuando los organismos egresan de la infraestructuraFisica reproductora.
 * Crea un registro periódico nuevo con el stock restante (mismo criterio que alevinaje / engorda).
 */

import { crearObservacionEgresoInventario } from "./observacion.js";
import { calcularRatioReproductor, pickRepro, toIntRepro } from "./reproductorCampos.js";
import { crearSiembraMovimiento } from "./siembraMovimiento.js";
import { descontarEngordaPorEgresoHaciaEngorda } from "./engordaInventario.js";
import { cantidadVigenteEnInfraestructuraFisica } from "./inventarioVigente.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/** `InfraestructuraFisica.estado`: vacía u ocupada según cantidad declarada en inventario. */
export async function aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, cantidadTotal) {
  const id = toInt(infraestructuraFisicaId);
  if (!id) return;
  const estado = Number(cantidadTotal) > 0 ? "ocupada" : "vacia";
  await tx.infraestructuraFisica.update({
    where: { id },
    data: { estado },
  });
}

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {number|null} infraestructuraFisicaOrigenId
 * @param {{
 *   infraestructuraFisicaDestinoAlevinajeId?: number|null,
 *   infraestructuraFisicaDestinoId?: number|null,
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
export async function descontarReproductorPorEgresoHaciaAlevinaje(tx, infraestructuraFisicaOrigenId, opciones = {}) {
  const ori = toInt(infraestructuraFisicaOrigenId);
  const destinoAlevId = opciones.infraestructuraFisicaDestinoAlevinajeId ?? opciones.infraestructuraFisicaDestinoId ?? null;

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
    where: { infraestructura_fisica_id: ori },
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
        "Cantidad declarada mayor al inventario de reproductores (machos/hembras) en la infraestructura física de origen",
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
      const err = new Error("Cantidad mayor al inventario de reproductores en la infraestructura física de origen");
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
          infraestructuraFisicaId: ori,
          proceso: opciones.procesoObservacion ?? "trazabilidad",
        },
      )
    : null;

  const base = {
    infraestructura_fisica_id: ori,
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

  await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, ori, cantidadActual);
}

const VIGENTE_REPRODUCTOR_SELECT = {
  id: true,
  infraestructura_fisica_id: true,
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
      infraestructura_fisica_id: vigente.infraestructura_fisica_id,
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
 * Agrupa cantidades por infraestructura física de engorda cuando la procedencia es interna.
 * @returns {{ movimientosInternos: { infraestructuraFisicaOrigenId: number, cantidad: number }[], cantidadExterna: number }}
 */
export function analizarProcedenciaSeleccionInterna(body, campos) {
  const tipoMachos = String(
    pickRepro(body, "tipo_procedencia_machos") ?? "",
  )
    .trim()
    .toLowerCase();
  const tipoHembras = String(
    pickRepro(body, "tipo_procedencia_hembras") ?? "",
  )
    .trim()
    .toLowerCase();
  const infraestructuraFisicaMachos = toIntRepro(
    pickRepro(body, "procedencia_machos_infraestructura_fisica_id"),
  );
  const infraestructuraFisicaHembras = toIntRepro(
    pickRepro(body, "procedencia_hembras_infraestructura_fisica_id"),
  );

  const tieneTipos = Boolean(tipoMachos || tipoHembras);
  const movimientosInternos = new Map();
  let cantidadExterna = 0;

  const acumularInterno = (tipo, infraestructuraFisicaId, cantidad) => {
    if (tipo !== "interna" || !infraestructuraFisicaId || cantidad <= 0) return;
    movimientosInternos.set(infraestructuraFisicaId, (movimientosInternos.get(infraestructuraFisicaId) || 0) + cantidad);
  };

  const acumularExterno = (tipo, cantidad) => {
    if (tipo === "interna" || cantidad <= 0) return;
    cantidadExterna += cantidad;
  };

  acumularInterno(tipoMachos, infraestructuraFisicaMachos, campos.machos ?? 0);
  acumularInterno(tipoHembras, infraestructuraFisicaHembras, campos.hembras ?? 0);

  if (tieneTipos) {
    if (tipoMachos === "interna" && (campos.machos ?? 0) > 0 && !infraestructuraFisicaMachos) {
      throw errValidacion("Debe seleccionar la infraestructura física de engorda para procedencia interna de machos");
    }
    if (tipoHembras === "interna" && (campos.hembras ?? 0) > 0 && !infraestructuraFisicaHembras) {
      throw errValidacion("Debe seleccionar la infraestructura física de engorda para procedencia interna de hembras");
    }
    acumularExterno(tipoMachos, campos.machos ?? 0);
    acumularExterno(tipoHembras, campos.hembras ?? 0);
  }

  return {
    tieneTipos,
    movimientosInternos: [...movimientosInternos.entries()].map(([infraestructuraFisicaOrigenId, cantidad]) => ({
      infraestructuraFisicaOrigenId,
      cantidad,
    })),
    cantidadExterna,
  };
}

async function assertInfraestructuraFisicaEngorda(tx, infraestructuraFisicaId, rol) {
  const id = toInt(infraestructuraFisicaId);
  if (!id) throw errValidacion(`infraestructura física de ${rol} inválida para selección interna`);

  const pil = await tx.infraestructuraFisica.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion(`infraestructura física de ${rol} no encontrada`);
  if (pil.tipo !== "engorda") {
    throw errValidacion(
      `La infraestructura física de ${rol} '${pil.nombre}' debe ser de engorda para selección interna`,
    );
  }
  return pil;
}

async function assertInfraestructuraFisicaReproductores(tx, infraestructuraFisicaId) {
  const id = toInt(infraestructuraFisicaId);
  if (!id) throw errValidacion("infraestructura física destino inválida");

  const pil = await tx.infraestructuraFisica.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion("InfraestructuraFisica destino no encontrada");
  if (pil.tipo !== "reproductores") {
    throw errValidacion(`La infraestructuraFisica destino '${pil.nombre}' debe ser de reproductores`);
  }
  return pil;
}

/**
 * Selección interna: traslado engorda → reproductores con descuento de inventario.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMovimientoEngordaAReproductor(
  tx,
  { infraestructuraFisicaOrigenId, infraestructuraFisicaDestinoId, cantidad, usuarioId, observacion },
) {
  const origen = toInt(infraestructuraFisicaOrigenId);
  const destino = toInt(infraestructuraFisicaDestinoId);
  const cant = Math.floor(Number(cantidad) || 0);
  if (!origen || !destino || cant <= 0) {
    throw errValidacion("Origen, destino y cantidad son obligatorios para selección interna");
  }
  if (origen === destino) {
    throw errValidacion("La infraestructura física de engorda no puede ser la misma infraestructura física de reproductores");
  }

  const pilOr = await assertInfraestructuraFisicaEngorda(tx, origen, "origen");
  await assertInfraestructuraFisicaReproductores(tx, destino);

  const stock = await cantidadVigenteEnInfraestructuraFisica(tx, pilOr.id, "engorda");
  if (cant > stock) {
    throw errValidacion(
      `Stock insuficiente en '${pilOr.nombre}': disponible ${stock}, solicitado ${cant}`,
    );
  }

  const siembraId = await crearSiembraMovimiento(tx, {
    infraestructuraFisicaOrigenId: origen,
    infraestructuraFisicaDestinoId: destino,
    cantidadEntera: cant,
    usuarioId,
  });
  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de trazabilidad hacia reproductores");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  await descontarEngordaPorEgresoHaciaEngorda(tx, origen, {
    infraestructuraFisicaDestinoId: destino,
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
  { infraestructuraFisicaDestinoId, movimientos, usuarioId, observacion },
) {
  const ids = [];
  for (const mov of movimientos ?? []) {
    const id = await registrarMovimientoEngordaAReproductor(tx, {
      infraestructuraFisicaOrigenId: mov.infraestructuraFisicaOrigenId,
      infraestructuraFisicaDestinoId,
      cantidad: mov.cantidad,
      usuarioId,
      observacion,
    });
    ids.push(id);
  }
  return ids;
}

async function assertInfraestructuraFisicaIncubacion(tx, infraestructuraFisicaId) {
  const id = toInt(infraestructuraFisicaId);
  if (!id) throw errValidacion("infraestructura física destino inválida");

  const pil = await tx.infraestructuraFisica.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) throw errValidacion("InfraestructuraFisica destino no encontrada");
  if (pil.tipo !== "incubacion") {
    throw errValidacion(`La infraestructuraFisica destino '${pil.nombre}' debe ser de incubación`);
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
    infraestructuraFisicaOrigenId,
    infraestructuraFisicaDestinoId,
    cantidad,
    usuarioId,
    observacion,
    fechaMovimiento,
    eventoCodigo,
    loteGenetico,
    huevosMl,
  },
) {
  const origen = toInt(infraestructuraFisicaOrigenId);
  const destino = toInt(infraestructuraFisicaDestinoId);
  const cant = Math.max(1, Math.floor(Number(cantidad) || 0));
  if (!origen || !destino) {
    throw errValidacion("Origen y destino son obligatorios para incubación");
  }
  if (origen === destino) {
    throw errValidacion("La infraestructura física de reproductores no puede ser la misma infraestructura física de incubación");
  }

  await assertInfraestructuraFisicaReproductores(tx, origen);
  await assertInfraestructuraFisicaIncubacion(tx, destino);

  const partes = [];
  if (eventoCodigo) partes.push(`Evento: ${eventoCodigo}`);
  if (loteGenetico) partes.push(`Lote: ${loteGenetico}`);
  if (huevosMl != null && Number.isFinite(Number(huevosMl))) {
    partes.push(`${Number(huevosMl)} ml`);
  }
  const obsBase = observacion?.trim?.() ? String(observacion).trim() : "";
  const obsCompleta = [obsBase, ...partes].filter(Boolean).join(" · ") || null;

  const siembraId = await crearSiembraMovimiento(tx, {
    infraestructuraFisicaOrigenId: origen,
    infraestructuraFisicaDestinoId: destino,
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

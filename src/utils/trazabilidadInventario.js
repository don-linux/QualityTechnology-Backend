import { crearObservacionSiHay } from "./observacion.js";
import { aplicarEstadoPiletaPorCantidad } from "./reproductorInventario.js";
import { crearSiembraMovimiento, crearSiembraVenta, ETAPAS_TRAZABILIDAD } from "./siembraMovimiento.js";
import { descontarAlevinajePorEgresoHaciaEngorda } from "./alevinajeInventario.js";
import { descontarEngordaPorEgresoHaciaEngorda } from "./engordaInventario.js";
import { cantidadVigenteEnPileta } from "./inventarioVigente.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function errValidacion(message) {
  const err = new Error(message);
  err.code = "VALIDACION";
  return err;
}

/** Parsea `AAAA-MM-DD` para el campo `fecha` de siembra. */
export function parseFechaMovimiento(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;

  const s = String(raw).trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) throw errValidacion("fecha_movimiento inválida (use AAAA-MM-DD)");

  const d = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw errValidacion("fecha_movimiento inválida");

  const finHoy = new Date();
  finHoy.setHours(23, 59, 59, 999);
  if (d > finHoy) throw errValidacion("La fecha del movimiento no puede ser futura");

  return d;
}

async function consultarStockPiletaEtapa(tx, piletaId) {
  const pil = await obtenerPiletaEtapa(tx, piletaId);
  const stock = await cantidadVigenteEnPileta(tx, pil.id, pil.tipo);
  return { pil, stock };
}

function assertStockSuficiente(disponible, requerido, nombrePileta) {
  if (requerido > disponible) {
    throw errValidacion(
      `Stock insuficiente en '${nombrePileta}': disponible ${disponible}, solicitado ${requerido}`,
    );
  }
}

async function obtenerPiletaEtapa(tx, piletaId) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion("pileta_id inválido");

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) {
    const err = new Error("Pileta no existe");
    err.code = "PILETA_NOT_FOUND";
    throw err;
  }
  if (!ETAPAS_TRAZABILIDAD.includes(pil.tipo)) {
    const err = new Error(`La pileta '${pil.nombre}' debe ser tipo alevinaje o engorda`);
    err.code = "PILETA_TIPO_INVALIDO";
    throw err;
  }
  return pil;
}

async function descontarInventarioOrigen(
  tx,
  piletaOrigenId,
  piletaDestinoId,
  cantidad,
  tipoOrigen,
  meta = {},
) {
  const opciones = {
    piletaDestinoId,
    cantidad_total: cantidad,
    siembraOrigenId: meta.siembraOrigenId ?? null,
    observacion: meta.observacion ?? null,
    usuarioId: meta.usuarioId ?? null,
    procesoObservacion: meta.procesoObservacion ?? "trazabilidad",
  };
  if (tipoOrigen === "alevinaje") {
    await descontarAlevinajePorEgresoHaciaEngorda(tx, piletaOrigenId, opciones);
    return;
  }
  await descontarEngordaPorEgresoHaciaEngorda(tx, piletaOrigenId, opciones);
}

async function sumarInventarioDestino(
  tx,
  { piletaDestinoId, tipoDestino, cantidad, siembraOrigenId, usuarioId, observacion },
) {
  const proceso = tipoDestino === "alevinaje" ? "alevinaje" : "engorda";
  const obsId = await crearObservacionSiHay(tx, observacion, usuarioId, {
    piletaId: piletaDestinoId,
    proceso,
  });

  if (tipoDestino === "alevinaje") {
    await tx.alevinaje.create({
      data: {
        pileta_id: piletaDestinoId,
        cantidad_total: cantidad,
        cantidad_alimento: 0,
        observacion_id: obsId,
        siembra_origen_id: siembraOrigenId,
      },
    });
    await aplicarEstadoPiletaPorCantidad(tx, piletaDestinoId, cantidad);
    return;
  }

  await tx.engorda.create({
    data: {
      pileta_id: piletaDestinoId,
      cantidad_total: cantidad,
      cantidad_alimento: 0,
      observacion_id: obsId,
      siembra_origen_id: siembraOrigenId,
    },
  });
  await aplicarEstadoPiletaPorCantidad(tx, piletaDestinoId, cantidad);
}

/**
 * Traslado o ingreso externo: crea siembra y ajusta inventarios en origen/destino.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMovimientoTrazabilidad(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidad, mortalidad = 0, usuarioId, observacion, fechaMovimiento },
) {
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidad) || 0);
  const mort = Math.max(0, Math.floor(Number(mortalidad) || 0));

  if (!dest || cant <= 0) {
    throw errValidacion("pileta_destino_id y cantidad (>0) son obligatorios");
  }
  if (mort >= cant) {
    throw errValidacion("La mortalidad debe ser menor a la cantidad movida");
  }

  const netas = cant - mort;
  const origen =
    piletaOrigenId !== undefined && piletaOrigenId !== null && piletaOrigenId !== ""
      ? toInt(piletaOrigenId)
      : null;

  if (origen !== null && origen === dest) {
    throw errValidacion("Origen y destino no pueden ser la misma pileta");
  }

  const pilDest = await obtenerPiletaEtapa(tx, dest);
  const pilOr = origen !== null ? await obtenerPiletaEtapa(tx, origen) : null;

  if (origen !== null && pilOr) {
    const { stock } = await consultarStockPiletaEtapa(tx, origen);
    assertStockSuficiente(stock, cant, pilOr.nombre);
  }

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: origen,
    piletaDestinoId: dest,
    cantidadEntera: cant,
    usuarioId,
    fechaMovimiento,
  });

  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de siembra");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  if (mort > 0) {
    await tx.siembra.update({
      where: { id: siembraId },
      data: { mortalidad: mort },
    });
  }

  if (origen !== null && pilOr) {
    await descontarInventarioOrigen(tx, origen, dest, cant, pilOr.tipo, {
      siembraOrigenId: siembraId,
      observacion: netas === 0 ? observacion : null,
      usuarioId,
    });
  }

  if (netas > 0) {
    await sumarInventarioDestino(tx, {
      piletaDestinoId: dest,
      tipoDestino: pilDest.tipo,
      cantidad: netas,
      siembraOrigenId: siembraId,
      usuarioId,
      observacion,
    });
  }

  return siembraId;
}

/**
 * Baja por mortalidad en una pileta (sin traslado a destino).
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMortalidadTrazabilidad(
  tx,
  { piletaId, cantidad, usuarioId, observacion, fechaMovimiento },
) {
  const id = toInt(piletaId);
  const cant = Math.floor(Number(cantidad) || 0);
  if (!id || cant <= 0) {
    throw errValidacion("pileta_id y cantidad (>0) son obligatorios para mortalidad");
  }

  const { pil, stock } = await consultarStockPiletaEtapa(tx, id);
  assertStockSuficiente(stock, cant, pil.nombre);

  const data = {
    pileta_origen: id,
    pileta_destino: id,
    cantidad: BigInt(cant),
    mortalidad: cant,
    usuario_id: usuarioId,
  };
  if (fechaMovimiento) data.fecha = fechaMovimiento;

  const siembra = await tx.siembra.create({ data });

  await descontarInventarioOrigen(tx, id, null, cant, pil.tipo, {
    siembraOrigenId: siembra.id,
    observacion,
    usuarioId,
  });

  return siembra.id;
}

/** Tipos de venta que egresan inventario de piletas. */
export const TIPOS_VENTA_TRAZABLES = {
  ALEVINES: "alevinaje",
  ALEVIN: "alevinaje",
  MOJARRA_KG: "engorda",
  KG: "engorda",
};

export function etapaRequeridaParaTipoVenta(tipoVenta) {
  const t = String(tipoVenta ?? "")
    .trim()
    .toUpperCase();
  return TIPOS_VENTA_TRAZABLES[t] ?? null;
}

export function ventaRequiereTrazabilidad(tipoVenta) {
  return etapaRequeridaParaTipoVenta(tipoVenta) !== null;
}

/**
 * Egreso por venta: crea siembra (origen pileta → venta) y descuenta inventario.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarVentaTrazabilidad(
  tx,
  { piletaOrigenId, cantidad, ventaId, usuarioId, observacion, fechaMovimiento, tipoVenta },
) {
  const origen = toInt(piletaOrigenId);
  const cant = Math.floor(Number(cantidad) || 0);
  const venta = toInt(ventaId);
  if (!origen || cant <= 0 || !venta) {
    throw errValidacion("pileta_origen_id, cantidad (>0) y venta_id son obligatorios para venta");
  }

  const etapaEsperada = etapaRequeridaParaTipoVenta(tipoVenta);
  const pilOr = await obtenerPiletaEtapa(tx, origen);
  if (etapaEsperada && pilOr.tipo !== etapaEsperada) {
    throw errValidacion(
      `Para venta tipo '${tipoVenta}' la pileta debe ser de etapa ${etapaEsperada}, no '${pilOr.tipo}'`,
    );
  }

  const { stock } = await consultarStockPiletaEtapa(tx, origen);
  assertStockSuficiente(stock, cant, pilOr.nombre);

  const siembraId = await crearSiembraVenta(tx, {
    piletaOrigenId: origen,
    cantidadEntera: cant,
    ventaId: venta,
    usuarioId,
    fechaMovimiento,
  });

  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de venta en trazabilidad");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  await descontarInventarioOrigen(tx, origen, null, cant, pilOr.tipo, {
    siembraOrigenId: siembraId,
    observacion,
    usuarioId,
    procesoObservacion: "venta",
  });

  return siembraId;
}

/**
 * Crea venta + egreso en trazabilidad a partir de un pedido en lista de espera.
 * @returns {Promise<{ siembraId: number, ventaId: number }>}
 */
export async function registrarVentaDesdeListaEspera(
  tx,
  { listaEsperaId, piletaOrigenId, usuarioId, observacion, fechaMovimiento },
) {
  const listaId = toInt(listaEsperaId);
  if (!listaId) throw errValidacion("lista_espera_id es obligatorio para venta");

  const lista = await tx.listaEspera.findUnique({
    where: { id: listaId },
    include: { pileta_origen: { select: { id: true, nombre: true, tipo: true } } },
  });
  if (!lista) throw errValidacion("Pedido de lista de espera no encontrado");
  if (lista.venta_id) throw errValidacion("Este pedido ya tiene una venta registrada");
  if (!ventaRequiereTrazabilidad(lista.tipo_venta)) {
    throw errValidacion("Este tipo de venta no requiere trazabilidad");
  }

  const origen = toInt(piletaOrigenId) ?? lista.pileta_origen_id;
  if (!origen) {
    throw errValidacion("pileta_origen_id es obligatorio para ventas de alevines o mojarra");
  }

  const cantidad = Math.trunc(Number(lista.cantidad_peces) || 0);
  if (cantidad <= 0) throw errValidacion("El pedido no tiene cantidad válida");

  const precio = Number(lista.precio_unitario) || 0;
  const total = cantidad * precio;

  const venta = await tx.venta.create({
    data: {
      folio: `PE-${lista.id}`,
      fecha: lista.fecha_entrega ?? new Date(),
      cliente_nombre: lista.cliente_nombre,
      tipoVenta: lista.tipo_venta,
      cantidad,
      precio_unitario: precio,
      montoTotal: total,
      monto_abonado: 0,
      estadoPago: "ADEUDO",
      empresa: lista.granja ?? "QUALITY",
      vendedor_nombre: lista.encargado_venta ?? null,
      usuario_id: usuarioId,
    },
  });

  const siembraId = await registrarVentaTrazabilidad(tx, {
    piletaOrigenId: origen,
    cantidad,
    ventaId: venta.id,
    usuarioId,
    tipoVenta: lista.tipo_venta,
    observacion: observacion ?? lista.notas,
    fechaMovimiento: fechaMovimiento ?? lista.fecha_entrega ?? new Date(),
  });

  await tx.listaEspera.update({
    where: { id: lista.id },
    data: { venta_id: venta.id },
  });

  return { siembraId, ventaId: venta.id };
}

/**
 * Cancela una venta trazable: registra un ingreso de devolución en trazabilidad
 * y restaura inventario, sin eliminar el movimiento de venta original.
 * @returns {Promise<number|null>} id del nuevo movimiento de siembra
 */
export async function cancelarVentaTrazabilidad(tx, ventaId, usuarioId) {
  const venta = toInt(ventaId);
  const uid = toInt(usuarioId);
  if (!venta || !uid) return null;

  const ventaRow = await tx.venta.findUnique({
    where: { id: venta },
    select: { id: true, folio: true },
  });
  if (!ventaRow) return null;

  const siembras = await tx.siembra.findMany({
    where: { venta_id: venta },
    select: { id: true, pileta_origen: true, cantidad: true },
    orderBy: { id: "asc" },
  });
  if (siembras.length === 0) return null;

  const observacion = ventaRow.folio
    ? `Cancelación de venta · Folio: ${ventaRow.folio}`
    : "Cancelación de venta";

  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);

  let nuevoMovimientoId = null;
  for (const s of siembras) {
    const origen = s.pileta_origen;
    const cant =
      typeof s.cantidad === "bigint" ? Number(s.cantidad) : Number(s.cantidad ?? 0);
    if (!origen || cant <= 0) continue;

    nuevoMovimientoId = await registrarMovimientoTrazabilidad(tx, {
      piletaOrigenId: null,
      piletaDestinoId: origen,
      cantidad: cant,
      mortalidad: 0,
      usuarioId: uid,
      observacion,
      fechaMovimiento: hoy,
    });
  }

  return nuevoMovimientoId;
}

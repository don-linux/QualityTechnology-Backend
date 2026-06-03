import { crearObservacionSiHay } from "./observacion.js";
import {
  aplicarEstadoPiletaPorCantidad,
  registrarMovimientoReproductorAIncubacion,
} from "./reproductorInventario.js";
import { loteGeneticoDesdeEventoCosecha } from "./incubacionLote.js";

export function calcularDiasEnPileta(fechaIngreso, fechaEgreso) {
  if (!fechaIngreso) return null;
  const inicio = new Date(fechaIngreso);
  const fin = fechaEgreso ? new Date(fechaEgreso) : new Date();
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null;
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Crea incubación vinculada a un evento de cosecha recién registrado (misma transacción).
 */
export async function crearIncubacionDesdeEventoCosecha(
  tx,
  {
    eventoCosecha,
    piletaDestinoId,
    usuarioId,
    fechaIngreso,
    fechaEgreso = null,
    huevosMl = null,
    diasEnPileta = null,
    observacion = null,
    include,
  },
) {
  const pil = await tx.pileta.findUnique({
    where: { id: piletaDestinoId },
    select: { id: true, tipo: true, nombre: true },
  });
  if (!pil) {
    const err = new Error("Pileta de incubación no existe");
    err.code = "VALIDACION";
    throw err;
  }
  if (pil.tipo !== "incubacion") {
    const err = new Error(`La pileta '${pil.nombre}' debe ser tipo incubación`);
    err.code = "VALIDACION";
    throw err;
  }

  const existente = await tx.incubacion.findFirst({
    where: { evento_cosecha_id: eventoCosecha.id },
    select: { id: true },
  });
  if (existente) {
    const err = new Error("El evento de cosecha ya fue recibido en incubación");
    err.code = "EVENTO_YA_RECIBIDO";
    throw err;
  }

  let huevosFinal = huevosMl;
  if (huevosFinal == null && eventoCosecha.volumen_ml != null) {
    huevosFinal = Number(eventoCosecha.volumen_ml);
  }

  let fechaIngresoFinal = fechaIngreso ?? eventoCosecha.fecha_cosecha;
  if (!fechaIngresoFinal) {
    const err = new Error("fecha_ingreso es obligatoria");
    err.code = "VALIDACION";
    throw err;
  }

  const loteFinal = loteGeneticoDesdeEventoCosecha(eventoCosecha);

  const mov = await registrarMovimientoReproductorAIncubacion(tx, {
    piletaOrigenId: eventoCosecha.pileta_id,
    piletaDestinoId: piletaDestinoId,
    cantidad: eventoCosecha.hembras_ovadas,
    usuarioId,
    observacion,
    fechaMovimiento: fechaIngresoFinal,
    eventoCodigo: eventoCosecha.codigo,
    loteGenetico: loteFinal,
    huevosMl: huevosFinal,
  });

  const obsId = await crearObservacionSiHay(tx, observacion, usuarioId, {
    piletaId: piletaDestinoId,
    proceso: "incubacion",
  });

  const diasCalc = calcularDiasEnPileta(fechaIngresoFinal, fechaEgreso);

  const creado = await tx.incubacion.create({
    data: {
      pileta_id: piletaDestinoId,
      lote: loteFinal,
      huevos_ml: huevosFinal,
      fecha_ingreso: fechaIngresoFinal,
      dias_en_pileta: diasEnPileta != null ? diasEnPileta : diasCalc,
      fecha_egreso: fechaEgreso,
      observacion_id: obsId,
      siembra_origen_id: mov.siembraId,
      evento_cosecha_id: eventoCosecha.id,
    },
    include,
  });

  const ocupada = fechaEgreso ? 0 : 1;
  await aplicarEstadoPiletaPorCantidad(tx, piletaDestinoId, ocupada);

  return creado;
}

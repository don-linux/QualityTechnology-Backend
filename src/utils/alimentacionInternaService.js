import { generarTablaAlimentacion } from "./tablaAlimentacionPlantilla.js";
import { cantidadVigenteEnPileta } from "./inventarioVigente.js";
import { serializeBitacoraInsumo } from "./serializers.js";

function parseCantidadKg(texto) {
  if (texto == null || texto === "") return null;
  const s = String(texto).replace(/,/g, ".");
  const match = s.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

async function obtenerUltimoRegistroEtapa(db, piletaId, etapa) {
  if (etapa === "engorda") {
    return db.engorda.findFirst({
      where: { pileta_id: piletaId },
      orderBy: { id: "desc" },
      include: { siembra_origen: true, historial_peso: true },
    });
  }
  return db.alevinaje.findFirst({
    where: { pileta_id: piletaId },
    orderBy: { id: "desc" },
    include: { siembra_origen: true, historial_peso: true },
  });
}

export async function obtenerAlimentacionInterna(db, piletaId, etapa = "engorda") {
  const pid = Number(piletaId);
  if (!Number.isInteger(pid) || pid <= 0) return null;

  const pileta = await db.pileta.findUnique({
    where: { id: pid },
    include: { ubicacion: true },
  });
  if (!pileta) return null;

  const cantidad = await cantidadVigenteEnPileta(db, pid, etapa);
  const ultimo = await obtenerUltimoRegistroEtapa(db, pid, etapa);

  const insumos = await db.insumo.findMany({
    where: { pileta_id: pid, tipo_movimiento: "egreso" },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
    include: { observacion: true },
  });

  const egresosReales = insumos.map((row) => ({
    ...serializeBitacoraInsumo(row),
    cantidad_kg: parseCantidadKg(row.cantidadUdm),
  }));

  const consumoRealKg = egresosReales.reduce((sum, r) => sum + (r.cantidad_kg ?? 0), 0);

  const plan = generarTablaAlimentacion({
    cantidad,
    fechaInicio: ultimo?.siembra_origen?.fecha ?? null,
  });

  return {
    organismo: {
      pileta_id: pid,
      pileta_nombre: pileta.nombre,
      ubicacion: pileta.ubicacion?.nombre ?? null,
      etapa,
      cantidad_total: cantidad,
      peso_gramos:
        ultimo?.historial_peso?.peso != null ? Number(ultimo.historial_peso.peso) : null,
      fecha_inicio: ultimo?.siembra_origen?.fecha ?? null,
    },
    egresos_reales: egresosReales,
    plan_diario: plan.filas,
    kpis: {
      consumo_real_kg: Math.round(consumoRealKg * 1000) / 1000,
      plan_alimento_total_kg: plan.totales.alimento_total_kg,
      factor_escala: plan.factor_escala,
      cantidad_base: plan.cantidad_base,
    },
    totales: plan.totales,
  };
}

export async function obtenerAlimentacionInternaEngorda(db, piletaId) {
  return obtenerAlimentacionInterna(db, piletaId, "engorda");
}

export async function obtenerAlimentacionInternaAlevinaje(db, piletaId) {
  return obtenerAlimentacionInterna(db, piletaId, "alevinaje");
}

import prisma from "../prisma.js";
import {
  serializeCicloAvicola,
  serializeCicloCalendarioEvento,
  serializeCicloGasto,
  serializeCicloVenta,
  serializeCicloBiometria,
  serializeCicloMortalidad,
  serializeCicloAlimentoFase,
  serializeCicloConsumoEstimado,
  serializeCicloSanidad,
} from "../utils/serializers.js";
import {
  calcularBiometriaDerivada,
  calcularDiaCiclo,
  calcularImporteFinal,
  calcularKpisCicloAvicola,
} from "../utils/cicloAvicolaKpis.js";

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDecimal(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const cicloIncludeFull = {
  ubicacion: true,
  calendario: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  gastos: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  ventas: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  biometrias: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  mortalidad: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  alimento_fases: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
  consumo_estimado: { orderBy: [{ semana: "asc" }, { id: "asc" }] },
  sanidad: { orderBy: [{ fecha: "asc" }, { id: "asc" }] },
};

const cicloIncludeList = {
  ubicacion: true,
  gastos: { select: { importe_final: true } },
  ventas: { select: { importe_final: true } },
  biometrias: { orderBy: { fecha: "asc" } },
  mortalidad: { select: { muertes: true, descartes: true } },
  alimento_fases: { select: { kg_consumidos: true } },
  consumo_estimado: { orderBy: { semana: "asc" } },
};

async function findCicloOr404(id) {
  const ciclo = await prisma.cicloAvicola.findUnique({
    where: { id: Number(id) },
    include: cicloIncludeFull,
  });
  if (!ciclo) {
    const err = new Error("Ciclo avícola no encontrado");
    err.status = 404;
    throw err;
  }
  return ciclo;
}

function buildCicloData(body, partial = false) {
  const data = {};
  const idCiclo = pick(body, "id_ciclo");
  const nombreLote = pick(body, "nombre_lote");
  const tipo = pick(body, "tipo");
  const especie = pick(body, "especie");
  const objetivo = pick(body, "objetivo");
  const fechaInicio = pick(body, "fecha_inicio");
  const fechaSalida = pick(body, "fecha_salida_estimada");
  const animales = pick(body, "animales_iniciales");
  const responsable = pick(body, "responsable");
  const estado = pick(body, "estado");
  const observaciones = pick(body, "observaciones");
  const ubicacionId = pick(body, "ubicacion_id");

  if (idCiclo !== undefined || !partial) data.id_ciclo = idCiclo;
  if (nombreLote !== undefined || !partial) data.nombre_lote = nombreLote ?? idCiclo;
  if (tipo !== undefined || !partial) data.tipo = tipo ?? "engorda";
  if (especie !== undefined || !partial) data.especie = especie;
  if (objetivo !== undefined) data.objetivo = objetivo ?? null;
  if (fechaInicio !== undefined || !partial) data.fecha_inicio = parseDate(fechaInicio);
  if (fechaSalida !== undefined) data.fecha_salida_estimada = parseDate(fechaSalida);
  if (animales !== undefined || !partial) data.animales_iniciales = toInt(animales, 0);
  if (responsable !== undefined) data.responsable = responsable ?? null;
  if (estado !== undefined) data.estado = estado ?? "activo";
  if (observaciones !== undefined) data.observaciones = observaciones ?? null;
  if (ubicacionId !== undefined) data.ubicacion_id = ubicacionId ? toInt(ubicacionId) : null;

  return data;
}

function withDiaCiclo(fechaInicio, body) {
  const fecha = parseDate(pick(body, "fecha"));
  const diaExplicito = toInt(pick(body, "dia_ciclo"), null);
  return {
    fecha,
    dia_ciclo: diaExplicito ?? (fecha ? calcularDiaCiclo(fechaInicio, fecha) : null),
  };
}

class CicloAvicolaController {
  static async getAll(req, res) {
    try {
      const tipo = pick(req.query, "tipo");
      const where = tipo ? { tipo } : {};
      const rows = await prisma.cicloAvicola.findMany({
        where,
        include: cicloIncludeList,
        orderBy: { id: "desc" },
      });
      res.json(
        rows.map((row) => {
          const kpis = calcularKpisCicloAvicola(row);
          return serializeCicloAvicola(row, kpis);
        }),
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al listar ciclos avícola" });
    }
  }

  static async getById(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const kpis = calcularKpisCicloAvicola(ciclo);
      res.json(serializeCicloAvicola(ciclo, kpis));
    } catch (err) {
      console.error(err);
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al obtener ciclo avícola" });
    }
  }

  static async create(req, res) {
    try {
      const data = buildCicloData(req.body);
      if (!data.id_ciclo || !data.especie || !data.fecha_inicio) {
        return res.status(400).json({ error: "id_ciclo, especie y fecha_inicio son obligatorios" });
      }
      if ((data.animales_iniciales ?? 0) < 1) {
        return res.status(400).json({ error: "animales_iniciales debe ser mayor a cero" });
      }
      const row = await prisma.cicloAvicola.create({
        data,
        include: cicloIncludeFull,
      });
      const kpis = calcularKpisCicloAvicola(row);
      res.status(201).json(serializeCicloAvicola(row, kpis));
    } catch (err) {
      console.error(err);
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un ciclo con ese id_ciclo" });
      }
      res.status(500).json({ error: "Error al crear ciclo avícola" });
    }
  }

  static async update(req, res) {
    try {
      await findCicloOr404(req.params.id);
      const data = buildCicloData(req.body, true);
      if (data.animales_iniciales !== undefined && data.animales_iniciales < 1) {
        return res.status(400).json({ error: "animales_iniciales debe ser mayor a cero" });
      }
      const row = await prisma.cicloAvicola.update({
        where: { id: Number(req.params.id) },
        data,
        include: cicloIncludeFull,
      });
      const kpis = calcularKpisCicloAvicola(row);
      res.json(serializeCicloAvicola(row, kpis));
    } catch (err) {
      console.error(err);
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar ciclo avícola" });
    }
  }

  static async listCalendario(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.calendario.map(serializeCicloCalendarioEvento));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar calendario" });
    }
  }

  static async createCalendario(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloCalendarioEvento.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha,
          dia_ciclo,
          tipo_evento: pick(req.body, "tipo_evento") ?? "Otro",
          actividad: pick(req.body, "actividad") ?? "",
          producto: pick(req.body, "producto") ?? null,
          dosis: pick(req.body, "dosis") ?? null,
          responsable: pick(req.body, "responsable") ?? null,
          estado_evento: pick(req.body, "estado_evento") ?? "Pendiente",
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloCalendarioEvento(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear evento de calendario" });
    }
  }

  static async updateCalendario(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const existing = await prisma.cicloCalendarioEvento.findFirst({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: ciclo.id },
      });
      if (!existing) return res.status(404).json({ error: "Evento no encontrado" });
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloCalendarioEvento.update({
        where: { id: existing.id },
        data: {
          fecha,
          dia_ciclo,
          tipo_evento: pick(req.body, "tipo_evento"),
          actividad: pick(req.body, "actividad"),
          producto: pick(req.body, "producto"),
          dosis: pick(req.body, "dosis"),
          responsable: pick(req.body, "responsable"),
          estado_evento: pick(req.body, "estado_evento"),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloCalendarioEvento(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar evento de calendario" });
    }
  }

  static async deleteCalendario(req, res) {
    try {
      const deleted = await prisma.cicloCalendarioEvento.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Evento no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar evento de calendario" });
    }
  }

  static async listGastos(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.gastos.map(serializeCicloGasto));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar gastos" });
    }
  }

  static async createGasto(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const cantidad = toDecimal(pick(req.body, "cantidad"), 0);
      const precioUnitario = toDecimal(pick(req.body, "precio_unitario"), 0);
      const importeFinal = calcularImporteFinal(
        cantidad,
        precioUnitario,
        pick(req.body, "importe_final"),
      );
      const row = await prisma.cicloGasto.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha: parseDate(pick(req.body, "fecha")),
          categoria: pick(req.body, "categoria") ?? "Otros",
          cantidad,
          unidad: pick(req.body, "unidad") ?? "unidad",
          descripcion: pick(req.body, "descripcion") ?? null,
          proveedor: pick(req.body, "proveedor") ?? null,
          precio_unitario: precioUnitario,
          importe_final: importeFinal,
          metodo_pago: pick(req.body, "metodo_pago") ?? null,
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloGasto(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear gasto" });
    }
  }

  static async updateGasto(req, res) {
    try {
      const cantidad = toDecimal(pick(req.body, "cantidad"));
      const precioUnitario = toDecimal(pick(req.body, "precio_unitario"));
      const importeFinal =
        pick(req.body, "importe_final") !== undefined
          ? calcularImporteFinal(cantidad, precioUnitario, pick(req.body, "importe_final"))
          : undefined;
      const row = await prisma.cicloGasto.update({
        where: { id: Number(req.params.itemId) },
        data: {
          fecha: parseDate(pick(req.body, "fecha")),
          categoria: pick(req.body, "categoria"),
          cantidad,
          unidad: pick(req.body, "unidad"),
          descripcion: pick(req.body, "descripcion"),
          proveedor: pick(req.body, "proveedor"),
          precio_unitario: precioUnitario,
          importe_final: importeFinal,
          metodo_pago: pick(req.body, "metodo_pago"),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloGasto(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar gasto" });
    }
  }

  static async deleteGasto(req, res) {
    try {
      const deleted = await prisma.cicloGasto.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Gasto no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar gasto" });
    }
  }

  static async listVentas(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.ventas.map(serializeCicloVenta));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar ventas" });
    }
  }

  static async createVenta(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const cantidad = toDecimal(pick(req.body, "cantidad"), 0);
      const precioUnitario = toDecimal(pick(req.body, "precio_unitario"), 0);
      const importeFinal = calcularImporteFinal(
        cantidad,
        precioUnitario,
        pick(req.body, "importe_final"),
      );
      const row = await prisma.cicloVenta.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha: parseDate(pick(req.body, "fecha")),
          producto: pick(req.body, "producto") ?? "",
          cantidad,
          unidad: pick(req.body, "unidad") ?? "unidad",
          cliente: pick(req.body, "cliente") ?? null,
          precio_unitario: precioUnitario,
          importe_final: importeFinal,
          estado_pago: pick(req.body, "estado_pago") ?? null,
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloVenta(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear venta" });
    }
  }

  static async updateVenta(req, res) {
    try {
      const cantidad = toDecimal(pick(req.body, "cantidad"));
      const precioUnitario = toDecimal(pick(req.body, "precio_unitario"));
      const importeFinal =
        pick(req.body, "importe_final") !== undefined
          ? calcularImporteFinal(cantidad, precioUnitario, pick(req.body, "importe_final"))
          : undefined;
      const row = await prisma.cicloVenta.update({
        where: { id: Number(req.params.itemId) },
        data: {
          fecha: parseDate(pick(req.body, "fecha")),
          producto: pick(req.body, "producto"),
          cantidad,
          unidad: pick(req.body, "unidad"),
          cliente: pick(req.body, "cliente"),
          precio_unitario: precioUnitario,
          importe_final: importeFinal,
          estado_pago: pick(req.body, "estado_pago"),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloVenta(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar venta" });
    }
  }

  static async deleteVenta(req, res) {
    try {
      const deleted = await prisma.cicloVenta.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Venta no encontrada" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar venta" });
    }
  }

  static async listBiometrias(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.biometrias.map(serializeCicloBiometria));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar biometrías" });
    }
  }

  static async createBiometria(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const derivada = await calcularBiometriaDerivada(prisma, ciclo.id, ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloBiometria.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha: parseDate(pick(req.body, "fecha")),
          dia_ciclo: derivada.dia_ciclo,
          animales_pesados: toInt(pick(req.body, "animales_pesados")),
          peso_promedio_g: toDecimal(pick(req.body, "peso_promedio_g"), 0),
          peso_promedio_kg: derivada.peso_promedio_kg,
          indice_crecimiento_g_dia: derivada.indice_crecimiento_g_dia,
          dias_transcurridos: derivada.dias_transcurridos,
          ganancia_ultima_g: derivada.ganancia_ultima_g,
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloBiometria(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear biometría" });
    }
  }

  static async updateBiometria(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const existing = await prisma.cicloBiometria.findFirst({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: ciclo.id },
      });
      if (!existing) return res.status(404).json({ error: "Biometría no encontrada" });
      const derivada = await calcularBiometriaDerivada(prisma, ciclo.id, ciclo.fecha_inicio, {
        ...req.body,
        id: req.params.itemId,
      });
      const row = await prisma.cicloBiometria.update({
        where: { id: existing.id },
        data: {
          fecha: parseDate(pick(req.body, "fecha")),
          dia_ciclo: derivada.dia_ciclo,
          animales_pesados: toInt(pick(req.body, "animales_pesados")),
          peso_promedio_g: toDecimal(pick(req.body, "peso_promedio_g")),
          peso_promedio_kg: derivada.peso_promedio_kg,
          indice_crecimiento_g_dia: derivada.indice_crecimiento_g_dia,
          dias_transcurridos: derivada.dias_transcurridos,
          ganancia_ultima_g: derivada.ganancia_ultima_g,
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloBiometria(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar biometría" });
    }
  }

  static async deleteBiometria(req, res) {
    try {
      const deleted = await prisma.cicloBiometria.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Biometría no encontrada" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar biometría" });
    }
  }

  static async listMortalidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.mortalidad.map(serializeCicloMortalidad));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar mortalidad" });
    }
  }

  static async createMortalidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloMortalidad.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha,
          dia_ciclo,
          muertes: toInt(pick(req.body, "muertes"), 0),
          descartes: toInt(pick(req.body, "descartes"), 0),
          causa: pick(req.body, "causa") ?? null,
          accion_correctiva: pick(req.body, "accion_correctiva") ?? null,
          responsable: pick(req.body, "responsable") ?? null,
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloMortalidad(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear mortalidad" });
    }
  }

  static async updateMortalidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloMortalidad.update({
        where: { id: Number(req.params.itemId) },
        data: {
          fecha,
          dia_ciclo,
          muertes: toInt(pick(req.body, "muertes")),
          descartes: toInt(pick(req.body, "descartes")),
          causa: pick(req.body, "causa"),
          accion_correctiva: pick(req.body, "accion_correctiva"),
          responsable: pick(req.body, "responsable"),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloMortalidad(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar mortalidad" });
    }
  }

  static async deleteMortalidad(req, res) {
    try {
      const deleted = await prisma.cicloMortalidad.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Registro no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar mortalidad" });
    }
  }

  static async listAlimento(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.alimento_fases.map(serializeCicloAlimentoFase));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar alimento" });
    }
  }

  static async createAlimento(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloAlimentoFase.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha,
          dia_ciclo,
          fase_alimento: pick(req.body, "fase_alimento") ?? null,
          producto: pick(req.body, "producto") ?? null,
          kg_ingreso: toDecimal(pick(req.body, "kg_ingreso")),
          kg_consumidos: toDecimal(pick(req.body, "kg_consumidos")),
          existencia_final: toDecimal(pick(req.body, "existencia_final")),
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloAlimentoFase(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear registro de alimento" });
    }
  }

  static async updateAlimento(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloAlimentoFase.update({
        where: { id: Number(req.params.itemId) },
        data: {
          fecha,
          dia_ciclo,
          fase_alimento: pick(req.body, "fase_alimento"),
          producto: pick(req.body, "producto"),
          kg_ingreso: toDecimal(pick(req.body, "kg_ingreso")),
          kg_consumidos: toDecimal(pick(req.body, "kg_consumidos")),
          existencia_final: toDecimal(pick(req.body, "existencia_final")),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloAlimentoFase(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar registro de alimento" });
    }
  }

  static async deleteAlimento(req, res) {
    try {
      const deleted = await prisma.cicloAlimentoFase.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Registro no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar registro de alimento" });
    }
  }

  static async listConsumoEstimado(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.consumo_estimado.map(serializeCicloConsumoEstimado));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar consumo estimado" });
    }
  }

  static async createConsumoEstimado(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const row = await prisma.cicloConsumoEstimado.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          semana: toInt(pick(req.body, "semana"), 0),
          rango_dias: pick(req.body, "rango_dias") ?? null,
          fase_alimento: pick(req.body, "fase_alimento") ?? null,
          producto: pick(req.body, "producto") ?? null,
          kg_ingreso: toDecimal(pick(req.body, "kg_ingreso")),
          consumo_individual: toDecimal(pick(req.body, "consumo_individual")),
          consumo_conjunto: toDecimal(pick(req.body, "consumo_conjunto")),
          consumo_acumulado: toDecimal(pick(req.body, "consumo_acumulado")),
          gdp: toDecimal(pick(req.body, "gdp")),
          conversion: toDecimal(pick(req.body, "conversion")),
          mortalidad_semanal: toDecimal(pick(req.body, "mortalidad_semanal")),
          mortalidad_acumulada: toDecimal(pick(req.body, "mortalidad_acumulada")),
        },
      });
      res.status(201).json(serializeCicloConsumoEstimado(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear consumo estimado" });
    }
  }

  static async updateConsumoEstimado(req, res) {
    try {
      const row = await prisma.cicloConsumoEstimado.update({
        where: { id: Number(req.params.itemId) },
        data: {
          semana: toInt(pick(req.body, "semana")),
          rango_dias: pick(req.body, "rango_dias"),
          fase_alimento: pick(req.body, "fase_alimento"),
          producto: pick(req.body, "producto"),
          kg_ingreso: toDecimal(pick(req.body, "kg_ingreso")),
          consumo_individual: toDecimal(pick(req.body, "consumo_individual")),
          consumo_conjunto: toDecimal(pick(req.body, "consumo_conjunto")),
          consumo_acumulado: toDecimal(pick(req.body, "consumo_acumulado")),
          gdp: toDecimal(pick(req.body, "gdp")),
          conversion: toDecimal(pick(req.body, "conversion")),
          mortalidad_semanal: toDecimal(pick(req.body, "mortalidad_semanal")),
          mortalidad_acumulada: toDecimal(pick(req.body, "mortalidad_acumulada")),
        },
      });
      res.json(serializeCicloConsumoEstimado(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar consumo estimado" });
    }
  }

  static async deleteConsumoEstimado(req, res) {
    try {
      const deleted = await prisma.cicloConsumoEstimado.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Registro no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar consumo estimado" });
    }
  }

  static async listSanidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      res.json(ciclo.sanidad.map(serializeCicloSanidad));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al listar sanidad" });
    }
  }

  static async createSanidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloSanidad.create({
        data: {
          ciclo_avicola_id: ciclo.id,
          fecha,
          dia_ciclo,
          tipo: pick(req.body, "tipo") ?? "Otro",
          producto: pick(req.body, "producto") ?? null,
          dosis: pick(req.body, "dosis") ?? null,
          via: pick(req.body, "via") ?? null,
          responsable: pick(req.body, "responsable") ?? null,
          observaciones: pick(req.body, "observaciones") ?? null,
        },
      });
      res.status(201).json(serializeCicloSanidad(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al crear registro de sanidad" });
    }
  }

  static async updateSanidad(req, res) {
    try {
      const ciclo = await findCicloOr404(req.params.id);
      const { fecha, dia_ciclo } = withDiaCiclo(ciclo.fecha_inicio, req.body);
      const row = await prisma.cicloSanidad.update({
        where: { id: Number(req.params.itemId) },
        data: {
          fecha,
          dia_ciclo,
          tipo: pick(req.body, "tipo"),
          producto: pick(req.body, "producto"),
          dosis: pick(req.body, "dosis"),
          via: pick(req.body, "via"),
          responsable: pick(req.body, "responsable"),
          observaciones: pick(req.body, "observaciones"),
        },
      });
      res.json(serializeCicloSanidad(row));
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al actualizar registro de sanidad" });
    }
  }

  static async deleteSanidad(req, res) {
    try {
      const deleted = await prisma.cicloSanidad.deleteMany({
        where: { id: Number(req.params.itemId), ciclo_avicola_id: Number(req.params.id) },
      });
      if (!deleted.count) return res.status(404).json({ error: "Registro no encontrado" });
      res.status(204).send();
    } catch (err) {
      res.status(err.status ?? 500).json({ error: err.message ?? "Error al eliminar registro de sanidad" });
    }
  }
}

export default CicloAvicolaController;

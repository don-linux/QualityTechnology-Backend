import prisma from "../prisma.js";
import { serializeVacacion } from "../utils/serializers.js";

// El schema actual de Vacacion solo conserva empleadoId, fecha_inicio,
// fecha_fin, dias_tomados, tipo, estatus y observaciones. Los campos
// extendidos del API previo (departamento, vacaciones_v, enfermedad_e,
// asistencia, etc.) ya no existen y se ignoran si vienen en el body.

function pick(body, ...keys) {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function toInt(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toDateOrNull(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`);
}

function parseBody(body) {
  return {
    empleadoId: pick(body, "empleado_id", "fi_empleado_id"),
    fechaInicio: pick(body, "fecha_inicio", "inicio_periodo", "fd_inicio_periodo"),
    fechaFin: pick(body, "fecha_fin", "fin_periodo", "fd_fin_periodo"),
    diasTomados: pick(body, "dias_tomados", "fn_dias_tomados", "vacaciones_disfrutadas", "fn_vacaciones_disfrutadas"),
    tipo: pick(body, "tipo", "fc_tipo"),
    estatus: pick(body, "estatus", "fc_estatus"),
    observaciones: pick(body, "observaciones", "fc_observaciones"),
  };
}

class VacacionController {
  static async getAll(req, res) {
    try {
      const vacaciones = await prisma.vacacion.findMany({
        orderBy: { fecha_inicio: "desc" },
      });
      res.json(vacaciones.map(serializeVacacion));
    } catch (err) {
      console.error("Error al obtener vacaciones:", err);
      res.status(500).json({ error: "Error al obtener vacaciones" });
    }
  }

  static async create(req, res) {
    const data = parseBody(req.body);

    if (!data.empleadoId) {
      return res.status(400).json({ error: "empleado_id es obligatorio" });
    }
    if (!data.fechaInicio || !data.fechaFin) {
      return res.status(400).json({ error: "fecha_inicio y fecha_fin son obligatorios" });
    }

    try {
      const vacacion = await prisma.vacacion.create({
        data: {
          empleadoId: Number(data.empleadoId),
          fecha_inicio: toDateOrNull(data.fechaInicio),
          fecha_fin: toDateOrNull(data.fechaFin),
          dias_tomados: toInt(data.diasTomados),
          ...(data.tipo ? { tipo: String(data.tipo) } : {}),
          ...(data.estatus ? { estatus: String(data.estatus) } : {}),
          ...(data.observaciones !== undefined ? { observaciones: data.observaciones || null } : {}),
        },
      });
      res.status(201).json(serializeVacacion(vacacion));
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Empleado invalido" });
      }
      console.error("Error al crear registro:", err);
      res.status(500).json({ error: "Error al crear registro" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = parseBody(req.body);

    const updateData = {};
    if (data.empleadoId !== undefined) updateData.empleadoId = Number(data.empleadoId);
    if (data.fechaInicio !== undefined) updateData.fecha_inicio = toDateOrNull(data.fechaInicio);
    if (data.fechaFin !== undefined) updateData.fecha_fin = toDateOrNull(data.fechaFin);
    if (data.diasTomados !== undefined) updateData.dias_tomados = toInt(data.diasTomados);
    if (data.tipo !== undefined) updateData.tipo = String(data.tipo);
    if (data.estatus !== undefined) updateData.estatus = String(data.estatus);
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }

    try {
      const vacacion = await prisma.vacacion.update({
        where: { id: Number(id) },
        data: updateData,
      });
      res.json(serializeVacacion(vacacion));
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro de vacaciones no encontrado" });
      }
      console.error("Error al actualizar vacaciones:", err);
      res.status(500).json({ error: "Error al actualizar registro" });
    }
  }

}

export default VacacionController;

import prisma from "../prisma.js";
import { serializeVacacion } from "../utils/serializers.js";

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
    nombreEmpleado: pick(body, "nombre_empleado", "fc_nombre_empleado"),
    empleadoId: pick(body, "empleado_id", "fi_empleado_id"),
    departamento: pick(body, "departamento", "fc_departamento"),
    inicioPeriodo: pick(body, "inicio_periodo", "fd_inicio_periodo"),
    finPeriodo: pick(body, "fin_periodo", "fd_fin_periodo"),
    diasTrabajados: pick(body, "dias_trabajados", "fn_dias_trabajados"),
    vacacionesV: pick(body, "vacaciones_v", "fn_vacaciones_v"),
    enfermedadE: pick(body, "enfermedad_e", "fn_enfermedad_e"),
    maternidadM: pick(body, "maternidad_m", "fn_maternidad_m"),
    permisoParcialPp: pick(body, "permiso_parcial_pp", "fn_permiso_parcial_pp"),
    permisoTotalPt: pick(body, "permiso_total_pt", "fn_permiso_total_pt"),
    inasistenciasI: pick(body, "inasistencias_i", "fn_inasistencias_i"),
    vacacionesAnio: pick(body, "vacaciones_anio", "fn_vacaciones_anio"),
    diasPrevios: pick(body, "dias_previos", "fn_dias_previos"),
    vacacionesDisponibles: pick(body, "vacaciones_disponibles", "fn_vacaciones_disponibles"),
    vacacionesDisfrutadas: pick(body, "vacaciones_disfrutadas", "fn_vacaciones_disfrutadas"),
    asistencia: pick(body, "asistencia", "fc_asistencia"),
  };
}

class VacacionController {
  static async getAll(req, res) {
    try {
      const vacaciones = await prisma.vacacion.findMany({
        orderBy: { nombreEmpleado: "asc" },
      });
      res.json(vacaciones.map(serializeVacacion));
    } catch (err) {
      console.error("Error al obtener vacaciones:", err);
      res.status(500).json({ error: "Error al obtener vacaciones" });
    }
  }

  static async create(req, res) {
    const data = parseBody(req.body);

    if (!data.nombreEmpleado) {
      return res.status(400).json({ error: "nombre_empleado es obligatorio" });
    }
    if (!data.inicioPeriodo || !data.finPeriodo) {
      return res.status(400).json({ error: "inicio_periodo y fin_periodo son obligatorios" });
    }

    try {
      const vacacion = await prisma.vacacion.create({
        data: {
          nombreEmpleado: data.nombreEmpleado,
          ...(data.empleadoId ? { empleadoId: Number(data.empleadoId) } : {}),
          departamento: data.departamento ?? null,
          inicioPeriodo: toDateOrNull(data.inicioPeriodo),
          finPeriodo: toDateOrNull(data.finPeriodo),
          diasTrabajados: toInt(data.diasTrabajados),
          vacacionesV: toInt(data.vacacionesV),
          enfermedadE: toInt(data.enfermedadE),
          maternidadM: toInt(data.maternidadM),
          permisoParcialPp: toInt(data.permisoParcialPp),
          permisoTotalPt: toInt(data.permisoTotalPt),
          inasistenciasI: toInt(data.inasistenciasI),
          vacacionesAnio: toInt(data.vacacionesAnio),
          diasPrevios: toInt(data.diasPrevios),
          vacacionesDisponibles: toInt(data.vacacionesDisponibles),
          vacacionesDisfrutadas: toInt(data.vacacionesDisfrutadas),
          ...(data.asistencia ? { asistencia: data.asistencia } : {}),
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
    if (data.nombreEmpleado !== undefined) updateData.nombreEmpleado = data.nombreEmpleado;
    if (data.empleadoId !== undefined) updateData.empleadoId = data.empleadoId ? Number(data.empleadoId) : null;
    if (data.departamento !== undefined) updateData.departamento = data.departamento ?? null;
    if (data.inicioPeriodo !== undefined) updateData.inicioPeriodo = toDateOrNull(data.inicioPeriodo);
    if (data.finPeriodo !== undefined) updateData.finPeriodo = toDateOrNull(data.finPeriodo);
    if (data.diasTrabajados !== undefined) updateData.diasTrabajados = toInt(data.diasTrabajados);
    if (data.vacacionesV !== undefined) updateData.vacacionesV = toInt(data.vacacionesV);
    if (data.enfermedadE !== undefined) updateData.enfermedadE = toInt(data.enfermedadE);
    if (data.maternidadM !== undefined) updateData.maternidadM = toInt(data.maternidadM);
    if (data.permisoParcialPp !== undefined) updateData.permisoParcialPp = toInt(data.permisoParcialPp);
    if (data.permisoTotalPt !== undefined) updateData.permisoTotalPt = toInt(data.permisoTotalPt);
    if (data.inasistenciasI !== undefined) updateData.inasistenciasI = toInt(data.inasistenciasI);
    if (data.vacacionesAnio !== undefined) updateData.vacacionesAnio = toInt(data.vacacionesAnio);
    if (data.diasPrevios !== undefined) updateData.diasPrevios = toInt(data.diasPrevios);
    if (data.vacacionesDisponibles !== undefined) updateData.vacacionesDisponibles = toInt(data.vacacionesDisponibles);
    if (data.vacacionesDisfrutadas !== undefined) updateData.vacacionesDisfrutadas = toInt(data.vacacionesDisfrutadas);
    if (data.asistencia !== undefined) updateData.asistencia = data.asistencia;

    try {
      const vacacion = await prisma.vacacion.update({
        where: { vacacionId: Number(id) },
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

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.vacacion.delete({ where: { vacacionId: Number(id) } });
      res.json({ mensaje: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro de vacaciones no encontrado" });
      }
      console.error("Error al eliminar registro:", err);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.vacacion.deleteMany({});
      res.json({ mensaje: "Todos los registros de vacaciones fueron eliminados" });
    } catch (err) {
      console.error("Error al eliminar todos los registros:", err);
      res.status(500).json({ error: "Error al eliminar todos los registros" });
    }
  }
}

export default VacacionController;

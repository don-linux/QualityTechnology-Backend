import prisma from "../prisma.js";
import { serializeNomina } from "../utils/serializers.js";

function pick(body, ...keys) {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function toDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  return Number(value);
}

function parseNominaBody(body) {
  return {
    nombreEmpleado: pick(body, "nombre_empleado", "fc_nombre_empleado"),
    empleadoId: pick(body, "empleado_id", "fi_empleado_id"),
    fechaPago: pick(body, "fecha_pago", "fd_fecha_pago"),
    total: pick(body, "total", "fn_total"),
    bono: pick(body, "bono", "fn_bono"),
    deuda: pick(body, "deuda", "fn_deuda"),
    descuento: pick(body, "descuento", "fn_descuento"),
    anticipo: pick(body, "anticipo", "fn_anticipo"),
    usuarioId: pick(body, "usuario_id", "fi_usuario_id"),
  };
}

class NominaController {
  static async getAll(req, res) {
    try {
      const where = {};
      if (req.query.nombre) {
        where.nombreEmpleado = { contains: String(req.query.nombre), mode: "insensitive" };
      }
      if (req.query.fecha) {
        where.fechaPago = new Date(`${req.query.fecha}T00:00:00Z`);
      }

      const nominas = await prisma.nomina.findMany({
        where,
        orderBy: [{ fechaPago: "desc" }, { nombreEmpleado: "asc" }],
      });
      res.json(nominas.map(serializeNomina));
    } catch (err) {
      console.error("Error al obtener nominas:", err);
      res.status(500).json({ error: "Error al obtener nominas" });
    }
  }

  static async create(req, res) {
    const data = parseNominaBody(req.body);
    if (!data.nombreEmpleado) {
      return res.status(400).json({ error: "nombre_empleado es obligatorio" });
    }
    try {
      const nomina = await prisma.nomina.create({
        data: {
          nombreEmpleado: data.nombreEmpleado,
          ...(data.empleadoId ? { empleadoId: Number(data.empleadoId) } : {}),
          ...(data.fechaPago ? { fechaPago: new Date(`${data.fechaPago}T00:00:00Z`) } : {}),
          total: toDecimal(data.total),
          bono: toDecimal(data.bono),
          deuda: toDecimal(data.deuda),
          descuento: toDecimal(data.descuento),
          anticipo: toDecimal(data.anticipo),
          ...(data.usuarioId ? { usuarioId: Number(data.usuarioId) } : {}),
        },
      });
      res.status(201).json(serializeNomina(nomina));
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Empleado o usuario invalido" });
      }
      console.error("Error al registrar nomina:", err);
      res.status(500).json({ error: "Error al registrar nomina" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = parseNominaBody(req.body);

    const updateData = {};
    if (data.nombreEmpleado !== undefined) updateData.nombreEmpleado = data.nombreEmpleado;
    if (data.empleadoId !== undefined) updateData.empleadoId = data.empleadoId ? Number(data.empleadoId) : null;
    if (data.fechaPago !== undefined) updateData.fechaPago = new Date(`${data.fechaPago}T00:00:00Z`);
    if (data.total !== undefined) updateData.total = toDecimal(data.total);
    if (data.bono !== undefined) updateData.bono = toDecimal(data.bono);
    if (data.deuda !== undefined) updateData.deuda = toDecimal(data.deuda);
    if (data.descuento !== undefined) updateData.descuento = toDecimal(data.descuento);
    if (data.anticipo !== undefined) updateData.anticipo = toDecimal(data.anticipo);
    if (data.usuarioId !== undefined) updateData.usuarioId = data.usuarioId ? Number(data.usuarioId) : null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }

    try {
      const nomina = await prisma.nomina.update({
        where: { nominaId: Number(id) },
        data: updateData,
      });
      res.json(serializeNomina(nomina));
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Nomina no encontrada" });
      }
      console.error("Error al actualizar nomina:", err);
      res.status(500).json({ error: "Error al actualizar nomina" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.nomina.delete({ where: { nominaId: Number(id) } });
      res.json({ mensaje: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Nomina no encontrada" });
      }
      console.error("Error al eliminar nomina:", err);
      res.status(500).json({ error: "Error al eliminar nomina" });
    }
  }
}

export default NominaController;

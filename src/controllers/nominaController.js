import prisma from "../prisma.js";
import { serializeNomina } from "../utils/serializers.js";

// El schema actual de Nomina conserva: empleadoId, periodo, sueldo_bruto,
// descuentos, sueldo_neto, fechaPago, observaciones. Los campos extendidos
// del API anterior (bono, deuda, anticipo, nombre_empleado, usuario_id) ya
// no existen; se aceptan en el body pero solo `descuento` se mapea a
// `descuentos` y `total` a `sueldo_neto`.

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
    empleadoId: pick(body, "empleado_id", "fi_empleado_id"),
    periodo: pick(body, "periodo", "fc_periodo"),
    sueldoBruto: pick(body, "sueldo_bruto", "fn_sueldo_bruto"),
    descuentos: pick(body, "descuentos", "descuento", "fn_descuento"),
    sueldoNeto: pick(body, "sueldo_neto", "total", "fn_total"),
    fechaPago: pick(body, "fecha_pago", "fd_fecha_pago"),
    observaciones: pick(body, "observaciones", "fc_observaciones"),
  };
}

const nominaInclude = { empleado: true };

class NominaController {
  static async getAll(req, res) {
    try {
      const where = {};
      if (req.query.nombre) {
        where.empleado = {
          OR: [
            { nombre: { contains: String(req.query.nombre), mode: "insensitive" } },
            { apellidoPaterno: { contains: String(req.query.nombre), mode: "insensitive" } },
          ],
        };
      }
      if (req.query.fecha) {
        where.fechaPago = new Date(`${req.query.fecha}T00:00:00Z`);
      }

      const nominas = await prisma.nomina.findMany({
        where,
        include: nominaInclude,
        orderBy: [{ fechaPago: "desc" }, { id: "desc" }],
      });
      res.json(nominas.map(serializeNomina));
    } catch (err) {
      console.error("Error al obtener nominas:", err);
      res.status(500).json({ error: "Error al obtener nominas" });
    }
  }

  static async create(req, res) {
    const data = parseNominaBody(req.body);
    if (!data.empleadoId) {
      return res.status(400).json({ error: "empleado_id es obligatorio" });
    }
    if (!data.periodo) {
      return res.status(400).json({ error: "periodo es obligatorio" });
    }
    if (!data.fechaPago) {
      return res.status(400).json({ error: "fecha_pago es obligatorio" });
    }

    try {
      const nomina = await prisma.nomina.create({
        data: {
          empleadoId: Number(data.empleadoId),
          periodo: String(data.periodo),
          sueldo_bruto: toDecimal(data.sueldoBruto),
          descuentos: toDecimal(data.descuentos),
          sueldo_neto: toDecimal(data.sueldoNeto),
          fechaPago: new Date(`${data.fechaPago}T00:00:00Z`),
          ...(data.observaciones !== undefined ? { observaciones: data.observaciones || null } : {}),
        },
        include: nominaInclude,
      });
      res.status(201).json(serializeNomina(nomina));
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Empleado invalido" });
      }
      console.error("Error al registrar nomina:", err);
      res.status(500).json({ error: "Error al registrar nomina" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = parseNominaBody(req.body);

    const updateData = {};
    if (data.empleadoId !== undefined) updateData.empleadoId = Number(data.empleadoId);
    if (data.periodo !== undefined) updateData.periodo = String(data.periodo);
    if (data.sueldoBruto !== undefined) updateData.sueldo_bruto = toDecimal(data.sueldoBruto);
    if (data.descuentos !== undefined) updateData.descuentos = toDecimal(data.descuentos);
    if (data.sueldoNeto !== undefined) updateData.sueldo_neto = toDecimal(data.sueldoNeto);
    if (data.fechaPago !== undefined) updateData.fechaPago = new Date(`${data.fechaPago}T00:00:00Z`);
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones || null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }

    try {
      const nomina = await prisma.nomina.update({
        where: { id: Number(id) },
        data: updateData,
        include: nominaInclude,
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
      await prisma.nomina.delete({ where: { id: Number(id) } });
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

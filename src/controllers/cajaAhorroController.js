import prisma from "../prisma.js";
import { serializeCajaAhorroResumen } from "../utils/serializers.js";
import { resolverUbicacion } from "../utils/ubicacion.js";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function toDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

class CajaAhorroController {
  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) {
        return res.status(404).json({ error: "Granja/ubicacion no encontrada" });
      }
      const registros = await prisma.cajaAhorroResumen.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { ubicacion: true },
        orderBy: { cajaAhorroId: "asc" },
      });
      res.json(registros.map(serializeCajaAhorroResumen));
    } catch (err) {
      console.error("Error al obtener registros:", err);
      res.status(500).json({ error: "Error al obtener registros" });
    }
  }

  static async create(req, res) {
    try {
      const { categoria } = req.body;
      const granjaInput = req.body.granja ?? req.body.ubicacion_id ?? req.body.fc_granja;
      if (!categoria || !String(categoria).trim()) {
        return res.status(400).json({ error: "categoria es obligatoria" });
      }
      const ubicacion = await resolverUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida o no encontrada" });
      }
      const registro = await prisma.cajaAhorroResumen.create({
        data: {
          categoria: String(categoria).trim(),
          ubicacionId: ubicacion.ubicacionId,
        },
        include: { ubicacion: true },
      });
      res.status(201).json(serializeCajaAhorroResumen(registro));
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe esa categoria para la ubicacion" });
      }
      console.error("Error al crear categoria:", err);
      res.status(500).json({ error: "Error al crear categoria" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    try {
      const updateData = {};
      if (req.body.categoria !== undefined) updateData.categoria = String(req.body.categoria);
      if (req.body.fc_categoria !== undefined) updateData.categoria = String(req.body.fc_categoria);

      const granjaInput = req.body.granja ?? req.body.ubicacion_id ?? req.body.fc_granja;
      if (granjaInput !== undefined) {
        const ubicacion = await resolverUbicacion(granjaInput);
        if (!ubicacion) {
          return res.status(400).json({ error: "granja/ubicacion invalida" });
        }
        updateData.ubicacionId = ubicacion.ubicacionId;
      }

      for (const mes of MESES) {
        if (req.body[mes] !== undefined) {
          updateData[mes] = toDecimal(req.body[mes]);
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nada que actualizar" });
      }

      const registro = await prisma.cajaAhorroResumen.update({
        where: { cajaAhorroId: Number(id) },
        data: updateData,
        include: { ubicacion: true },
      });
      res.json({ mensaje: "Actualizado correctamente", registro: serializeCajaAhorroResumen(registro) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe esa categoria para la ubicacion" });
      }
      console.error("Error al actualizar:", err);
      res.status(500).json({ error: "Error al actualizar" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.cajaAhorroResumen.delete({ where: { cajaAhorroId: Number(id) } });
      res.json({ mensaje: "Eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error al eliminar registro:", err);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  }

  static async deleteByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.query.granja ?? req.query.ubicacion_id);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }
      const result = await prisma.cajaAhorroResumen.deleteMany({
        where: { ubicacionId: ubicacion.ubicacionId },
      });
      res.json({ mensaje: "Eliminados todos los registros", eliminados: result.count });
    } catch (err) {
      console.error("Error al eliminar todos:", err);
      res.status(500).json({ error: "Error al eliminar todos" });
    }
  }
}

export default CajaAhorroController;

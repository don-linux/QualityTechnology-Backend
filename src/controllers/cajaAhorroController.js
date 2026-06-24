import prisma from "../prisma.js";
import { serializeCajaAhorroResumen } from "../utils/serializers.js";

// El modelo caja_ahorro del schema actual es un registro de movimiento
// individual (granja, categoria, concepto, monto, fecha) y NO tiene el
// resumen mensual (enero..diciembre) del modelo previo. Los endpoints
// mantienen las rutas, pero internamente operan sobre el nuevo modelo.

function toDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

class CajaAhorroController {
  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) {
        return res.status(404).json({ error: "Granja no encontrada" });
      }
      const registros = await prisma.caja_ahorro.findMany({
        where: { granja: { equals: granja, mode: "insensitive" } },
        orderBy: { id: "desc" },
      });
      res.json(registros.map(serializeCajaAhorroResumen));
    } catch (err) {
      console.error("Error al obtener registros:", err);
      res.status(500).json({ error: "Error al obtener registros" });
    }
  }

  static async create(req, res) {
    try {
      const categoria = req.body.categoria;
      const granja = req.body.granja;
      if (!categoria || !String(categoria).trim()) {
        return res.status(400).json({ error: "categoria es obligatoria" });
      }
      if (!granja || !String(granja).trim()) {
        return res.status(400).json({ error: "granja es obligatoria" });
      }
      const registro = await prisma.caja_ahorro.create({
        data: {
          granja: String(granja).trim(),
          categoria: String(categoria).trim(),
          concepto: req.body.concepto ?? null,
          monto: toDecimal(req.body.monto, 0),
          fecha: toDateOrNull(req.body.fecha),
        },
      });
      res.status(201).json(serializeCajaAhorroResumen(registro));
    } catch (err) {
      console.error("Error al crear registro:", err);
      res.status(500).json({ error: "Error al crear registro" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      if (req.body.categoria !== undefined) updateData.categoria = String(req.body.categoria);
      if (req.body.granja !== undefined) updateData.granja = String(req.body.granja);
      if (req.body.concepto !== undefined) updateData.concepto = req.body.concepto ?? null;
      if (req.body.monto !== undefined) updateData.monto = toDecimal(req.body.monto, 0);
      if (req.body.fecha !== undefined) updateData.fecha = toDateOrNull(req.body.fecha);

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "Nada que actualizar" });
      }

      const registro = await prisma.caja_ahorro.update({
        where: { id },
        data: updateData,
      });
      res.json({ mensaje: "Actualizado correctamente", registro: serializeCajaAhorroResumen(registro) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error al actualizar:", err);
      res.status(500).json({ error: "Error al actualizar" });
    }
  }

}

export default CajaAhorroController;

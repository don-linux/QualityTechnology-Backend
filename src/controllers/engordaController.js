import prisma from "../prisma.js";
import { serializeEngorda } from "../utils/serializers.js";

// Engorda en el schema actual es una relacion 1-1 con Pileta. Los campos
// antiguos (instalacionId, loteId, ubicacionId, fechaSiembra, fechaBiometria)
// fueron reemplazados por pileta_id, siembra_id, biometria_id. El modelo
// `trazaEngorda` ya no existe. Los endpoints heredados de traslados quedan
// como 501 hasta rediseñarlos sobre `siembra`/`Biometria`.

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

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const engordaInclude = {
  piletas: { include: { ubicacion: true } },
  observacion: true,
};

class EngordaController {
  static async getAll(req, res) {
    try {
      const engordas = await prisma.engorda.findMany({
        include: engordaInclude,
        orderBy: { id: "desc" },
      });
      res.json(engordas.map(serializeEngorda));
    } catch (err) {
      console.error("Error al obtener engordas:", err);
      res.status(500).json({ error: "Error al obtener engordas" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);
      const engordas = await prisma.engorda.findMany({
        where: {
          piletas: {
            ubicacion: { nombre: { equals: granja, mode: "insensitive" } },
          },
        },
        include: engordaInclude,
        orderBy: { id: "desc" },
      });
      res.json(engordas.map(serializeEngorda));
    } catch (err) {
      console.error("Error al obtener engordas por granja:", err);
      res.status(500).json({ error: "Error al obtener engordas" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio" });
      }
      const cantidad = toInt(pick(req.body, "cantidad"), 0) ?? 0;
      const tallaGr = toDecimal(pick(req.body, "talla_gr", "tallaGr"));

      const creada = await prisma.engorda.create({
        data: {
          pileta_id: piletaId,
          cantidad,
          ...(tallaGr !== null ? { tallaGr } : {}),
          usuarioId: req.user.usuario_id,
        },
        include: engordaInclude,
      });

      res.status(201).json({
        mensaje: "Engorda registrada con exito",
        data: serializeEngorda(creada),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa pileta ya tiene una engorda asociada" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      console.error("Error al registrar engorda:", err);
      res.status(500).json({ error: "Error al registrar engorda", detalle: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      if (req.body.cantidad !== undefined) updateData.cantidad = toInt(req.body.cantidad, 0) ?? 0;
      if (req.body.talla_gr !== undefined || req.body.tallaGr !== undefined) {
        updateData.tallaGr = toDecimal(pick(req.body, "talla_gr", "tallaGr"));
      }

      const actualizada = await prisma.engorda.update({
        where: { id },
        data: updateData,
        include: engordaInclude,
      });
      res.json({
        mensaje: "Engorda actualizada correctamente.",
        data: serializeEngorda(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Engorda no encontrada" });
      console.error("Error al actualizar engorda:", err);
      res.status(500).json({ error: "Error al actualizar engorda" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.engorda.delete({ where: { id } });
      res.json({ mensaje: "Registro eliminado correctamente." });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado." });
      console.error("Error al eliminar:", err);
      res.status(500).json({ error: "Error eliminando registro de Engorda" });
    }
  }

  // ---------------------------------------------------------------------------
  // Endpoints heredados: pendientes de rediseno sobre los nuevos modelos.
  // ---------------------------------------------------------------------------
  static async getMovimientos(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: ya no existe trazaEngorda en el schema.",
    });
  }

  static async deleteMovimiento(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: ya no existe trazaEngorda en el schema.",
    });
  }
}

export default EngordaController;

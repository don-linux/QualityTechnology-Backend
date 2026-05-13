import prisma from "../prisma.js";
import { serializeSiembra } from "../utils/serializers.js";
import { ubicacionNombreWhereFromGranja } from "../utils/granjaUbicacion.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

const siembraListInclude = {
  piletas_siembra_pileta_origenTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      reproductores: { select: { familia: true } },
    },
  },
  piletas_siembra_pileta_destinoTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { id: true, nombre: true } },
    },
  },
};

class SiembraController {
  /** Listado para trazabilidad y selectores (p. ej. vincular alevinaje a siembra hacia esta pileta). */
  static async getAll(req, res) {
    try {
      const granja =
        typeof req.query.granja === "string" ? req.query.granja.trim() : "";
      const piletaDestino = toInt(req.query.pileta_destino ?? req.query.pileta_destino_id);
      const destinoTipo =
        typeof req.query.destino_tipo === "string" ? req.query.destino_tipo.trim() : "";
      const origenTipo =
        typeof req.query.origen_tipo === "string" ? req.query.origen_tipo.trim() : "";

      const where = {};

      if (piletaDestino) where.pileta_destino = piletaDestino;

      const destPiletaFilter = {};

      if (granja) {
        const uCond = ubicacionNombreWhereFromGranja(granja);
        if (uCond) destPiletaFilter.ubicacion = uCond;
      }
      if (destinoTipo) destPiletaFilter.tipo = destinoTipo;

      if (Object.keys(destPiletaFilter).length) {
        where.piletas_siembra_pileta_destinoTopiletas = destPiletaFilter;
      }

      if (origenTipo) {
        where.piletas_siembra_pileta_origenTopiletas = { tipo: origenTipo };
      }

      const rows = await prisma.siembra.findMany({
        where,
        include: siembraListInclude,
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        take: 500,
      });
      res.json(rows.map(serializeSiembra));
    } catch (err) {
      console.error("GET /siembras Error:", err);
      res.status(500).json({ error: "Error obteniendo siembras" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id inválido" });
      const row = await prisma.siembra.findUnique({
        where: { id },
        include: siembraListInclude,
      });
      if (!row) return res.status(404).json({ error: "Siembra no encontrada" });
      res.json(serializeSiembra(row));
    } catch (err) {
      console.error("GET /siembras/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo siembra" });
    }
  }
}

export default SiembraController;

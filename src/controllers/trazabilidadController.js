import prisma from "../prisma.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import {
  ETAPAS_TRAZABILIDAD,
  serializarMovimientoSiembra,
} from "../utils/siembraMovimiento.js";

const siembraTrazabilidadInclude = {
  piletas_siembra_pileta_origenTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { nombre: true } },
    },
  },
  piletas_siembra_pileta_destinoTopiletas: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      ubicacion: { select: { nombre: true } },
    },
  },
  alevinajes_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      observacion: { select: { comentario: true } },
    },
  },
  engordas_como_origen: {
    orderBy: { id: "desc" },
    take: 1,
    select: {
      observacion: { select: { comentario: true } },
    },
  },
};

class TrazabilidadController {
  /** Movimientos `siembra` donde origen o destino es pileta de alevinaje o engorda. */
  static async getMovimientos(req, res) {
    try {
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);

      const piletaEnUbic = { ...ubicClause, tipo: { in: ETAPAS_TRAZABILIDAD } };

      const rows = await prisma.siembra.findMany({
        where: {
          OR: [
            { piletas_siembra_pileta_destinoTopiletas: piletaEnUbic },
            { piletas_siembra_pileta_origenTopiletas: piletaEnUbic },
          ],
        },
        include: siembraTrazabilidadInclude,
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        take: 500,
      });

      res.json(rows.map(serializarMovimientoSiembra));
    } catch (err) {
      console.error("Error movimientos trazabilidad:", err);
      res.status(500).json({ error: "Error al obtener movimientos de trazabilidad" });
    }
  }
}

export default TrazabilidadController;

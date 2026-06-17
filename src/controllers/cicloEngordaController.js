import prisma from "../prisma.js";
import { serializeCicloEngorda } from "../utils/serializers.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import {
  listarCiclosEngorda,
  obtenerDashboardCiclo,
} from "../utils/cicloEngordaService.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

class CicloEngordaController {
  static async getAll(req, res) {
    try {
      const estado = req.query.estado ? String(req.query.estado) : null;
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      const rows = await listarCiclosEngorda(prisma, {
        estado,
        piletaWhere: ubicClause ?? undefined,
      });
      res.json(rows.map(serializeCicloEngorda));
    } catch (err) {
      console.error("GET /ciclos-engorda Error:", err);
      res.status(500).json({ error: "Error obteniendo ciclos de engorda" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const row = await prisma.cicloEngorda.findUnique({
        where: { id },
        include: {
          pileta: { include: { ubicacion: true } },
          siembra_ingreso: true,
        },
      });
      if (!row) return res.status(404).json({ error: "Ciclo no encontrado" });
      res.json(serializeCicloEngorda(row));
    } catch (err) {
      console.error("GET /ciclos-engorda/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo ciclo" });
    }
  }

  static async getDashboard(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const dashboard = await obtenerDashboardCiclo(prisma, id);
      if (!dashboard) return res.status(404).json({ error: "Ciclo no encontrado" });

      res.json({
        ciclo: serializeCicloEngorda(dashboard.ciclo),
        biometrias: dashboard.biometrias,
        serie_engorda: dashboard.serie_engorda,
        consumo_real: dashboard.consumo_real,
        kpis: dashboard.kpis,
      });
    } catch (err) {
      console.error("GET /ciclos-engorda/:id/dashboard Error:", err);
      res.status(500).json({ error: "Error obteniendo dashboard del ciclo" });
    }
  }
}

export default CicloEngordaController;

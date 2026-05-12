import prisma from "../prisma.js";

class TesoreriaController {
  static async getOverview(req, res) {
    try {
      const { granja, categoria } = req.query;
      const filters = [];
      const params = [];

      if (granja) {
        params.push(String(granja));
        filters.push(`UPPER(granja) = UPPER($${params.length})`);
      }
      if (categoria) {
        params.push(String(categoria));
        filters.push(`UPPER(categoria) = UPPER($${params.length})`);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      const sql = `
        SELECT
          granja          AS fc_granja,
          mes             AS fc_mes,
          categoria       AS fc_categoria,
          total_ingreso,
          total_egreso,
          saldo_neto
        FROM vw_tesoreria_general
        ${whereClause}
        ORDER BY granja, mes, categoria
      `;

      const rows = await prisma.$queryRawUnsafe(sql, ...params);
      res.json(rows);
    } catch (err) {
      console.error("Error al obtener datos de tesoreria:", err);
      res.status(500).json({ error: "Error al obtener datos de tesoreria" });
    }
  }
}

export default TesoreriaController;

import prisma from "../prisma.js";

function mapTesoreriaRow(r) {
  const mes = r.mes ?? null;
  const categoria = r.categoria ?? null;
  const subcategoria = r.subcategoria ?? null;
  return {
    mes,
    categoria,
    subcategoria,
    total_ingreso: Number(r.total_ingreso ?? 0),
    total_egreso: Number(r.total_egreso ?? 0),
    saldo_neto: Number(r.saldo_neto ?? 0),
    mes_nombre: mes,
    grupo: categoria || "SIN GRUPO",
    subgrupo: subcategoria || "SIN SUBGRUPO",
  };
}

class TesoreriaController {
  static async getOverview(req, res) {
    try {
      const { categoria, anio } = req.query;
      const filters = [];
      const params = [];

      if (categoria) {
        params.push(String(categoria));
        filters.push(`UPPER(categoria) = UPPER($${params.length}::text)`);
      }
      const anioStr = anio != null && anio !== "" ? String(anio).trim() : "";
      if (/^\d{4}$/.test(anioStr)) {
        params.push(anioStr);
        filters.push(`LEFT(mes::text, 4) = $${params.length}::text`);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      const sql = `
        SELECT
          mes,
          categoria,
          subcategoria,
          total_ingreso,
          total_egreso,
          saldo_neto
        FROM vw_tesoreria_general
        ${whereClause}
        ORDER BY mes, categoria, subcategoria NULLS LAST
      `;

      const rows = await prisma.$queryRawUnsafe(sql, ...params);
      res.json(rows.map(mapTesoreriaRow));
    } catch (err) {
      console.error("Error al obtener datos de tesoreria:", err);
      res.status(500).json({ error: "Error al obtener datos de tesoreria" });
    }
  }
}

export default TesoreriaController;

import prisma from "../prisma.js";

function mapTesoreriaRow(r) {
  const fc_mes = r.fc_mes ?? r.mes ?? null;
  const fc_categoria = r.fc_categoria ?? r.categoria ?? null;
  const fc_subcategoria = r.fc_subcategoria ?? r.subcategoria ?? null;
  return {
    fc_granja: r.fc_granja ?? r.granja ?? null,
    fc_mes,
    fc_categoria,
    fc_subcategoria,
    total_ingreso: Number(r.total_ingreso ?? 0),
    total_egreso: Number(r.total_egreso ?? 0),
    saldo_neto: Number(r.saldo_neto ?? 0),
    mes_nombre: fc_mes,
    grupo: fc_categoria || "SIN GRUPO",
    subgrupo: fc_subcategoria || "SIN SUBGRUPO",
    categoria: fc_categoria || "—",
  };
}

class TesoreriaController {
  static async getOverview(req, res) {
    try {
      const { granja, categoria, anio } = req.query;
      const filters = [];
      const params = [];

      if (granja) {
        params.push(String(granja));
        filters.push(`UPPER(granja) = UPPER($${params.length}::text)`);
      }
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
          granja          AS fc_granja,
          mes             AS fc_mes,
          categoria       AS fc_categoria,
          subcategoria    AS fc_subcategoria,
          total_ingreso,
          total_egreso,
          saldo_neto
        FROM vw_tesoreria_general
        ${whereClause}
        ORDER BY granja, mes, categoria, subcategoria NULLS LAST
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

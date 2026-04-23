import pool from "../db.js";

class TesoreriaModel {
  static async getOverview(filters) {
    let query = `
      SELECT
        fc_granja, fc_mes, fc_categoria,
        total_ingreso, total_egreso, saldo_neto
      FROM vw_tesoreria_general
      WHERE 1=1
    `;
    const params = [];

    if (filters.granja) {
      params.push(filters.granja);
      query += ` AND UPPER(fc_granja) = UPPER($${params.length})`;
    }
    if (filters.categoria) {
      params.push(filters.categoria);
      query += ` AND UPPER(fc_categoria) = UPPER($${params.length})`;
    }

    query += ` ORDER BY fc_granja, fc_mes, fc_categoria;`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default TesoreriaModel;

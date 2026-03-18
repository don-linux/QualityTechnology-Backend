import pool from "../db.js";

class TesoreriaModel {
  static async getOverview(filters) {
    let query = `
      SELECT
        anio, periodo, mes_nombre, fc_granja,
        grupo, subgrupo, categoria,
        total_ingreso, total_egreso, saldo_neto
      FROM vw_tesoreria_overview
      WHERE 1=1
    `;
    const params = [];

    if (filters.anio) {
      params.push(filters.anio);
      query += ` AND anio = $${params.length}`;
    }
    if (filters.granja) {
      params.push(filters.granja);
      query += ` AND UPPER(fc_granja) = UPPER($${params.length})`;
    }
    if (filters.grupo) {
      params.push(filters.grupo);
      query += ` AND UPPER(grupo) = UPPER($${params.length})`;
    }
    if (filters.subgrupo) {
      params.push(filters.subgrupo);
      query += ` AND UPPER(subgrupo) = UPPER($${params.length})`;
    }
    if (filters.categoria) {
      params.push(filters.categoria);
      query += ` AND UPPER(categoria) = UPPER($${params.length})`;
    }

    query += ` ORDER BY anio, periodo, fc_granja, grupo, subgrupo, categoria;`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default TesoreriaModel;

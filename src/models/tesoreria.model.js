import pool from "../config/database.js";

/**
 * Modelo de Tesorería
 */
export const tesoreriaModel = {
  /**
   * Obtener resumen general de tesorería (usa vista vw_tesoreria_overview)
   */
  getOverview: async (anio) => {
    let query = `
      SELECT
        anio,
        periodo,
        grupo,
        subgrupo,
        categoria,
        total_ingreso,
        total_egreso,
        saldo_neto
      FROM vw_tesoreria_overview
      WHERE 1=1
    `;

    const params = [];

    if (anio) {
      params.push(anio);
      query += ` AND anio = $${params.length}`;
    }

    query += `
      ORDER BY anio, periodo, grupo, subgrupo, categoria
    `;

    const result = await pool.query(query, params);
    return result.rows;
  },
};

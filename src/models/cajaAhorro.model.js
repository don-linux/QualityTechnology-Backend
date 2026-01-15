import pool from "../config/database.js";

/**
 * Modelo de Caja de Ahorro
 */
export const cajaAhorroModel = {
  /**
   * Obtener registros por granja
   */
  findByGranja: async (granja) => {
    const result = await pool.query(
      "SELECT * FROM caja_ahorro_resumen WHERE granja = $1 ORDER BY id",
      [granja]
    );
    return result.rows;
  },

  /**
   * Crear nueva categoría
   */
  create: async (categoria, granja = "Ceiba") => {
    const result = await pool.query(
      "INSERT INTO caja_ahorro_resumen (categoria, granja) VALUES ($1, $2) RETURNING *",
      [categoria, granja]
    );
    return result.rows[0];
  },

  /**
   * Actualizar valores de una categoría
   */
  update: async (id, data) => {
    const campos = { ...data };
    const columnas = Object.keys(campos);
    const valores = Object.values(campos);

    const set = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");
    const sql = `UPDATE caja_ahorro_resumen SET ${set} WHERE id = $${columnas.length + 1} RETURNING *`;

    const result = await pool.query(sql, [...valores, id]);
    return result.rows[0];
  },

  /**
   * Eliminar categoría por ID
   */
  delete: async (id) => {
    await pool.query("DELETE FROM caja_ahorro_resumen WHERE id = $1", [id]);
    return true;
  },

  /**
   * Eliminar todas las categorías de una granja
   */
  deleteByGranja: async (granja) => {
    await pool.query("DELETE FROM caja_ahorro_resumen WHERE granja = $1", [
      granja,
    ]);
    return true;
  },
};

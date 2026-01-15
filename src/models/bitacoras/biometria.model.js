import pool from "../../config/database.js";

/**
 * Modelo de Biometría (Ceiba)
 * Tabla: ceiba_biometrias
 */
export const biometriaModel = {
  /**
   * Obtener todos los registros
   */
  findAll: async () => {
    const result = await pool.query(
      "SELECT * FROM ceiba_biometrias ORDER BY fi_id DESC"
    );
    return result.rows;
  },

  /**
   * Obtener registro por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM ceiba_biometrias WHERE fi_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nuevo registro
   */
  create: async (data) => {
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fn_peso_promedio,
      fc_observaciones,
      fc_encargado,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `INSERT INTO ceiba_biometrias 
      (fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
       fc_observaciones, fc_encargado, fi_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fn_peso_promedio,
        fc_observaciones,
        fc_encargado,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar registro
   */
  update: async (id, data) => {
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fn_peso_promedio,
      fc_observaciones,
      fc_encargado,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `UPDATE ceiba_biometrias SET
      fd_fecha=$1, fn_peso_total_gramos=$2, fn_organismos_muestreados=$3,
      fn_peso_promedio=$4, fc_observaciones=$5, fc_encargado=$6, fi_usuario_id=$7
      WHERE fi_id=$8
      RETURNING *`,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fn_peso_promedio,
        fc_observaciones,
        fc_encargado,
        fi_usuario_id,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar registro
   */
  delete: async (id) => {
    await pool.query("DELETE FROM ceiba_biometrias WHERE fi_id = $1", [id]);
    return true;
  },

  /**
   * Eliminar todos los registros
   */
  deleteAll: async () => {
    await pool.query("DELETE FROM ceiba_biometrias");
    return true;
  },
};

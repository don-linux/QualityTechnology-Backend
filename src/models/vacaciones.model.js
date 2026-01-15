import pool from "../config/database.js";

/**
 * Modelo de Vacaciones
 */
export const vacacionesModel = {
  /**
   * Obtener todas las vacaciones
   */
  findAll: async () => {
    const result = await pool.query(
      "SELECT * FROM vacaciones ORDER BY fc_nombre_empleado ASC"
    );
    return result.rows;
  },

  /**
   * Crear nuevo registro
   */
  create: async (data) => {
    const {
      fc_nombre_empleado,
      fi_empleado_id,
      fc_departamento,
      fd_inicio_periodo,
      fd_fin_periodo,
    } = data;

    const result = await pool.query(
      `INSERT INTO vacaciones (
        fc_nombre_empleado, fi_empleado_id, fc_departamento,
        fd_inicio_periodo, fd_fin_periodo, fd_fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        fc_nombre_empleado,
        fi_empleado_id,
        fc_departamento,
        fd_inicio_periodo,
        fd_fin_periodo,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar registro
   */
  update: async (id, data) => {
    const dataCopy = { ...data };
    delete dataCopy.fd_fecha_actualizacion;

    const keys = Object.keys(dataCopy);
    const values = Object.values(dataCopy);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE vacaciones
       SET ${sets}, fd_fecha_actualizacion=NOW()
       WHERE fi_vacacion_id=$${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  /**
   * Eliminar registro
   */
  delete: async (id) => {
    await pool.query("DELETE FROM vacaciones WHERE fi_vacacion_id=$1", [id]);
    return true;
  },

  /**
   * Eliminar todos los registros
   */
  deleteAll: async () => {
    await pool.query("DELETE FROM vacaciones");
    return true;
  },
};

import pool from "../config/database.js";

/**
 * Modelo de Expedientes
 */
export const expedientesModel = {
  /**
   * Obtener todos los expedientes o buscar por nombre
   */
  findAll: async (nombre = null) => {
    let result;
    if (nombre) {
      result = await pool.query(
        `SELECT * FROM expedientes 
         WHERE LOWER(fc_nombre) LIKE LOWER($1)
         ORDER BY fc_nombre ASC`,
        [`%${nombre}%`]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM expedientes ORDER BY fc_nombre ASC`
      );
    }
    return result.rows;
  },

  /**
   * Crear nuevo expediente
   */
  create: async (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

    const query = `
      INSERT INTO expedientes (${keys.join(",")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Actualizar expediente
   */
  update: async (id, data) => {
    const dataCopy = { ...data };
    delete dataCopy.fd_fecha_actualizacion; // Evita colisión con NOW()

    const keys = Object.keys(dataCopy);
    const values = Object.values(dataCopy);

    if (keys.length === 0) {
      throw new Error("No se enviaron campos para actualizar");
    }

    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const query = `
      UPDATE expedientes
      SET ${sets}, fd_fecha_actualizacion=NOW()
      WHERE fi_expediente_id=$${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  },

  /**
   * Eliminar expediente
   */
  delete: async (id) => {
    await pool.query("DELETE FROM expedientes WHERE fi_expediente_id=$1", [id]);
    return true;
  },

  /**
   * Eliminar todos los expedientes
   */
  deleteAll: async () => {
    await pool.query("DELETE FROM expedientes");
    return true;
  },
};

import pool from "../config/database.js";

/**
 * Modelo de Nómina
 */
export const nominaModel = {
  /**
   * Obtener nóminas con filtros opcionales
   */
  findAll: async (nombre = null, fecha = null) => {
    let query = "SELECT * FROM nomina WHERE 1=1";
    const params = [];

    if (nombre) {
      params.push(`%${nombre.toLowerCase()}%`);
      query += ` AND LOWER(fc_nombre_empleado) LIKE $${params.length}`;
    }
    if (fecha) {
      params.push(fecha);
      query += ` AND fd_fecha_pago = $${params.length}`;
    }

    query += " ORDER BY fd_fecha_pago DESC, fc_nombre_empleado ASC";

    const result = await pool.query(query, params);
    return result.rows;
  },

  /**
   * Crear nuevo registro de nómina
   */
  create: async (data) => {
    const {
      fc_nombre_empleado,
      fi_empleado_id,
      fd_fecha_pago,
      fn_total,
      fn_bono,
      fn_deuda,
      fn_descuento,
      fn_anticipo,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO nomina (
        fc_nombre_empleado, fi_empleado_id, fd_fecha_pago,
        fn_total, fn_bono, fn_deuda, fn_descuento, fn_anticipo, fi_usuario_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
      [
        fc_nombre_empleado,
        fi_empleado_id,
        fd_fecha_pago,
        fn_total,
        fn_bono,
        fn_deuda,
        fn_descuento,
        fn_anticipo,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar nómina
   */
  update: async (id, data) => {
    const dataCopy = { ...data };
    delete dataCopy.fd_fecha_actualizacion;

    const keys = Object.keys(dataCopy);
    const values = Object.values(dataCopy);

    if (keys.length === 0) {
      throw new Error("Nada que actualizar");
    }

    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const query = `
      UPDATE nomina SET ${sets}, fd_fecha_actualizacion=NOW()
      WHERE fi_nomina_id=$${keys.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  },

  /**
   * Eliminar nómina
   */
  delete: async (id) => {
    await pool.query("DELETE FROM nomina WHERE fi_nomina_id=$1", [id]);
    return true;
  },
};

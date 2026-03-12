import pool from "../db.js";

class NominaModel {
  static async getAll(filters) {
    let query = "SELECT * FROM nomina WHERE 1=1";
    const params = [];

    if (filters.nombre) {
      params.push(`%${filters.nombre.toLowerCase()}%`);
      query += ` AND LOWER(fc_nombre_empleado) LIKE $${params.length}`;
    }
    if (filters.fecha) {
      params.push(filters.fecha);
      query += ` AND fd_fecha_pago = $${params.length}`;
    }

    query += " ORDER BY fd_fecha_pago DESC, fc_nombre_empleado ASC";

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO nomina (
        fc_nombre_empleado, fi_empleado_id, fd_fecha_pago,
        fn_total, fn_bono, fn_deuda, fn_descuento, fn_anticipo, fi_usuario_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        data.fc_nombre_empleado, data.fi_empleado_id, data.fd_fecha_pago,
        data.fn_total, data.fn_bono, data.fn_deuda,
        data.fn_descuento, data.fn_anticipo, data.fi_usuario_id,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    delete data.fd_fecha_actualizacion;
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return null;

    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const query = `
      UPDATE nomina SET ${sets}, fd_fecha_actualizacion=NOW()
      WHERE fi_nomina_id=$${keys.length + 1}
      RETURNING *
    `;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM nomina WHERE fi_nomina_id=$1", [id]);
  }
}

export default NominaModel;

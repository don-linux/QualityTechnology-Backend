import pool from "../db.js";

class ExpedienteModel {
  static async getAll(nombre) {
    if (nombre) {
      const result = await pool.query(
        `SELECT * FROM expedientes
         WHERE LOWER(fc_nombre) LIKE LOWER($1)
         ORDER BY fc_nombre ASC`,
        [`%${nombre}%`]
      );
      return result.rows;
    }
    const result = await pool.query(
      "SELECT * FROM expedientes ORDER BY fc_nombre ASC"
    );
    return result.rows;
  }

  static async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `INSERT INTO expedientes (${keys.join(",")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id, data) {
    delete data.fd_fecha_actualizacion;
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return null;

    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE expedientes
       SET ${sets}, fd_fecha_actualizacion=NOW()
       WHERE fi_expediente_id=$${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query(
      "DELETE FROM expedientes WHERE fi_expediente_id=$1",
      [id]
    );
  }

  static async deleteAll() {
    await pool.query("DELETE FROM expedientes");
  }
}

export default ExpedienteModel;

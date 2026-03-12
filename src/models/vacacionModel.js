import pool from "../db.js";

class VacacionModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM vacaciones ORDER BY fc_nombre_empleado ASC"
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO vacaciones (
        fc_nombre_empleado, fi_empleado_id, fc_departamento,
        fd_inicio_periodo, fd_fin_periodo, fd_fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        data.fc_nombre_empleado, data.fi_empleado_id,
        data.fc_departamento, data.fd_inicio_periodo, data.fd_fin_periodo,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    delete data.fd_fecha_actualizacion;
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE vacaciones
       SET ${sets}, fd_fecha_actualizacion=NOW()
       WHERE fi_vacacion_id=$${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM vacaciones WHERE fi_vacacion_id=$1", [id]);
  }

  static async deleteAll() {
    await pool.query("DELETE FROM vacaciones");
  }
}

export default VacacionModel;

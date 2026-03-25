import pool from "../db.js";

const ALLOWED_COLUMNS = new Set([
  "fc_nombre_empleado", "fi_empleado_id", "fc_departamento",
  "fd_inicio_periodo", "fd_fin_periodo",
  "fn_dias_trabajados", "fn_vacaciones_v", "fn_enfermedad_e",
  "fn_maternidad_m", "fn_permiso_parcial_pp", "fn_permiso_total_pt",
  "fn_inasistencias_i", "fn_vacaciones_anio", "fn_dias_previos",
  "fn_vacaciones_disponibles", "fn_vacaciones_disfrutadas", "fc_asistencia",
]);

function sanitize(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (ALLOWED_COLUMNS.has(key)) clean[key] = value;
  }
  return clean;
}

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

  static async update(id, rawData) {
    const data = sanitize(rawData);
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return null;

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

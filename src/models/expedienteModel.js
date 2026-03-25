import pool from "../db.js";

const ALLOWED_COLUMNS = new Set([
  "fc_nombre", "fc_id_empleado", "fn_uniformes", "fc_credencial",
  "fc_fotografia", "fc_acta_nacimiento", "fc_ine", "fc_licencia_conducir",
  "fc_comprobante_domicilio", "fc_rfc", "fc_curp", "fc_comprobante_estudios",
  "fc_cv", "fc_carta_recomendacion", "fc_acuerdo_confidencialidad",
  "fc_codigo_etica", "fc_codigo_conducta", "fc_solicitud_empleo",
  "fi_usuario_id", "fc_puesto",
]);

function sanitize(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (ALLOWED_COLUMNS.has(key)) clean[key] = value;
  }
  return clean;
}

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

  static async create(rawData) {
    const data = sanitize(rawData);
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return null;

    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const result = await pool.query(
      `INSERT INTO expedientes (${keys.join(",")})
       VALUES (${placeholders})
       RETURNING *`,
      values
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

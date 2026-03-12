import pool from "../db.js";

class AlevinModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM alevines ORDER BY fi_alevines_id DESC"
    );
    return result.rows.map((row) => ({
      ...row,
      fd_fecha_registro: row.fd_fecha_registro
        ? row.fd_fecha_registro.toISOString()
        : null,
      fd_fecha_modificacion: row.fd_fecha_modificacion
        ? row.fd_fecha_modificacion.toISOString()
        : null,
    }));
  }

  static async create(data) {
    const fechaActual = new Date();
    const result = await pool.query(
      `INSERT INTO alevines (
        fc_numero_lote, fn_peso_promedio, fn_cantidad, fc_observacion,
        fi_usuario_id, fi_colecta_id, fd_fecha_registro, fd_fecha_modificacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        data.fc_numero_lote, data.fn_peso_promedio, data.fn_cantidad,
        data.fc_observacion, data.fi_usuario_id, data.fi_colecta_id,
        data.fd_fecha_registro || fechaActual,
        data.fd_fecha_modificacion || fechaActual,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fechaActual = new Date();
    const result = await pool.query(
      `UPDATE alevines SET
        fc_numero_lote = $1, fn_peso_promedio = $2, fn_cantidad = $3,
        fc_observacion = $4, fi_usuario_id = $5, fi_colecta_id = $6,
        fd_fecha_modificacion = $7
      WHERE fi_alevines_id = $8 RETURNING *`,
      [
        data.fc_numero_lote, data.fn_peso_promedio, data.fn_cantidad,
        data.fc_observacion, data.fi_usuario_id, data.fi_colecta_id,
        fechaActual, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM alevines WHERE fi_alevines_id = $1",
      [id]
    );
    return result.rowCount;
  }
}

export default AlevinModel;

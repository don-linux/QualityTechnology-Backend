import pool from "../db.js";

class AlevinModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM inventario_alevines ORDER BY fi_id DESC"
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO inventario_alevines (
        ubicacion, fn_num_instalacion, fc_lote, fn_cantidad, fn_talla,
        fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado,
        fi_usuario_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        data.ubicacion, data.fn_num_instalacion, data.fc_lote,
        data.fn_cantidad, data.fn_talla, data.fc_observacion,
        data.fd_fecha_siembra, data.fd_fecha_salida_hormonado,
        data.fi_usuario_id,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE inventario_alevines SET
        ubicacion = $1, fn_num_instalacion = $2, fc_lote = $3,
        fn_cantidad = $4, fn_talla = $5, fc_observacion = $6,
        fd_fecha_siembra = $7, fd_fecha_salida_hormonado = $8,
        fi_usuario_id = $9
      WHERE fi_id = $10 RETURNING *`,
      [
        data.ubicacion, data.fn_num_instalacion, data.fc_lote,
        data.fn_cantidad, data.fn_talla, data.fc_observacion,
        data.fd_fecha_siembra, data.fd_fecha_salida_hormonado,
        data.fi_usuario_id, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM inventario_alevines WHERE fi_id = $1",
      [id]
    );
    return result.rowCount;
  }
}

export default AlevinModel;

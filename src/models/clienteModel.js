import pool from "../db.js";

class ClienteModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM clientes ORDER BY fi_cliente_id ASC"
    );
    return result.rows;
  }

  static async create(data) {
    const now = new Date();
    const result = await pool.query(
      `INSERT INTO clientes (
        fc_nombre, fc_telefono, fc_correo, fc_localidad,
        fc_cp, fi_usuario_id, fd_fecha_registro, fd_fecha_modificacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        data.fc_nombre, data.fc_telefono, data.fc_correo,
        data.fc_localidad, data.fc_cp, data.fi_usuario_id, now, now,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const now = new Date();
    const result = await pool.query(
      `UPDATE clientes SET
        fc_nombre=$1, fc_telefono=$2, fc_correo=$3,
        fc_localidad=$4, fc_cp=$5, fi_usuario_id=$6,
        fd_fecha_modificacion=$7
      WHERE fi_cliente_id=$8
      RETURNING *`,
      [
        data.fc_nombre, data.fc_telefono, data.fc_correo,
        data.fc_localidad, data.fc_cp, data.fi_usuario_id, now, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM clientes WHERE fi_cliente_id=$1", [id]);
  }
}

export default ClienteModel;

import pool from "../db.js";

class ProveedorModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM proveedores ORDER BY id DESC"
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO proveedores
        (nombre, empresa, rfc, categoria, contacto, telefono, correo,
         direccion, forma_pago, plazo_credito, ultima_compra, monto_promedio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        data.nombre, data.empresa, data.rfc, data.categoria,
        data.contacto, data.telefono, data.correo, data.direccion,
        data.forma_pago, data.plazo_credito,
        data.ultima_compra || null, data.monto_promedio || 0,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE proveedores
       SET nombre=$1, empresa=$2, rfc=$3, categoria=$4, contacto=$5,
           telefono=$6, correo=$7, direccion=$8, forma_pago=$9,
           plazo_credito=$10, ultima_compra=$11, monto_promedio=$12,
           activo=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [
        data.nombre, data.empresa, data.rfc, data.categoria,
        data.contacto, data.telefono, data.correo, data.direccion,
        data.forma_pago, data.plazo_credito,
        data.ultima_compra || null, data.monto_promedio || 0,
        data.activo, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM proveedores WHERE id=$1", [id]);
  }
}

export default ProveedorModel;

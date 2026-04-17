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
        (razon_social, rfc, udn, nombre_contacto, telefono, correo,
         localidad, estado, ejecutivo, precio_venta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        data.razon_social, data.rfc, data.udn, data.nombre_contacto,
        data.telefono, data.correo, data.localidad, data.estado,
        data.ejecutivo, data.precio_venta || 0,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE proveedores
       SET razon_social=$1, rfc=$2, udn=$3, nombre_contacto=$4,
           telefono=$5, correo=$6, localidad=$7, estado=$8,
           ejecutivo=$9, precio_venta=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
        data.razon_social, data.rfc, data.udn, data.nombre_contacto,
        data.telefono, data.correo, data.localidad, data.estado,
        data.ejecutivo, data.precio_venta || 0, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM proveedores WHERE id=$1", [id]);
  }
}

export default ProveedorModel;

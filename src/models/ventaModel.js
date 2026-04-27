import pool from "../db.js";

class VentaModel {
  static async getClientes() {
    const result = await pool.query(
      `SELECT fi_cliente_id AS id, fc_razon_social AS nombre
       FROM clientes ORDER BY nombre ASC`
    );
    return result.rows;
  }

  static async getEncargados(puesto) {
    const result = await pool.query(
      `SELECT fi_empleado_id AS id,
              CONCAT_WS(' ', fc_nombre, fc_apellido_paterno, fc_apellido_materno) AS nombre
       FROM rrhh.empleados
       WHERE fb_activo = true
       ORDER BY nombre ASC`
    );
    return result.rows;
  }

  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM ventas ORDER BY fd_fecha_venta DESC, fi_venta_id DESC"
    );
    return result.rows;
  }

  static async create(data) {
    await pool.query(
      `INSERT INTO ventas (
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_monto_total,
        fn_abonado, fc_estado_pago,
        fc_encargado_venta, fc_observaciones, fc_empresa,
        fd_fecha_registro
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())`,
      [
        data.fc_folio, data.fd_fecha_venta, data.fc_cliente,
        data.fc_tipo_venta, data.fn_cantidad_vendida, data.fn_precio_venta,
        data.fn_monto_total, data.fn_abonado,
        data.fc_estado_pago, data.fc_encargado_venta,
        data.fc_observaciones, data.fc_empresa,
      ]
    );
  }

  static async update(id, data) {
    await pool.query(
      `UPDATE ventas SET
        fc_folio = $1, fd_fecha_venta = $2, fc_cliente = $3,
        fc_tipo_venta = $4, fn_cantidad_vendida = $5, fn_precio_venta = $6,
        fn_monto_total = $7, fn_abonado = $8,
        fc_estado_pago = $9, fc_encargado_venta = $10,
        fc_observaciones = $11, fc_empresa = $12,
        fd_fecha_modificacion = NOW()
      WHERE fi_venta_id = $13`,
      [
        data.fc_folio, data.fd_fecha_venta, data.fc_cliente,
        data.fc_tipo_venta, data.fn_cantidad_vendida, data.fn_precio_venta,
        data.fn_monto_total, data.fn_abonado,
        data.fc_estado_pago, data.fc_encargado_venta,
        data.fc_observaciones, data.fc_empresa, id,
      ]
    );
  }

  static async delete(id) {
    await pool.query("DELETE FROM ventas WHERE fi_venta_id = $1", [id]);
  }
}

export default VentaModel;

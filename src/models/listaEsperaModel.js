import pool from "../db.js";

class ListaEsperaModel {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM lista_espera ORDER BY fi_lista_id DESC"
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO lista_espera (
        fd_fecha_entrega, fc_talla, fn_cantidad, fc_cliente,
        fc_lugar_entrega, fc_encargado_venta, fc_unidad_produccion,
        fc_hora_embolsado, fc_hora_entrega, fn_precio_venta,
        fc_uap_asignada, fc_granja_asignada
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        data.fd_fecha_entrega, data.fc_talla, data.fn_cantidad,
        data.fc_cliente, data.fc_lugar_entrega, data.fc_encargado_venta,
        data.fc_unidad_produccion, data.fc_hora_embolsado,
        data.fc_hora_entrega, data.fn_precio_venta,
        data.fc_uap_asignada, data.fc_granja_asignada,
      ]
    );
    return result.rows[0];
  }

  static async update(id, campos) {
    await pool.query(
      `UPDATE lista_espera SET
        fd_fecha_entrega=$1, fc_talla=$2, fn_cantidad=$3, fc_cliente=$4,
        fc_lugar_entrega=$5, fc_encargado_venta=$6, fc_unidad_produccion=$7,
        fc_hora_embolsado=$8, fc_hora_entrega=$9, fn_precio_venta=$10,
        fc_uap_asignada=$11, fc_granja_asignada=$12
      WHERE fi_lista_id=$13`,
      [
        campos.fd_fecha_entrega, campos.fc_talla, campos.fn_cantidad,
        campos.fc_cliente, campos.fc_lugar_entrega, campos.fc_encargado_venta,
        campos.fc_unidad_produccion, campos.fc_hora_embolsado,
        campos.fc_hora_entrega, campos.fn_precio_venta,
        campos.fc_uap_asignada, campos.fc_granja_asignada, id,
      ]
    );
  }

  static async delete(id) {
    await pool.query("DELETE FROM lista_espera WHERE fi_lista_id=$1", [id]);
  }

  static async getById(id) {
    const result = await pool.query(
      "SELECT * FROM lista_espera WHERE fi_lista_id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async convertirAVenta(id, usuarioId) {
    const dato = await pool.query(
      "SELECT * FROM lista_espera WHERE fi_lista_id = $1",
      [id]
    );

    if (dato.rows.length === 0) return null;

    const d = dato.rows[0];
    const now = new Date();
    const cantidad = parseInt(d.fn_cantidad);
    const precio = parseFloat(d.fn_precio_venta);
    const total = cantidad * precio;

    const ventaNueva = await pool.query(
      `INSERT INTO ventas (
        fd_fecha_venta, fn_talla, fn_cantidad_vendida, fc_cliente,
        fn_precio_venta, fn_monto_total, fc_lugar_entrega, fc_estado,
        fc_encargado_venta, fc_estanque_cosecha, fc_estado_pago,
        fc_metodo_pago, fc_observaciones, fc_unidad_produccion,
        fc_granja, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, 'PENDIENTE', $8, '',
        'PENDIENTE', 'EFECTIVO', '',
        $9, $10, $11, $11, $12
      ) RETURNING *`,
      [
        d.fd_fecha_entrega, d.fc_talla, cantidad, d.fc_cliente,
        precio, total, d.fc_lugar_entrega, d.fc_encargado_venta,
        d.fc_unidad_produccion, d.fc_granja_asignada, now, usuarioId,
      ]
    );

    await pool.query("DELETE FROM lista_espera WHERE fi_lista_id = $1", [id]);

    return ventaNueva.rows[0];
  }
}

export default ListaEsperaModel;

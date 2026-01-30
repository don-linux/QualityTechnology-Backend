import pool from "../config/database.js";

/**
 * Modelo de Ventas
 */
export const ventasModel = {
  /**
   * Obtener todas las ventas
   */
  findAll: async () => {
    const result = await pool.query(
      `SELECT * FROM ventas ORDER BY fi_venta_id DESC`
    );
    return result.rows;
  },

  /**
   * Crear nueva venta
   */
  create: async (data) => {
    const {
      fd_fecha_venta,
      fn_talla,
      fn_cantidad_vendida,
      fc_cliente,
      fn_precio_venta,
      fn_monto_total,
      fc_lugar_entrega,
      fc_estado,
      fc_encargado_venta,
      fc_estanque_cosecha,
      fc_estado_pago,
      fc_metodo_pago,
      fc_observaciones,
      fc_unidad_produccion,
      fc_granja,
      fi_usuario_id,
    } = data;

    const now = new Date();

    const result = await pool.query(
      `
      INSERT INTO ventas (
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,
        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        fc_granja,
        fd_fecha_registro,
        fd_fecha_modificacion,
        fi_usuario_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16,$17)
      RETURNING *
    `,
      [
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,
        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        fc_granja,
        now,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar venta
   */
  update: async (id, data) => {
    const {
      fd_fecha_venta,
      fn_talla,
      fn_cantidad_vendida,
      fc_cliente,
      fn_precio_venta,
      fn_monto_total,
      fc_lugar_entrega,
      fc_estado,
      fc_encargado_venta,
      fc_estanque_cosecha,
      fc_estado_pago,
      fc_metodo_pago,
      fc_observaciones,
      fc_unidad_produccion,
      fc_granja,
      fi_usuario_id,
    } = data;

    const now = new Date();

    const result = await pool.query(
      `
      UPDATE ventas SET
        fd_fecha_venta = $1,
        fn_talla = $2,
        fn_cantidad_vendida = $3,
        fc_cliente = $4,
        fn_precio_venta = $5,
        fn_monto_total = $6,
        fc_lugar_entrega = $7,
        fc_estado = $8,
        fc_encargado_venta = $9,
        fc_estanque_cosecha = $10,
        fc_estado_pago = $11,
        fc_metodo_pago = $12,
        fc_observaciones = $13,
        fc_unidad_produccion = $14,
        fc_granja = $15,
        fd_fecha_modificacion = $16,
        fi_usuario_id = $17
      WHERE fi_venta_id = $18
      RETURNING *
    `,
      [
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,
        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        fc_granja,
        now,
        fi_usuario_id,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Obtener concentrado
   */
  getConcentrado: async (granja) => {
    let where = "";
    const params = [];

    if (granja && granja !== "ALL") {
      where = "WHERE fc_granja = $1";
      params.push(granja === "medellin" ? "Medellin" : granja === "la ceiba" ? "La Ceiba" : granja);
    }

    const result = await pool.query(
      `
      SELECT *
      FROM vw_concentrado_general_granjas
      ${where}
      ORDER BY mes
    `,
      params
    );
    return result.rows;
  },
};

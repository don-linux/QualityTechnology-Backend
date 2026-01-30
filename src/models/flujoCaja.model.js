import pool from "../config/database.js";

/**
 * Modelo de Flujo de Caja
 */
export const flujoCajaModel = {
  /**
   * Obtener tesorería por granja (usa vista vw_tesoreria_general)
   */
  getTesoreriaByGranja: async (granja) => {
    const result = await pool.query(
      `
      SELECT
        fc_mes,
        fc_categoria,
        total_ingreso AS total_ingresos,
        total_egreso AS total_egresos,
        saldo_neto AS saldo
      FROM vw_tesoreria_general
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fc_mes ASC
      `,
      [granja]
    );
    return result.rows;
  },

  /**
   * Obtener movimientos por granja
   */
  findByGranja: async (granja) => {
    const result = await pool.query(
      `
      SELECT
        fi_movimiento_id, fc_granja, fd_fecha, fn_ingreso, fn_egreso,
        fc_descripcion, fc_cuenta, fc_categoria, fc_factura,
        fc_estatus, fc_mes, fd_fecha_registro
      FROM flujo_caja
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fd_fecha DESC
      `,
      [granja]
    );
    return result.rows;
  },

  /**
   * Crear nuevo movimiento
   */
  create: async (data) => {
    const {
      fc_granja,
      fd_fecha,
      fn_ingreso,
      fn_egreso,
      fc_descripcion,
      fc_cuenta,
      fc_categoria,
      fc_factura,
      fc_estatus,
    } = data;

    // Extraer el mes automáticamente
    const fc_mes = fd_fecha?.slice(0, 7);

    const result = await pool.query(
      `INSERT INTO flujo_caja (
        fc_granja, fd_fecha, fn_ingreso, fn_egreso, fc_descripcion,
        fc_cuenta, fc_categoria, fc_factura,
        fc_estatus, fc_mes, fd_fecha_registro
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      RETURNING *`,
      [
        fc_granja,
        fd_fecha,
        fn_ingreso,
        fn_egreso,
        fc_descripcion,
        fc_cuenta,
        fc_categoria,
        fc_factura,
        fc_estatus,
        fc_mes,
      ]
    );

    return result.rows[0];
  },

  /**
   * Actualizar movimiento
   */
  update: async (id, data) => {
    const {
      fc_granja,
      fd_fecha,
      fn_ingreso,
      fn_egreso,
      fc_descripcion,
      fc_cuenta,
      fc_categoria,
      fc_factura,
      fc_estatus,
    } = data;

    const fc_mes = fd_fecha?.slice(0, 7);

    const result = await pool.query(
      `UPDATE flujo_caja
       SET fc_granja=$1, fd_fecha=$2, fn_ingreso=$3, fn_egreso=$4,
           fc_descripcion=$5, fc_cuenta=$6, fc_categoria=$7,
           fc_factura=$8, fc_estatus=$9, fc_mes=$10
       WHERE fi_movimiento_id=$11 RETURNING *`,
      [
        fc_granja,
        fd_fecha,
        fn_ingreso,
        fn_egreso,
        fc_descripcion,
        fc_cuenta,
        fc_categoria,
        fc_factura,
        fc_estatus,
        fc_mes,
        id,
      ]
    );

    return result.rows[0];
  },

  /**
   * Eliminar movimiento
   */
  delete: async (id) => {
    await pool.query("DELETE FROM flujo_caja WHERE fi_movimiento_id=$1", [id]);
    return true;
  },
};

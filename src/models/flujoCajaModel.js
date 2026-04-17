import pool from "../db.js";

class FlujoCajaModel {
  static async getClientes() {
    const result = await pool.query(
      "SELECT fc_nombre AS nombre FROM public.clientes ORDER BY fc_nombre ASC"
    );
    return result.rows;
  }

  static async getProveedores() {
    const result = await pool.query(
      "SELECT razon_social FROM public.proveedores ORDER BY razon_social ASC"
    );
    return result.rows;
  }

  static async getTesoreriaByGranja(granja) {
    const result = await pool.query(
      `SELECT
        fc_mes, fc_categoria,
        total_ingreso AS total_ingresos,
        total_egreso AS total_egresos,
        saldo_neto AS saldo
      FROM vw_tesoreria_general
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fc_mes ASC`,
      [granja]
    );
    return result.rows;
  }

  static async getByGranja(granja) {
    const result = await pool.query(
      `SELECT
        fi_movimiento_id, fc_granja, fd_fecha, fn_ingreso, fn_egreso,
        fc_descripcion, fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto,
        fc_factura, fc_estatus, fc_mes, fd_fecha_registro
      FROM flujo_caja
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fd_fecha DESC`,
      [granja]
    );
    return result.rows;
  }

  static async getCuentaByNombre(nombre) {
    const result = await pool.query(
      "SELECT * FROM public.cuentas WHERE fc_nombre = $1 AND fb_activo = true",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateCuentaSaldo(id, nuevoSaldo) {
    await pool.query(
      "UPDATE public.cuentas SET fn_saldo_actual = $1 WHERE fi_cuenta_id = $2",
      [nuevoSaldo, id]
    );
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO flujo_caja (
        fc_granja, fd_fecha, fn_ingreso, fn_egreso, fc_descripcion,
        fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto,
        fc_factura, fc_estatus, fc_mes, fd_fecha_registro
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
      RETURNING *`,
      [
        data.fc_granja, data.fd_fecha, data.fn_ingreso, data.fn_egreso,
        data.fc_descripcion, data.fc_cuenta, data.fc_categoria,
        data.fc_subcategoria, data.fc_beneficiario, data.fc_noproyecto,
        data.fc_factura, data.fc_estatus, data.fc_mes,
      ]
    );
    return result.rows[0];
  }

  static async createConSaldo(data, cuentaId, nuevoSaldo) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO flujo_caja (
          fc_granja, fd_fecha, fn_ingreso, fn_egreso, fc_descripcion,
          fc_cuenta, fc_categoria, fc_subcategoria,
          fc_beneficiario, fc_noproyecto,
          fc_factura, fc_estatus, fc_mes, fd_fecha_registro
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
        RETURNING *`,
        [
          data.fc_granja, data.fd_fecha, data.fn_ingreso, data.fn_egreso,
          data.fc_descripcion, data.fc_cuenta, data.fc_categoria,
          data.fc_subcategoria, data.fc_beneficiario, data.fc_noproyecto,
          data.fc_factura, data.fc_estatus, data.fc_mes,
        ]
      );

      await client.query(
        "UPDATE public.cuentas SET fn_saldo_actual = $1 WHERE fi_cuenta_id = $2",
        [nuevoSaldo, cuentaId]
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE flujo_caja
       SET fc_granja=$1, fd_fecha=$2, fn_ingreso=$3, fn_egreso=$4,
           fc_descripcion=$5, fc_cuenta=$6, fc_categoria=$7, fc_subcategoria=$8,
           fc_beneficiario=$9, fc_noproyecto=$10,
           fc_factura=$11, fc_estatus=$12, fc_mes=$13
       WHERE fi_movimiento_id=$14 RETURNING *`,
      [
        data.fc_granja, data.fd_fecha, data.fn_ingreso, data.fn_egreso,
        data.fc_descripcion, data.fc_cuenta, data.fc_categoria,
        data.fc_subcategoria, data.fc_beneficiario, data.fc_noproyecto,
        data.fc_factura, data.fc_estatus, data.fc_mes, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM flujo_caja WHERE fi_movimiento_id=$1", [id]);
  }
}

export default FlujoCajaModel;

import pool from "../db.js";

class ClienteModel {
  static async getById(id) {
    const result = await pool.query(
      `SELECT
        c.fi_cliente_id,
        c.fc_razon_social,
        c.fc_rfc,
        c.fi_unidad_negocio_id,
        un.fc_nombre AS unidad_negocio_nombre,
        c.fc_nombre_contacto,
        c.fc_telefono,
        c.fc_correo,
        c.fc_localidad,
        c.fc_estado,
        c.fi_ejecutivo_empleado_id,
        CONCAT_WS(' ', e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno) AS ejecutivo_nombre,
        c.fi_usuario_id
      FROM public.clientes c
      LEFT JOIN public.unidades_negocio un
        ON c.fi_unidad_negocio_id = un.fi_unidad_negocio_id
      LEFT JOIN rrhh.empleados e
        ON c.fi_ejecutivo_empleado_id = e.fi_empleado_id
      WHERE c.fi_cliente_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      `SELECT
        c.fi_cliente_id,
        c.fc_razon_social,
        c.fc_rfc,
        c.fi_unidad_negocio_id,
        un.fc_nombre AS unidad_negocio_nombre,
        c.fc_nombre_contacto,
        c.fc_telefono,
        c.fc_correo,
        c.fc_localidad,
        c.fc_estado,
        c.fi_ejecutivo_empleado_id,
        CONCAT_WS(' ', e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno) AS ejecutivo_nombre,
        c.fi_usuario_id
      FROM public.clientes c
      LEFT JOIN public.unidades_negocio un
        ON c.fi_unidad_negocio_id = un.fi_unidad_negocio_id
      LEFT JOIN rrhh.empleados e
        ON c.fi_ejecutivo_empleado_id = e.fi_empleado_id
      ORDER BY c.fc_razon_social ASC, c.fi_cliente_id ASC`
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO clientes (
        fc_razon_social, fc_rfc, fi_unidad_negocio_id, fc_nombre_contacto,
        fc_telefono, fc_correo, fc_localidad, fc_estado,
        fi_ejecutivo_empleado_id, fi_usuario_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING fi_cliente_id`,
      [
        data.fc_razon_social,
        data.fc_rfc,
        data.fi_unidad_negocio_id,
        data.fc_nombre_contacto,
        data.fc_telefono,
        data.fc_correo,
        data.fc_localidad,
        data.fc_estado,
        data.fi_ejecutivo_empleado_id,
        data.fi_usuario_id,
      ]
    );
    return this.getById(result.rows[0].fi_cliente_id);
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE clientes SET
        fc_razon_social=$1,
        fc_rfc=$2,
        fi_unidad_negocio_id=$3,
        fc_nombre_contacto=$4,
        fc_telefono=$5,
        fc_correo=$6,
        fc_localidad=$7,
        fc_estado=$8,
        fi_ejecutivo_empleado_id=$9,
        fi_usuario_id=$10
      WHERE fi_cliente_id=$11
      RETURNING fi_cliente_id`,
      [
        data.fc_razon_social,
        data.fc_rfc,
        data.fi_unidad_negocio_id,
        data.fc_nombre_contacto,
        data.fc_telefono,
        data.fc_correo,
        data.fc_localidad,
        data.fc_estado,
        data.fi_ejecutivo_empleado_id,
        data.fi_usuario_id,
        id,
      ]
    );
    if (!result.rows[0]) return null;
    return this.getById(result.rows[0].fi_cliente_id);
  }

  static async delete(id) {
    await pool.query("DELETE FROM clientes WHERE fi_cliente_id=$1", [id]);
  }

  static async unidadNegocioActivaExists(id) {
    const result = await pool.query(
      `SELECT 1
      FROM public.unidades_negocio
      WHERE fi_unidad_negocio_id = $1
        AND fb_activo = true`,
      [id]
    );
    return result.rowCount > 0;
  }

  static async empleadoActivoExists(id) {
    const result = await pool.query(
      `SELECT 1
      FROM rrhh.empleados
      WHERE fi_empleado_id = $1
        AND fb_activo = true`,
      [id]
    );
    return result.rowCount > 0;
  }

  static async getEmpleadosActivos() {
    const result = await pool.query(
      `SELECT
        e.fi_empleado_id,
        CONCAT_WS(' ', e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno) AS fc_nombre_completo
      FROM rrhh.empleados e
      WHERE e.fb_activo = true
      ORDER BY fc_nombre_completo ASC`
    );
    return result.rows;
  }
}

export default ClienteModel;

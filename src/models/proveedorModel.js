import pool from "../db.js";

class ProveedorModel {
  static async getById(id) {
    const result = await pool.query(
      `SELECT
        p.fi_proveedor_id,
        p.fc_razon_social,
        p.fc_rfc,
        p.fc_producto_servicio,
        p.fi_unidad_negocio_id,
        un.fc_nombre AS unidad_negocio_nombre,
        p.fc_nombre_contacto,
        p.fc_telefono,
        p.fc_correo,
        p.fc_localidad,
        p.fc_estado,
        p.created_at,
        p.updated_at
      FROM public.proveedores p
      LEFT JOIN public.unidades_negocio un
        ON p.fi_unidad_negocio_id = un.fi_unidad_negocio_id
      WHERE p.fi_proveedor_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query(
      `SELECT
        p.fi_proveedor_id,
        p.fc_razon_social,
        p.fc_rfc,
        p.fc_producto_servicio,
        p.fi_unidad_negocio_id,
        un.fc_nombre AS unidad_negocio_nombre,
        p.fc_nombre_contacto,
        p.fc_telefono,
        p.fc_correo,
        p.fc_localidad,
        p.fc_estado,
        p.created_at,
        p.updated_at
      FROM public.proveedores p
      LEFT JOIN public.unidades_negocio un
        ON p.fi_unidad_negocio_id = un.fi_unidad_negocio_id
      ORDER BY p.fc_razon_social ASC, p.fi_proveedor_id ASC`
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO public.proveedores (
        fc_razon_social, fc_rfc, fc_producto_servicio, fi_unidad_negocio_id,
        fc_nombre_contacto, fc_telefono, fc_correo, fc_localidad, fc_estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING fi_proveedor_id`,
      [
        data.fc_razon_social,
        data.fc_rfc,
        data.fc_producto_servicio,
        data.fi_unidad_negocio_id,
        data.fc_nombre_contacto,
        data.fc_telefono,
        data.fc_correo,
        data.fc_localidad,
        data.fc_estado,
      ]
    );
    return this.getById(result.rows[0].fi_proveedor_id);
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE public.proveedores SET
        fc_razon_social=$1,
        fc_rfc=$2,
        fc_producto_servicio=$3,
        fi_unidad_negocio_id=$4,
        fc_nombre_contacto=$5,
        fc_telefono=$6,
        fc_correo=$7,
        fc_localidad=$8,
        fc_estado=$9
      WHERE fi_proveedor_id=$10
      RETURNING fi_proveedor_id`,
      [
        data.fc_razon_social,
        data.fc_rfc,
        data.fc_producto_servicio,
        data.fi_unidad_negocio_id,
        data.fc_nombre_contacto,
        data.fc_telefono,
        data.fc_correo,
        data.fc_localidad,
        data.fc_estado,
        id,
      ]
    );
    if (!result.rows[0]) return null;
    return this.getById(result.rows[0].fi_proveedor_id);
  }

  static async delete(id) {
    const result = await pool.query(
      "DELETE FROM public.proveedores WHERE fi_proveedor_id=$1",
      [id]
    );
    return result.rowCount > 0;
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
}

export default ProveedorModel;

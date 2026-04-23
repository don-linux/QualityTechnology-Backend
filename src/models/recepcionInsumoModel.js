import pool from "../db.js";

class RecepcionInsumoModel {
    static async getEmpleadosActivos() {
        const result = await pool.query(`
            SELECT
                e.fi_empleado_id,
                CONCAT_WS(' ', e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno) AS fc_nombre_completo
            FROM rrhh.empleados e
            WHERE e.fb_activo = true
            ORDER BY fc_nombre_completo;
        `);
        return result.rows;
    }

    static async getAll(ubicacion = null) {
        let query = "SELECT * FROM recepcion_insumos";
        const params = [];
        if (ubicacion) {
            query += " WHERE ubicacion = $1";
            params.push(ubicacion);
        }
        query += " ORDER BY fi_id DESC";
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fc_proveedor, fc_producto, fc_lote, fc_cantidad,
            fc_unidad_medida, fc_condiciones_entrega, fc_verifico,
            fc_observaciones, fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `INSERT INTO recepcion_insumos
      (fd_fecha, fc_proveedor, fc_producto, fc_lote, fc_cantidad, fc_unidad_medida, fc_condiciones_entrega, fc_verifico, fc_observaciones, fi_usuario_id, ubicacion, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
            [fd_fecha, fc_proveedor, fc_producto, fc_lote, fc_cantidad,
                fc_unidad_medida, fc_condiciones_entrega, fc_verifico,
                fc_observaciones, fi_usuario_id, ubicacion || "medellin"]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha, fc_proveedor, fc_producto, fc_lote, fc_cantidad,
            fc_unidad_medida, fc_condiciones_entrega, fc_verifico,
            fc_observaciones, ubicacion
        } = data;

        await pool.query(
            `UPDATE recepcion_insumos SET
        fd_fecha=$1, fc_proveedor=$2, fc_producto=$3, fc_lote=$4,
        fc_cantidad=$5, fc_unidad_medida=$6, fc_condiciones_entrega=$7,
        fc_verifico=$8, fc_observaciones=$9, ubicacion=$10,
        fd_fecha_modificacion=NOW()
       WHERE fi_id=$11`,
            [fd_fecha, fc_proveedor, fc_producto, fc_lote, fc_cantidad,
                fc_unidad_medida, fc_condiciones_entrega, fc_verifico,
                fc_observaciones, ubicacion || "medellin", id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM recepcion_insumos WHERE fi_id=$1", [id]);
    }

    static async deleteByUbicacion(ubicacion) {
        await pool.query("DELETE FROM recepcion_insumos WHERE ubicacion=$1", [ubicacion]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM recepcion_insumos");
    }
}

export default RecepcionInsumoModel;

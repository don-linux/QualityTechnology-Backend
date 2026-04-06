import pool from "../db.js";

class DocumentoEmpleadoModel {

    static async getByEmpleado(empleadoId) {
        const result = await pool.query(`
            SELECT de.*, td.fc_nombre AS tipo_nombre, td.fb_obligatorio
            FROM rrhh.documentos_empleado de
            JOIN rrhh.tipos_documento td ON de.fi_tipo_documento_id = td.fi_tipo_documento_id
            WHERE de.fi_empleado_id = $1
            ORDER BY td.fc_nombre;
        `, [empleadoId]);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT * FROM rrhh.documentos_empleado WHERE fi_documento_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async getEmpleadoIdByUsuario(usuarioId) {
        const result = await pool.query(`
            SELECT fi_empleado_id FROM rrhh.empleados WHERE fi_usuario_id = $1;
        `, [usuarioId]);
        return result.rows[0]?.fi_empleado_id || null;
    }

    static async upsert({ fi_empleado_id, fi_tipo_documento_id, fc_ruta_archivo, fc_nombre_original }) {
        const result = await pool.query(`
            INSERT INTO rrhh.documentos_empleado
                (fi_empleado_id, fi_tipo_documento_id, fc_ruta_archivo, fc_nombre_original)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (fi_empleado_id, fi_tipo_documento_id)
            DO UPDATE SET
                fc_ruta_archivo = EXCLUDED.fc_ruta_archivo,
                fc_nombre_original = EXCLUDED.fc_nombre_original,
                fd_fecha_carga = CURRENT_DATE
            RETURNING *;
        `, [fi_empleado_id, fi_tipo_documento_id, fc_ruta_archivo, fc_nombre_original]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(`
            DELETE FROM rrhh.documentos_empleado
            WHERE fi_documento_id = $1
            RETURNING *;
        `, [id]);
        return result.rows[0];
    }
}

export default DocumentoEmpleadoModel;

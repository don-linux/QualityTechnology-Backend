import pool from "../db.js";

class ActaAdministrativaModel {
    static async getByEmpleado(empleadoId) {
        const result = await pool.query(`
            SELECT *
            FROM rrhh.actas_administrativas
            WHERE fi_empleado_id = $1
            ORDER BY fd_fecha DESC, fi_acta_id DESC;
        `, [empleadoId]);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT *
            FROM rrhh.actas_administrativas
            WHERE fi_acta_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async create({ fi_empleado_id, fc_motivo, fd_fecha, fc_ruta_archivo, fc_nombre_original }) {
        const result = await pool.query(`
            INSERT INTO rrhh.actas_administrativas
                (fi_empleado_id, fc_motivo, fd_fecha, fc_ruta_archivo, fc_nombre_original)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `, [fi_empleado_id, fc_motivo, fd_fecha, fc_ruta_archivo, fc_nombre_original]);
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query(`
            DELETE FROM rrhh.actas_administrativas
            WHERE fi_acta_id = $1
            RETURNING *;
        `, [id]);
        return result.rows[0];
    }
}

export default ActaAdministrativaModel;

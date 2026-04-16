import pool from "../db.js";

class BitacoraBanoModel {
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

    static async getAll() {
        const result = await pool.query("SELECT * FROM banos ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fc_mes, fc_dia, fc_tipo_banio, fc_regadera,
            fc_realizo, fc_observaciones, fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `INSERT INTO banos
        (fc_mes, fc_dia, fc_tipo_banio, fc_regadera, fc_realizo, fc_observaciones, fi_usuario_id, ubicacion, fd_fecha_registro)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
            [fc_mes, fc_dia, fc_tipo_banio, fc_regadera, fc_realizo, fc_observaciones, fi_usuario_id, ubicacion]
        );
    }

    static async update(id, data) {
        const {
            fc_mes, fc_dia, fc_tipo_banio, fc_regadera,
            fc_realizo, fc_observaciones, ubicacion
        } = data;

        await pool.query(
            `UPDATE banos SET
      fc_mes=$1, fc_dia=$2, fc_tipo_banio=$3,
      fc_regadera=$4, fc_realizo=$5, fc_observaciones=$6,
      ubicacion=$7, fd_fecha_modificacion=NOW()
      WHERE fi_id=$8`,
            [fc_mes, fc_dia, fc_tipo_banio, fc_regadera, fc_realizo, fc_observaciones, ubicacion, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM banos WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM banos");
    }
}

export default BitacoraBanoModel;

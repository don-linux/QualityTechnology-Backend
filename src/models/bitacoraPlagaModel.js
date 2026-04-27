import pool from "../db.js";

class BitacoraPlagaModel {
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
        let query = "SELECT * FROM plagas";
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
            fd_fecha, fc_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno,
            fc_observaciones, fc_verifico, unidad_produccion, ubicacion, fi_usuario_id
        } = data;

        await pool.query(
            `INSERT INTO plagas 
        (fd_fecha, fc_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno, 
         fc_observaciones, fc_verifico, unidad_produccion, ubicacion, fi_usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [fd_fecha, fc_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno,
                fc_observaciones, fc_verifico, unidad_produccion, ubicacion || "medellin", fi_usuario_id]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha, fc_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno,
            fc_observaciones, fc_verifico, unidad_produccion, ubicacion
        } = data;

        await pool.query(
            `UPDATE plagas SET
        fd_fecha=$1, fc_num_trampa=$2, tipo_trampa=$3, fc_hallazgo=$4,
        fc_malla=$5, fc_veneno=$6, fc_observaciones=$7, fc_verifico=$8,
        unidad_produccion=$9, ubicacion=$10
       WHERE fi_id=$11`,
            [fd_fecha, fc_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno,
                fc_observaciones, fc_verifico, unidad_produccion, ubicacion || "medellin", id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM plagas WHERE fi_id=$1", [id]);
    }

    static async deleteByUbicacion(ubicacion) {
        await pool.query("DELETE FROM plagas WHERE ubicacion=$1", [ubicacion]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM plagas");
    }
}

export default BitacoraPlagaModel;

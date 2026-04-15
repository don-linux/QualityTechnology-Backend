import pool from "../db.js";

class BitacoraParametroModel {
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
        const result = await pool.query("SELECT * FROM parametros ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
            fn_amonio, fn_nitritos, fn_nitratos, fc_responsable, fi_usuario_id,
            ubicacion
        } = data;

        await pool.query(
            `INSERT INTO parametros
      (fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
       fn_amonio, fn_nitritos, fn_nitratos, fc_responsable,
       fi_usuario_id, ubicacion, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
            [fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable || null, fi_usuario_id,
                ubicacion || null]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
            fn_amonio, fn_nitritos, fn_nitratos, fc_responsable, ubicacion
        } = data;

        await pool.query(
            `UPDATE parametros SET
      fd_fecha=$1, fn_num_estanque=$2, fn_oxigeno=$3, fn_temperatura=$4,
      fn_ph=$5, fn_amonio=$6, fn_nitritos=$7, fn_nitratos=$8,
      fc_responsable=$9, ubicacion=$10, fd_fecha_modificacion=NOW()
      WHERE fi_id=$11`,
            [fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable || null, ubicacion || null, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM parametros WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM parametros");
    }
}

export default BitacoraParametroModel;

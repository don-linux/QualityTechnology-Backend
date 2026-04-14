import pool from "../db.js";

class BitacoraRecambioModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM recambios ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2,
            fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5,
            fd_fecha6, fc_tipo6, fc_responsable, fi_usuario_id, ubicacion
        } = data;
        const numInstalacion =
            fn_num_instalacion === "" || fn_num_instalacion === null || fn_num_instalacion === undefined
                ? null
                : Number(fn_num_instalacion);
        const safeNumInstalacion = Number.isNaN(numInstalacion) ? null : numInstalacion;

        await pool.query(
            `INSERT INTO recambios
      (fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2,
       fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5,
       fd_fecha6, fc_tipo6, fc_responsable, fi_usuario_id, ubicacion, fd_fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())`,
            [
                fc_mes,
                safeNumInstalacion,
                fd_fecha1 || null,
                fc_tipo1 || null,
                fd_fecha2 || null,
                fc_tipo2 || null,
                fd_fecha3 || null,
                fc_tipo3 || null,
                fd_fecha4 || null,
                fc_tipo4 || null,
                fd_fecha5 || null,
                fc_tipo5 || null,
                fd_fecha6 || null,
                fc_tipo6 || null,
                fc_responsable || null,
                fi_usuario_id,
                ubicacion || null
            ]
        );
    }

    static async update(id, data) {
        const {
            fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2,
            fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5,
            fd_fecha6, fc_tipo6, fc_responsable, ubicacion
        } = data;
        const numInstalacion =
            fn_num_instalacion === "" || fn_num_instalacion === null || fn_num_instalacion === undefined
                ? null
                : Number(fn_num_instalacion);
        const safeNumInstalacion = Number.isNaN(numInstalacion) ? null : numInstalacion;

        await pool.query(
            `UPDATE recambios SET
        fc_mes=$1, fn_num_instalacion=$2,
        fd_fecha1=$3, fc_tipo1=$4, fd_fecha2=$5, fc_tipo2=$6,
        fd_fecha3=$7, fc_tipo3=$8, fd_fecha4=$9, fc_tipo4=$10,
        fd_fecha5=$11, fc_tipo5=$12, fd_fecha6=$13, fc_tipo6=$14,
        fc_responsable=$15, ubicacion=$16, fd_fecha_modificacion=NOW()
       WHERE fi_id=$17`,
            [
                fc_mes,
                safeNumInstalacion,
                fd_fecha1 || null,
                fc_tipo1 || null,
                fd_fecha2 || null,
                fc_tipo2 || null,
                fd_fecha3 || null,
                fc_tipo3 || null,
                fd_fecha4 || null,
                fc_tipo4 || null,
                fd_fecha5 || null,
                fc_tipo5 || null,
                fd_fecha6 || null,
                fc_tipo6 || null,
                fc_responsable || null,
                ubicacion || null,
                id
            ]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM recambios WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM recambios");
    }
}

export default BitacoraRecambioModel;

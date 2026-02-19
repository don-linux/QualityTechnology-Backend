import pool from "../db.js";

class BitacoraAlimentacionModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM ceiba_alimentacion ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra,
            fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad,
            fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fi_usuario_id
        } = data;

        const result = await pool.query(
            `
      INSERT INTO ceiba_alimentacion
      (fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra,
       fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad,
       fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fi_usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING fi_id
      `,
            [
                fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra,
                fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad,
                fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fi_usuario_id
            ]
        );
        return result.rows[0].fi_id;
    }

    static async update(id, data) {
        const {
            fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra,
            fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad,
            fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fi_usuario_id
        } = data;

        await pool.query(
            `
      UPDATE ceiba_alimentacion SET
      fc_mes=$1, fn_num_instalacion=$2, fn_peso_promedio_entrada=$3, fd_fecha_siembra=$4,
      fc_origen_alevines=$5, fd_fecha=$6, fn_total_alimento_kg=$7, fn_mortalidad=$8,
      fc_recambio_agua=$9, fn_temp_agua=$10, fn_amonio=$11, fn_ph=$12,
      fc_observaciones=$13, fi_usuario_id=$14
      WHERE fi_id=$15
      `,
            [
                fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra,
                fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad,
                fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fi_usuario_id,
                id
            ]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM ceiba_alimentacion WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM ceiba_alimentacion");
    }
}

export default BitacoraAlimentacionModel;

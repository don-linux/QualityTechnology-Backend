import pool from "../db.js";

class BitacoraParametroModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM medellin_parametros ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
            fn_amonio, fn_nitritos, fn_nitratos, fc_responsable, fi_usuario_id
        } = data;

        await pool.query(
            `INSERT INTO medellin_parametros
      (fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
       fn_amonio, fn_nitritos, fn_nitratos, fc_responsable,
       fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
            [fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable || null, fi_usuario_id]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
            fn_amonio, fn_nitritos, fn_nitratos, fc_responsable
        } = data;

        await pool.query(
            `UPDATE medellin_parametros SET
      fd_fecha=$1, fn_num_estanque=$2, fn_oxigeno=$3, fn_temperatura=$4,
      fn_ph=$5, fn_amonio=$6, fn_nitritos=$7, fn_nitratos=$8,
      fc_responsable=$9, fd_fecha_modificacion=NOW()
      WHERE fi_id=$10`,
            [fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable || null, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM medellin_parametros WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM medellin_parametros");
    }
}

export default BitacoraParametroModel;

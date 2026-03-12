import pool from "../db.js";

class BitacoraBanoModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM banos ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera,
            fc_realizo, fc_firma, fc_observaciones, fi_usuario_id
        } = data;

        await pool.query(
            `INSERT INTO banos
        (fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id, fd_fecha_registro)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
            [fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id]
        );
    }

    static async update(id, data) {
        const {
            fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera,
            fc_realizo, fc_firma, fc_observaciones
        } = data;

        await pool.query(
            `UPDATE banos SET
      fc_mes=$1, fc_dia=$2, fc_banio_hombres=$3, fc_banio_mujeres=$4,
      fc_regadera=$5, fc_realizo=$6, fc_firma=$7, fc_observaciones=$8,
      fd_fecha_modificacion=NOW()
      WHERE fi_id=$9`,
            [fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, id]
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

import pool from "../db.js";

class BitacoraVisitaModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM visitas ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones,
            fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `
      INSERT INTO visitas
      (fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones, fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
            [fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones,
                fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion || null]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones,
            fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `
      UPDATE visitas SET
        fd_fecha=$1, fc_nombre_completo=$2, fc_origen=$3, fc_motivo=$4,
        fc_observaciones=$5, fc_foto_identificacion=$6, fd_entrada=$7,
        fd_salida=$8, fi_usuario_id=$9, ubicacion=$10
      WHERE fi_id=$11
      `,
            [fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones,
                fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id,
                ubicacion || null, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM visitas WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM visitas");
    }
}

export default BitacoraVisitaModel;

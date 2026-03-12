import pool from "../db.js";

class BitacoraMedicamentoModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM medicamentos ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
            fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis,
            fc_responsable, fi_usuario_id
        } = data;

        await pool.query(
            `INSERT INTO medicamentos
      (fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
       fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis,
       fc_responsable, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
            [fd_fecha_hora, fn_num_estanque, fc_diagnosis || null, fc_tratamiento || null,
                fc_dosis || null, fc_forma_aplicacion || null, fd_fecha_ultima_dosis || null,
                fc_responsable || null, fi_usuario_id]
        );
    }

    static async update(id, data) {
        const {
            fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
            fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis,
            fc_responsable
        } = data;

        await pool.query(
            `UPDATE medicamentos SET
      fd_fecha_hora=$1, fn_num_estanque=$2, fc_diagnosis=$3, fc_tratamiento=$4,
      fc_dosis=$5, fc_forma_aplicacion=$6, fd_fecha_ultima_dosis=$7,
      fc_responsable=$8, fd_fecha_modificacion=NOW()
      WHERE fi_id=$9`,
            [fd_fecha_hora || null, fn_num_estanque, fc_diagnosis || null, fc_tratamiento || null,
            fc_dosis || null, fc_forma_aplicacion || null, fd_fecha_ultima_dosis || null,
            fc_responsable || null, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM medicamentos WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM medicamentos");
    }
}

export default BitacoraMedicamentoModel;

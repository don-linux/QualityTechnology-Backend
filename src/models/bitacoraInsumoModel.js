import pool from "../db.js";

class BitacoraInsumoModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM insumos ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion,
            fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id,
            ubicacion
        } = data;

        const result = await pool.query(
            `
      INSERT INTO insumos 
      (fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, 
       fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, ubicacion,
       fd_fecha_registro, fi_usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW(), $9)
      RETURNING fi_id
      `,
            [
                fd_fecha || null,
                fc_cantidad_udm || null,
                fc_num_lote || null,
                fc_descripcion || null,
                fc_observaciones || null,
                fc_encargado_entrega || null,
                fc_encargado_recepcion || null,
                ubicacion || null,
                fi_usuario_id
            ]
        );
        return result.rows[0].fi_id;
    }

    static async update(id, data) {
        const {
            fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion,
            fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id,
            ubicacion
        } = data;

                await pool.query(
                        `
            UPDATE insumos SET
                fd_fecha=$1, fc_cantidad_udm=$2, fc_num_lote=$3, fc_descripcion=$4,
                fc_observaciones=$5, fc_encargado_entrega=$6, fc_encargado_recepcion=$7,
                fd_fecha_modificacion=NOW(), fi_usuario_id=$8, ubicacion=$9
            WHERE fi_id=$10
            `,
                        [
                                fd_fecha || null,
                                fc_cantidad_udm || null,
                                fc_num_lote || null,
                                fc_descripcion || null,
                                fc_observaciones || null,
                                fc_encargado_entrega || null,
                                fc_encargado_recepcion || null,
                                fi_usuario_id,
                                ubicacion || null,
                                id
                        ]
                );
    }

    static async delete(id) {
        await pool.query("DELETE FROM insumos WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM insumos");
    }
}

export default BitacoraInsumoModel;

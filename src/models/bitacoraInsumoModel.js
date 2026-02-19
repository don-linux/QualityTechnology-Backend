import pool from "../db.js";

class BitacoraInsumoModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM ceiba_insumos ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion,
            fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id
        } = data;

        const result = await pool.query(
            `
      INSERT INTO ceiba_insumos 
      (fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, 
       fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, 
       fd_fecha_registro, fi_usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), $8)
      RETURNING fi_id
      `,
            [fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id]
        );
        return result.rows[0].fi_id;
    }

    static async update(id, data) {
        const {
            fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion,
            fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id
        } = data;

        await pool.query(
            `
      UPDATE ceiba_insumos SET
        fd_fecha=$1, fc_cantidad_udm=$2, fc_num_lote=$3, fc_descripcion=$4,
        fc_observaciones=$5, fc_encargado_entrega=$6, fc_encargado_recepcion=$7,
        fd_fecha_modificacion=NOW(), fi_usuario_id=$8
      WHERE fi_id=$9
      `,
            [fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fi_usuario_id, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM ceiba_insumos WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM ceiba_insumos");
    }
}

export default BitacoraInsumoModel;

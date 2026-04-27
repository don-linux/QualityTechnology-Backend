import pool from "../db.js";

class BitacoraInventarioModel {
    static async getAll() {
        const result = await pool.query("SELECT * FROM inventario_alevines ORDER BY fi_id DESC");
        return result.rows;
    }

    static async create(data) {
        const {
            fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
            fd_fecha_siembra, fd_fecha_salida_hormonado, fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `INSERT INTO inventario_alevines
      (fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
       fd_fecha_siembra, fd_fecha_salida_hormonado, fi_usuario_id, ubicacion)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [fn_num_instalacion, fn_cantidad, fn_talla, fc_lote || null, fc_observacion || null,
                fd_fecha_siembra || null, fd_fecha_salida_hormonado || null, fi_usuario_id, ubicacion || null]
        );
    }

    static async update(id, data) {
        const {
            fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
            fd_fecha_siembra, fd_fecha_salida_hormonado, ubicacion
        } = data;

        await pool.query(
            `UPDATE inventario_alevines SET
        fn_num_instalacion=$1, fn_cantidad=$2, fn_talla=$3,
        fc_lote=$4, fc_observacion=$5,
        fd_fecha_siembra=$6, fd_fecha_salida_hormonado=$7,
        ubicacion=$8
       WHERE fi_id=$9`,
            [fn_num_instalacion, fn_cantidad, fn_talla, fc_lote || null, fc_observacion || null,
                fd_fecha_siembra || null, fd_fecha_salida_hormonado || null, ubicacion || null, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM inventario_alevines WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM inventario_alevines");
    }
}

export default BitacoraInventarioModel;

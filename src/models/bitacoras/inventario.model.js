import pool from "../../config/database.js";

/**
 * Modelo de Inventario Alevines (Medellín)
 * Tabla: medellin_inventario_alevines
 */
export const inventarioModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM medellin_inventario_alevines ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM medellin_inventario_alevines WHERE fi_id = $1",
            [id]
        );
        return result.rows[0];
    },

    /**
     * Crear nuevo registro
     */
    create: async (data) => {
        const {
            fn_num_instalacion,
            fn_cantidad,
            fn_talla,
            fc_lote,
            fc_observacion,
            fd_fecha_siembra,
            fd_fecha_salida_hormonado,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO medellin_inventario_alevines
      (fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
       fd_fecha_siembra, fd_fecha_salida_hormonado, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      RETURNING *`,
            [
                fn_num_instalacion,
                fn_cantidad,
                fn_talla,
                fc_lote,
                fc_observacion,
                fd_fecha_siembra,
                fd_fecha_salida_hormonado,
                fi_usuario_id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Actualizar registro
     */
    update: async (id, data) => {
        const {
            fn_num_instalacion,
            fn_cantidad,
            fn_talla,
            fc_lote,
            fc_observacion,
            fd_fecha_siembra,
            fd_fecha_salida_hormonado,
        } = data;

        const result = await pool.query(
            `UPDATE medellin_inventario_alevines SET
        fn_num_instalacion=$1, fn_cantidad=$2, fn_talla=$3,
        fc_lote=$4, fc_observacion=$5,
        fd_fecha_siembra=$6, fd_fecha_salida_hormonado=$7,
        fd_fecha_modificacion=NOW()
      WHERE fi_id=$8
      RETURNING *`,
            [
                fn_num_instalacion,
                fn_cantidad,
                fn_talla,
                fc_lote,
                fc_observacion,
                fd_fecha_siembra,
                fd_fecha_salida_hormonado,
                id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar registro
     */
    delete: async (id) => {
        await pool.query(
            "DELETE FROM medellin_inventario_alevines WHERE fi_id = $1",
            [id]
        );
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM medellin_inventario_alevines");
        return true;
    },
};

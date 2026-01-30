import pool from "../../config/database.js";

/**
 * Modelo de Insumos (Ceiba)
 * Tabla: ceiba_insumos
 */
export const insumosModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM ceiba_insumos ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM ceiba_insumos WHERE fi_id = $1",
            [id]
        );
        return result.rows[0];
    },

    /**
     * Crear nuevo registro
     */
    create: async (data) => {
        const {
            fd_fecha,
            fc_cantidad_udm,
            fc_num_lote,
            fc_descripcion,
            fc_observaciones,
            fc_encargado_entrega,
            fc_encargado_recepcion,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO ceiba_insumos 
      (fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, 
       fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, 
       fd_fecha_registro, fi_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
      RETURNING *`,
            [
                fd_fecha,
                fc_cantidad_udm,
                fc_num_lote,
                fc_descripcion,
                fc_observaciones,
                fc_encargado_entrega,
                fc_encargado_recepcion,
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
            fd_fecha,
            fc_cantidad_udm,
            fc_num_lote,
            fc_descripcion,
            fc_observaciones,
            fc_encargado_entrega,
            fc_encargado_recepcion,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `UPDATE ceiba_insumos SET
        fd_fecha=$1,
        fc_cantidad_udm=$2,
        fc_num_lote=$3,
        fc_descripcion=$4,
        fc_observaciones=$5,
        fc_encargado_entrega=$6,
        fc_encargado_recepcion=$7,
        fd_fecha_modificacion=NOW(),
        fi_usuario_id=$8
      WHERE fi_id=$9
      RETURNING *`,
            [
                fd_fecha,
                fc_cantidad_udm,
                fc_num_lote,
                fc_descripcion,
                fc_observaciones,
                fc_encargado_entrega,
                fc_encargado_recepcion,
                fi_usuario_id,
                id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar registro
     */
    delete: async (id) => {
        await pool.query("DELETE FROM ceiba_insumos WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM ceiba_insumos");
        return true;
    },
};

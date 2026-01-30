import pool from "../../config/database.js";

/**
 * Modelo de Recepción de Insumos (General)
 * Tabla: recepcion_insumos
 */
export const recepcionInsumosModel = {
    /**
     * Obtener todos los registros, opcionalmente filtrados por ubicación
     */
    findAll: async (ubicacion = null) => {
        let query = "SELECT * FROM recepcion_insumos";
        const params = [];

        if (ubicacion) {
            query += " WHERE ubicacion = $1";
            params.push(ubicacion);
        }

        query += " ORDER BY fi_id DESC";

        const result = await pool.query(query, params);
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM recepcion_insumos WHERE fi_id = $1",
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
            fc_proveedor,
            fc_producto,
            fc_lote,
            fn_cantidad,
            fc_unidad_medida,
            fc_condiciones_entrega,
            fc_verifico,
            fc_observaciones,
            fi_usuario_id,
            ubicacion,
        } = data;

        const result = await pool.query(
            `INSERT INTO recepcion_insumos
      (fd_fecha, fc_proveedor, fc_producto, fc_lote, fn_cantidad, 
       fc_unidad_medida, fc_condiciones_entrega, fc_verifico, 
       fc_observaciones, fi_usuario_id, ubicacion, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      RETURNING *`,
            [
                fd_fecha,
                fc_proveedor,
                fc_producto,
                fc_lote,
                fn_cantidad,
                fc_unidad_medida,
                fc_condiciones_entrega,
                fc_verifico,
                fc_observaciones,
                fi_usuario_id || 1,
                ubicacion || "medellin",
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
            fc_proveedor,
            fc_producto,
            fc_lote,
            fn_cantidad,
            fc_unidad_medida,
            fc_condiciones_entrega,
            fc_verifico,
            fc_observaciones,
            ubicacion,
        } = data;

        const result = await pool.query(
            `UPDATE recepcion_insumos SET
        fd_fecha=$1, fc_proveedor=$2, fc_producto=$3, fc_lote=$4,
        fn_cantidad=$5, fc_unidad_medida=$6, fc_condiciones_entrega=$7,
        fc_verifico=$8, fc_observaciones=$9, ubicacion=$10,
        fd_fecha_modificacion=NOW()
      WHERE fi_id=$11
      RETURNING *`,
            [
                fd_fecha,
                fc_proveedor,
                fc_producto,
                fc_lote,
                fn_cantidad,
                fc_unidad_medida,
                fc_condiciones_entrega,
                fc_verifico,
                fc_observaciones,
                ubicacion || "medellin",
                id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar registro
     */
    delete: async (id) => {
        await pool.query("DELETE FROM recepcion_insumos WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros (opcionalmente por ubicación)
     */
    deleteAll: async (ubicacion = null) => {
        if (ubicacion) {
            await pool.query("DELETE FROM recepcion_insumos WHERE ubicacion = $1", [
                ubicacion,
            ]);
        } else {
            await pool.query("DELETE FROM recepcion_insumos");
        }
        return true;
    },
};

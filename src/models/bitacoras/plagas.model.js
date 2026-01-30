import pool from "../../config/database.js";

/**
 * Modelo de Plagas (General)
 * Tabla: plagas
 */
export const plagasModel = {
    /**
     * Obtener todos los registros, opcionalmente filtrados por ubicación
     */
    findAll: async (ubicacion = null) => {
        let query = "SELECT * FROM plagas";
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
        const result = await pool.query("SELECT * FROM plagas WHERE fi_id = $1", [
            id,
        ]);
        return result.rows[0];
    },

    /**
     * Crear nuevo registro
     */
    create: async (data) => {
        const {
            fd_fecha,
            fn_num_trampa,
            tipo_trampa,
            fc_hallazgo,
            fc_malla,
            fc_veneno,
            fc_observaciones,
            fc_verifico,
            unidad_produccion,
            ubicacion,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO plagas 
        (fd_fecha, fn_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno, 
         fc_observaciones, fc_verifico, unidad_produccion, ubicacion, fi_usuario_id, fd_fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       RETURNING *`,
            [
                fd_fecha,
                fn_num_trampa,
                tipo_trampa,
                fc_hallazgo,
                fc_malla,
                fc_veneno,
                fc_observaciones,
                fc_verifico,
                unidad_produccion,
                ubicacion || "medellin",
                fi_usuario_id || 1,
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
            fn_num_trampa,
            tipo_trampa,
            fc_hallazgo,
            fc_malla,
            fc_veneno,
            fc_observaciones,
            fc_verifico,
            unidad_produccion,
            ubicacion,
        } = data;

        const result = await pool.query(
            `UPDATE plagas SET
        fd_fecha=$1, fn_num_trampa=$2, tipo_trampa=$3, fc_hallazgo=$4,
        fc_malla=$5, fc_veneno=$6, fc_observaciones=$7, fc_verifico=$8,
        unidad_produccion=$9, ubicacion=$10, fd_fecha_modificacion=NOW()
       WHERE fi_id=$11
       RETURNING *`,
            [
                fd_fecha,
                fn_num_trampa,
                tipo_trampa,
                fc_hallazgo,
                fc_malla,
                fc_veneno,
                fc_observaciones,
                fc_verifico,
                unidad_produccion,
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
        await pool.query("DELETE FROM plagas WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros (opcionalmente por ubicación)
     */
    deleteAll: async (ubicacion = null) => {
        if (ubicacion) {
            await pool.query("DELETE FROM plagas WHERE ubicacion = $1", [ubicacion]);
        } else {
            await pool.query("DELETE FROM plagas");
        }
        return true;
    },
};

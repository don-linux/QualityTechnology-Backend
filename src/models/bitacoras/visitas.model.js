import pool from "../../config/database.js";

/**
 * Modelo de Visitas (General)
 * Tabla: visitas
 */
export const visitasModel = {
    /**
     * Obtener todos los registros, filtrados opcionalmente por ubicación
     * (Nota: El endpoint legacy no filtraba, pero agregamos soporte por consistencia)
     */
    findAll: async (ubicacion = null) => {
        let query = "SELECT * FROM visitas";
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
        const result = await pool.query("SELECT * FROM visitas WHERE fi_id = $1", [
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
            fc_nombre_completo,
            fc_origen,
            fc_motivo,
            fc_observaciones,
            fc_foto_identificacion,
            fd_entrada,
            fd_salida,
            fi_usuario_id,
            ubicacion,
        } = data;

        const result = await pool.query(
            `INSERT INTO visitas
      (fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones, 
       fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
            [
                fd_fecha,
                fc_nombre_completo,
                fc_origen,
                fc_motivo,
                fc_observaciones,
                fc_foto_identificacion,
                fd_entrada,
                fd_salida,
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
            fc_nombre_completo,
            fc_origen,
            fc_motivo,
            fc_observaciones,
            fc_foto_identificacion,
            fd_entrada,
            fd_salida,
            fi_usuario_id,
            ubicacion,
        } = data;

        const result = await pool.query(
            `UPDATE visitas SET
        fd_fecha=$1, fc_nombre_completo=$2, fc_origen=$3, fc_motivo=$4,
        fc_observaciones=$5, fc_foto_identificacion=$6, fd_entrada=$7,
        fd_salida=$8, fi_usuario_id=$9, ubicacion=$10
      WHERE fi_id=$11
      RETURNING *`,
            [
                fd_fecha,
                fc_nombre_completo,
                fc_origen,
                fc_motivo,
                fc_observaciones,
                fc_foto_identificacion,
                fd_entrada,
                fd_salida,
                fi_usuario_id,
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
        await pool.query("DELETE FROM visitas WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM visitas");
        return true;
    },
};

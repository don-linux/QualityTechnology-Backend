import pool from "../../config/database.js";

/**
 * Modelo de Recambios (Medellín)
 * Tabla: medellin_recambios
 */
export const recambiosModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM medellin_recambios ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM medellin_recambios WHERE fi_id = $1",
            [id]
        );
        return result.rows[0];
    },

    /**
     * Crear nuevo registro
     */
    create: async (data) => {
        const {
            fc_mes,
            fn_num_instalacion,
            fd_fecha1,
            fc_tipo1,
            fd_fecha2,
            fc_tipo2,
            fd_fecha3,
            fc_tipo3,
            fd_fecha4,
            fc_tipo4,
            fd_fecha5,
            fc_tipo5,
            fd_fecha6,
            fc_tipo6,
            fc_responsable,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO medellin_recambios
      (fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2,
       fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5,
       fd_fecha6, fc_tipo6, fc_responsable, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
      RETURNING *`,
            [
                fc_mes,
                fn_num_instalacion,
                fd_fecha1,
                fc_tipo1,
                fd_fecha2,
                fc_tipo2,
                fd_fecha3,
                fc_tipo3,
                fd_fecha4,
                fc_tipo4,
                fd_fecha5,
                fc_tipo5,
                fd_fecha6,
                fc_tipo6,
                fc_responsable,
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
            fc_mes,
            fn_num_instalacion,
            fd_fecha1,
            fc_tipo1,
            fd_fecha2,
            fc_tipo2,
            fd_fecha3,
            fc_tipo3,
            fd_fecha4,
            fc_tipo4,
            fd_fecha5,
            fc_tipo5,
            fd_fecha6,
            fc_tipo6,
            fc_responsable,
        } = data;

        const result = await pool.query(
            `UPDATE medellin_recambios SET
        fc_mes=$1, fn_num_instalacion=$2,
        fd_fecha1=$3, fc_tipo1=$4, fd_fecha2=$5, fc_tipo2=$6,
        fd_fecha3=$7, fc_tipo3=$8, fd_fecha4=$9, fc_tipo4=$10,
        fd_fecha5=$11, fc_tipo5=$12, fd_fecha6=$13, fc_tipo6=$14,
        fc_responsable=$15, fd_fecha_modificacion=NOW()
      WHERE fi_id=$16
      RETURNING *`,
            [
                fc_mes,
                fn_num_instalacion,
                fd_fecha1,
                fc_tipo1,
                fd_fecha2,
                fc_tipo2,
                fd_fecha3,
                fc_tipo3,
                fd_fecha4,
                fc_tipo4,
                fd_fecha5,
                fc_tipo5,
                fd_fecha6,
                fc_tipo6,
                fc_responsable,
                id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar registro
     */
    delete: async (id) => {
        await pool.query("DELETE FROM medellin_recambios WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM medellin_recambios");
        return true;
    },
};

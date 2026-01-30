import pool from "../../config/database.js";

/**
 * Modelo de Baños (Medellín)
 * Tabla: medellin_banos
 */
export const banosModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM medellin_banos ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM medellin_banos WHERE fi_id = $1",
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
            fc_dia,
            fc_banio_hombres,
            fc_banio_mujeres,
            fc_regadera,
            fc_realizo,
            fc_firma,
            fc_observaciones,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO medellin_banos
      (fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *`,
            [
                fc_mes,
                fc_dia,
                fc_banio_hombres,
                fc_banio_mujeres,
                fc_regadera,
                fc_realizo,
                fc_firma,
                fc_observaciones,
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
            fc_dia,
            fc_banio_hombres,
            fc_banio_mujeres,
            fc_regadera,
            fc_realizo,
            fc_firma,
            fc_observaciones,
        } = data;

        const result = await pool.query(
            `UPDATE medellin_banos SET
      fc_mes=$1, fc_dia=$2, fc_banio_hombres=$3, fc_banio_mujeres=$4,
      fc_regadera=$5, fc_realizo=$6, fc_firma=$7, fc_observaciones=$8,
      fd_fecha_modificacion=NOW()
      WHERE fi_id=$9
      RETURNING *`,
            [
                fc_mes,
                fc_dia,
                fc_banio_hombres,
                fc_banio_mujeres,
                fc_regadera,
                fc_realizo,
                fc_firma,
                fc_observaciones,
                id,
            ]
        );
        return result.rows[0];
    },

    /**
     * Eliminar registro
     */
    delete: async (id) => {
        await pool.query("DELETE FROM medellin_banos WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM medellin_banos");
        return true;
    },
};

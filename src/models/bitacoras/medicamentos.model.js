import pool from "../../config/database.js";

/**
 * Modelo de Medicamentos (Medellín)
 * Tabla: medellin_medicamentos
 */
export const medicamentosModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM medellin_medicamentos ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM medellin_medicamentos WHERE fi_id = $1",
            [id]
        );
        return result.rows[0];
    },

    /**
     * Crear nuevo registro
     */
    create: async (data) => {
        const {
            fd_fecha_hora,
            fn_num_estanque,
            fc_diagnosis,
            fc_tratamiento,
            fc_dosis,
            fc_forma_aplicacion,
            fd_fecha_ultima_dosis,
            fc_responsable,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO medellin_medicamentos
      (fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
       fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis,
       fc_responsable, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *`,
            [
                fd_fecha_hora,
                fn_num_estanque,
                fc_diagnosis,
                fc_tratamiento,
                fc_dosis,
                fc_forma_aplicacion,
                fd_fecha_ultima_dosis,
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
            fd_fecha_hora,
            fn_num_estanque,
            fc_diagnosis,
            fc_tratamiento,
            fc_dosis,
            fc_forma_aplicacion,
            fd_fecha_ultima_dosis,
            fc_responsable,
        } = data;

        const result = await pool.query(
            `UPDATE medellin_medicamentos SET
      fd_fecha_hora=$1, fn_num_estanque=$2, fc_diagnosis=$3, fc_tratamiento=$4,
      fc_dosis=$5, fc_forma_aplicacion=$6, fd_fecha_ultima_dosis=$7,
      fc_responsable=$8, fd_fecha_modificacion=NOW()
      WHERE fi_id=$9
      RETURNING *`,
            [
                fd_fecha_hora,
                fn_num_estanque,
                fc_diagnosis,
                fc_tratamiento,
                fc_dosis,
                fc_forma_aplicacion,
                fd_fecha_ultima_dosis,
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
        await pool.query("DELETE FROM medellin_medicamentos WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM medellin_medicamentos");
        return true;
    },
};

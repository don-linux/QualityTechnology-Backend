import pool from "../../config/database.js";

/**
 * Modelo de Parámetros (Medellín)
 * Tabla: medellin_parametros
 */
export const parametrosModel = {
    /**
     * Obtener todos los registros
     */
    findAll: async () => {
        const result = await pool.query(
            "SELECT * FROM medellin_parametros ORDER BY fi_id DESC"
        );
        return result.rows;
    },

    /**
     * Obtener registro por ID
     */
    findById: async (id) => {
        const result = await pool.query(
            "SELECT * FROM medellin_parametros WHERE fi_id = $1",
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
            fn_num_estanque,
            fn_oxigeno,
            fn_temperatura,
            fn_ph,
            fn_amonio,
            fn_nitritos,
            fn_nitratos,
            fc_responsable,
            fi_usuario_id,
        } = data;

        const result = await pool.query(
            `INSERT INTO medellin_parametros
      (fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
       fn_amonio, fn_nitritos, fn_nitratos, fc_responsable,
       fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      RETURNING *`,
            [
                fd_fecha,
                fn_num_estanque,
                fn_oxigeno,
                fn_temperatura,
                fn_ph,
                fn_amonio,
                fn_nitritos,
                fn_nitratos,
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
            fd_fecha,
            fn_num_estanque,
            fn_oxigeno,
            fn_temperatura,
            fn_ph,
            fn_amonio,
            fn_nitritos,
            fn_nitratos,
            fc_responsable,
        } = data;

        const result = await pool.query(
            `UPDATE medellin_parametros SET
      fd_fecha=$1, fn_num_estanque=$2, fn_oxigeno=$3, fn_temperatura=$4,
      fn_ph=$5, fn_amonio=$6, fn_nitritos=$7, fn_nitratos=$8,
      fc_responsable=$9, fd_fecha_modificacion=NOW()
      WHERE fi_id=$10
      RETURNING *`,
            [
                fd_fecha,
                fn_num_estanque,
                fn_oxigeno,
                fn_temperatura,
                fn_ph,
                fn_amonio,
                fn_nitritos,
                fn_nitratos,
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
        await pool.query("DELETE FROM medellin_parametros WHERE fi_id = $1", [id]);
        return true;
    },

    /**
     * Eliminar todos los registros
     */
    deleteAll: async () => {
        await pool.query("DELETE FROM medellin_parametros");
        return true;
    },
};

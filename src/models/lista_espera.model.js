import pool from "../config/database.js";

/**
 * Modelo de Lista de Espera
 */
export const listaEsperaModel = {
  /**
   * Obtener todos los registros
   */
  findAll: async () => {
    const result = await pool.query(
      `SELECT * FROM lista_espera ORDER BY fi_lista_id DESC`
    );
    return result.rows;
  },

  /**
   * Buscar por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      `SELECT * FROM lista_espera WHERE fi_lista_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nuevo registro
   */
  create: async (data) => {
    const {
      fd_fecha_entrega,
      fc_talla,
      fn_cantidad,
      fc_cliente,
      fc_lugar_entrega,
      fc_encargado_venta,
      fc_unidad_produccion,
      fc_hora_embolsado,
      fc_hora_entrega,
      fn_precio_venta,
      fc_uap_asignada,
      fc_granja_asignada,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO lista_espera (
        fd_fecha_entrega,
        fc_talla,
        fn_cantidad,
        fc_cliente,
        fc_lugar_entrega,
        fc_encargado_venta,
        fc_unidad_produccion,
        fc_hora_embolsado,
        fc_hora_entrega,
        fn_precio_venta,
        fc_uap_asignada,
        fc_granja_asignada
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `,
      [
        fd_fecha_entrega,
        fc_talla,
        fn_cantidad,
        fc_cliente,
        fc_lugar_entrega,
        fc_encargado_venta,
        fc_unidad_produccion,
        fc_hora_embolsado,
        fc_hora_entrega,
        fn_precio_venta,
        fc_uap_asignada,
        fc_granja_asignada,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar registro
   */
  update: async (id, data) => {
    const {
      fd_fecha_entrega,
      fc_talla,
      fn_cantidad,
      fc_cliente,
      fc_lugar_entrega,
      fc_encargado_venta,
      fc_unidad_produccion,
      fc_hora_embolsado,
      fc_hora_entrega,
      fn_precio_venta,
      fc_uap_asignada,
      fc_granja_asignada,
    } = data;

    await pool.query(
      `
      UPDATE lista_espera SET
        fd_fecha_entrega=$1, fc_talla=$2, fn_cantidad=$3, fc_cliente=$4,
        fc_lugar_entrega=$5, fc_encargado_venta=$6, fc_unidad_produccion=$7,
        fc_hora_embolsado=$8, fc_hora_entrega=$9, fn_precio_venta=$10,
        fc_uap_asignada=$11, fc_granja_asignada=$12
      WHERE fi_lista_id=$13
    `,
      [
        fd_fecha_entrega,
        fc_talla,
        fn_cantidad,
        fc_cliente,
        fc_lugar_entrega,
        fc_encargado_venta,
        fc_unidad_produccion,
        fc_hora_embolsado,
        fc_hora_entrega,
        fn_precio_venta,
        fc_uap_asignada,
        fc_granja_asignada,
        id,
      ]
    );
    return true;
  },

  /**
   * Eliminar registro
   */
  delete: async (id) => {
    await pool.query(`DELETE FROM lista_espera WHERE fi_lista_id=$1`, [id]);
    return true;
  },
};

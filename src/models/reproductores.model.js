import pool from "../config/database.js";

/**
 * Modelo de Reproductores
 */
export const reproductoresModel = {
  /**
   * Obtener inventario completo
   */
  getInventario: async () => {
    const result = await pool.query(`
      SELECT
        fi_reproductor_id AS id,
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        fi_usuario_id,
        (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
        (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos
      FROM reproductores
      ORDER BY fi_reproductor_id ASC
    `);
    return result.rows;
  },

  /**
   * Obtener todos los reproductores (para administradores)
   */
  findAll: async () => {
    const result = await pool.query(`
      SELECT 
        fi_reproductor_id,
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
        (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos,
        fi_usuario_id
      FROM reproductores
      ORDER BY fi_reproductor_id DESC
    `);
    return result.rows;
  },

  /**
   * Obtener reproductores por usuario_id
   */
  findByUsuarioId: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT 
        fi_reproductor_id,
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
        (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos,
        fi_usuario_id
      FROM reproductores
      WHERE fi_usuario_id = $1
      ORDER BY fi_reproductor_id DESC
    `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Crear nuevo reproductor
   */
  create: async (data) => {
    const {
      fc_instalacion,
      fn_cantidad,
      fn_talla,
      fn_no_lote,
      fc_observacion,
      fd_fecha_siembra,
      fd_fecha_biometria,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `INSERT INTO reproductores (
        fc_instalacion, fn_cantidad, fn_talla, fn_no_lote,
        fc_observacion, fd_fecha_siembra, fd_fecha_biometria, fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar reproductor
   */
  update: async (id, data) => {
    const {
      fc_instalacion,
      fn_cantidad,
      fn_talla,
      fn_no_lote,
      fc_observacion,
      fd_fecha_siembra,
      fd_fecha_biometria,
    } = data;

    const result = await pool.query(
      `UPDATE reproductores
       SET fc_instalacion=$1, fn_cantidad=$2, fn_talla=$3, fn_no_lote=$4,
           fc_observacion=$5, fd_fecha_siembra=$6, fd_fecha_biometria=$7
       WHERE fi_reproductor_id=$8
       RETURNING *`,
      [
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar reproductor
   */
  delete: async (id) => {
    await pool.query("DELETE FROM reproductores WHERE fi_reproductor_id=$1", [
      id,
    ]);
    return true;
  },
};

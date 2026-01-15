import pool from "../config/database.js";

/**
 * Modelo de Engorda
 */
export const engordaModel = {
  /**
   * Obtener todos los registros (para administradores)
   */
  findAll: async () => {
    const result = await pool.query(`
      SELECT 
        fi_engorda_id,
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        CURRENT_DATE - fecha_siembra AS dias_en_pila,
        CURRENT_DATE - fecha_biometria AS dias_transcurridos,
        particula_mm,
        fi_usuario_id
      FROM engorda
      ORDER BY fi_engorda_id DESC
    `);
    return result.rows;
  },

  /**
   * Obtener registros por usuario_id
   */
  findByUsuarioId: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT 
        fi_engorda_id,
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        CURRENT_DATE - fecha_siembra AS dias_en_pila,
        CURRENT_DATE - fecha_biometria AS dias_transcurridos,
        particula_mm,
        fi_usuario_id
      FROM engorda
      WHERE fi_usuario_id = $1
      ORDER BY fi_engorda_id DESC
    `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Crear nuevo registro
   */
  create: async (data) => {
    const {
      instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_biometria,
      particula_mm,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `INSERT INTO engorda (
        instalacion, cantidad, talla_gr, no_lote, observacion,
        fecha_siembra, fecha_biometria, particula_mm, fecha_registro, fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9)
      RETURNING *`,
      [
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        particula_mm,
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
      instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_biometria,
      particula_mm,
    } = data;

    const result = await pool.query(
      `UPDATE engorda
       SET instalacion=$1, cantidad=$2, talla_gr=$3, no_lote=$4,
           observacion=$5, fecha_siembra=$6, fecha_biometria=$7, particula_mm=$8
       WHERE fi_engorda_id=$9
       RETURNING *`,
      [
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        particula_mm,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar registro
   */
  delete: async (id) => {
    await pool.query("DELETE FROM engorda WHERE fi_engorda_id=$1", [id]);
    return true;
  },
};

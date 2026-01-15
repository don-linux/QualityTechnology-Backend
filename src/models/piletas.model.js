import pool from "../config/database.js";

/**
 * Modelo de Piletas
 * Maneja todas las consultas a la base de datos relacionadas con piletas
 */
export const piletasModel = {
  /**
   * Obtener todas las piletas (para administradores)
   */
  findAll: async () => {
    const result = await pool.query(`
      SELECT 
        fi_pileta_id,
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        CURRENT_DATE - fecha_siembra AS dias_en_pila,
        CURRENT_DATE - fecha_ultima_biometria AS dias_transcurridos,
        fi_usuario_id
      FROM piletas
      ORDER BY fi_pileta_id DESC
    `);
    return result.rows;
  },

  /**
   * Obtener piletas por usuario_id
   */
  findByUsuarioId: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT 
        fi_pileta_id,
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        CURRENT_DATE - fecha_siembra AS dias_en_pila,
        CURRENT_DATE - fecha_ultima_biometria AS dias_transcurridos,
        fi_usuario_id
      FROM piletas
      WHERE fi_usuario_id = $1
      ORDER BY fi_pileta_id DESC
    `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Obtener pileta por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM piletas WHERE fi_pileta_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nueva pileta
   */
  create: async (piletaData) => {
    const {
      nombre_instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
      fi_usuario_id,
    } = piletaData;

    const result = await pool.query(
      `
      INSERT INTO piletas (
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
        fecha_registro,
        fd_fecha_modificacion
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE)
      RETURNING *
    `,
      [
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar pileta
   */
  update: async (id, piletaData) => {
    const {
      nombre_instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
    } = piletaData;

    const result = await pool.query(
      `
      UPDATE piletas
      SET nombre_instalacion = $1, cantidad = $2, talla_gr = $3, no_lote = $4,
          observacion = $5, fecha_siembra = $6, fecha_ultima_biometria = $7
      WHERE fi_pileta_id = $8
      RETURNING *
    `,
      [
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar pileta
   */
  delete: async (id) => {
    await pool.query("DELETE FROM piletas WHERE fi_pileta_id = $1", [id]);
    return true;
  },
};

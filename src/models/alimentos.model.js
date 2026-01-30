import pool from "../config/database.js";

/**
 * Modelo de Alimentos
 */
export const alimentosModel = {
  /**
   * Obtener todos los registros (para administradores)
   */
  findAll: async () => {
    const result = await pool.query(`
      SELECT 
        a.fi_alimento_id,
        a.fi_reproductor_id,
        a.fi_pileta_id,
        a.fi_engorda_id,
        a.particula_mm,
        a.alimento_dia,
        a.porcion,
        a.gasto_alimento,
        r.fc_instalacion AS reproductor_instalacion,
        p.nombre_instalacion AS pileta_nombre,
        e.instalacion AS engorda_instalacion,
        u.fc_nombre AS usuario_nombre
      FROM alimentos a
      LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
      LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
      LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
      LEFT JOIN usuarios u ON u.fi_usuario_id = a.fi_usuario_id
      ORDER BY a.fi_alimento_id DESC
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
        a.fi_alimento_id,
        a.fi_reproductor_id,
        a.fi_pileta_id,
        a.fi_engorda_id,
        a.particula_mm,
        a.alimento_dia,
        a.porcion,
        a.gasto_alimento,
        r.fc_instalacion AS reproductor_instalacion,
        p.nombre_instalacion AS pileta_nombre,
        e.instalacion AS engorda_instalacion
      FROM alimentos a
      LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
      LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
      LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
      WHERE a.fi_usuario_id = $1
      ORDER BY a.fi_alimento_id DESC
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
      fi_reproductor_id,
      fi_pileta_id,
      fi_engorda_id,
      particula_mm,
      alimento_dia,
      porcion,
      gasto_alimento,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO alimentos (
        fi_reproductor_id,
        fi_pileta_id,
        fi_engorda_id,
        particula_mm,
        alimento_dia,
        porcion,
        gasto_alimento,
        fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        fi_reproductor_id ? parseInt(fi_reproductor_id) : null,
        fi_pileta_id ? parseInt(fi_pileta_id) : null,
        fi_engorda_id ? parseInt(fi_engorda_id) : null,
        particula_mm,
        alimento_dia,
        porcion,
        gasto_alimento,
        fi_usuario_id ? parseInt(fi_usuario_id) : null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar registro
   */
  delete: async (id) => {
    await pool.query(`DELETE FROM alimentos WHERE fi_alimento_id = $1`, [id]);
    return true;
  },
};

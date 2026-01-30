import pool from "../config/database.js";

/**
 * Modelo de Movimiento de Alevines
 */
export const movimientoAlevinesModel = {
  /**
   * Obtener todos los movimientos
   */
  findAll: async () => {
    const result = await pool.query(
      `SELECT * FROM movimiento_alevines ORDER BY fi_movimiento_alevines_id ASC`
    );
    return result.rows;
  },

  /**
   * Crear nuevo movimiento
   */
  create: async (data) => {
    const {
      fi_usuario_id,
      fi_alevines_id,
      fi_pileta_id,
      fi_tipo,
      fi_cantidad_alevines,
      fn_peso_promedio,
    } = data;

    const now = new Date();

    const result = await pool.query(
      `INSERT INTO movimiento_alevines (
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        fd_fecha_registro,
        fd_fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        now,
        now,
      ]
    );

    return result.rows[0];
  },

  /**
   * Actualizar movimiento
   */
  update: async (id, data) => {
    const {
      fi_usuario_id,
      fi_alevines_id,
      fi_pileta_id,
      fi_tipo,
      fi_cantidad_alevines,
      fn_peso_promedio,
    } = data;

    const now = new Date();

    const result = await pool.query(
      `UPDATE movimiento_alevines SET
        fi_usuario_id = $1,
        fi_alevines_id = $2,
        fi_pileta_id = $3,
        fi_tipo = $4,
        fi_cantidad_alevines = $5,
        fn_peso_promedio = $6,
        fd_fecha_modificacion = $7
      WHERE fi_movimiento_alevines_id = $8
      RETURNING *`,
      [
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        now,
        id,
      ]
    );

    return result.rows[0];
  },

  /**
   * Eliminar movimiento
   */
  delete: async (id) => {
    const result = await pool.query(
      `DELETE FROM movimiento_alevines WHERE fi_movimiento_alevines_id = $1`,
      [id]
    );
    return result.rowCount > 0;
  },
};

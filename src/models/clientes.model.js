import pool from "../config/database.js";

/**
 * Modelo de Clientes
 * Maneja todas las consultas a la base de datos relacionadas con clientes
 */
export const clientesModel = {
  /**
   * Obtener todos los clientes
   */
  findAll: async () => {
    const result = await pool.query(
      "SELECT * FROM clientes ORDER BY fi_cliente_id ASC"
    );
    return result.rows;
  },

  /**
   * Buscar cliente por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM clientes WHERE fi_cliente_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nuevo cliente
   */
  create: async (clienteData) => {
    const {
      fc_nombre,
      fc_telefono,
      fc_correo,
      fc_localidad,
      fc_cp,
      fi_usuario_id,
    } = clienteData;

    const now = new Date();
    const result = await pool.query(
      `INSERT INTO clientes (
        fc_nombre, fc_telefono, fc_correo, fc_localidad,
        fc_cp, fi_usuario_id, fd_fecha_registro, fd_fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        fc_nombre,
        fc_telefono,
        fc_correo,
        fc_localidad,
        fc_cp,
        fi_usuario_id,
        now,
        now,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar cliente
   */
  update: async (id, clienteData) => {
    const {
      fc_nombre,
      fc_telefono,
      fc_correo,
      fc_localidad,
      fc_cp,
      fi_usuario_id,
    } = clienteData;

    const now = new Date();
    const result = await pool.query(
      `UPDATE clientes SET
        fc_nombre = $1, fc_telefono = $2, fc_correo = $3,
        fc_localidad = $4, fc_cp = $5, fi_usuario_id = $6,
        fd_fecha_modificacion = $7
      WHERE fi_cliente_id = $8
      RETURNING *`,
      [fc_nombre, fc_telefono, fc_correo, fc_localidad, fc_cp, fi_usuario_id, now, id]
    );
    return result.rows[0];
  },

  /**
   * Eliminar cliente
   */
  delete: async (id) => {
    await pool.query("DELETE FROM clientes WHERE fi_cliente_id = $1", [id]);
    return true;
  },
};

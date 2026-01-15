import pool from "../config/database.js";

/**
 * Modelo de Roles
 * Maneja todas las consultas a la base de datos relacionadas con roles
 */
export const rolesModel = {
  /**
   * Obtener todos los roles
   */
  findAll: async () => {
    const result = await pool.query("SELECT * FROM roles ORDER BY fi_rol_id");
    return result.rows;
  },

  /**
   * Buscar rol por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM roles WHERE fi_rol_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nuevo rol
   */
  create: async (nombre) => {
    const result = await pool.query(
      "INSERT INTO roles (fc_nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    return result.rows[0];
  },

  /**
   * Actualizar rol
   */
  update: async (id, nombre) => {
    const result = await pool.query(
      "UPDATE roles SET fc_nombre = $1 WHERE fi_rol_id = $2 RETURNING *",
      [nombre, id]
    );
    return result.rows[0];
  },

  /**
   * Eliminar rol
   */
  delete: async (id) => {
    await pool.query("DELETE FROM roles WHERE fi_rol_id = $1", [id]);
    return true;
  },
};

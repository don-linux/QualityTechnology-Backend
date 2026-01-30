import pool from "../config/database.js";

/**
 * Modelo de Usuarios
 * Maneja todas las consultas a la base de datos relacionadas con usuarios
 */
export const usuariosModel = {
  /**
   * Obtener todos los usuarios
   */
  findAll: async () => {
    const result = await pool.query("SELECT * FROM usuarios");
    return result.rows;
  },

  /**
   * Buscar usuario por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE fi_usuario_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Buscar usuario por nombre
   */
  findByNombre: async (nombre) => {
    const result = await pool.query(
      `SELECT 
        u.fi_usuario_id AS usuario_id,
        u.fc_nombre AS nombre,
        u."fc_contraseña" AS contrasena,
        u.fi_rol_id AS rol_id,
        r.fc_nombre AS rol_nombre
      FROM usuarios u
      JOIN roles r ON u.fi_rol_id = r.fi_rol_id
      WHERE u.fc_nombre = $1`,
      [nombre]
    );
    return result.rows[0];
  },

  /**
   * Obtener rol de usuario por ID
   */
  getRolById: async (id) => {
    const result = await pool.query(
      `SELECT r.fc_nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.fi_rol_id = r.fi_rol_id
       WHERE u.fi_usuario_id = $1`,
      [id]
    );
    return result.rows[0]?.rol || null;
  },

  /**
   * Crear nuevo usuario
   */
  create: async (nombre, hashedPassword, rol_id) => {
    const result = await pool.query(
      `INSERT INTO usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, hashedPassword, rol_id]
    );
    return result.rows[0];
  },

  /**
   * Actualizar usuario
   */
  update: async (id, nombre, hashedPassword, rol_id) => {
    const result = await pool.query(
      `UPDATE usuarios
       SET fc_nombre = $1, "fc_contraseña" = $2, fi_rol_id = $3
       WHERE fi_usuario_id = $4
       RETURNING *`,
      [nombre, hashedPassword, rol_id, id]
    );
    return result.rows[0];
  },

  /**
   * Eliminar usuario
   */
  delete: async (id) => {
    await pool.query("DELETE FROM usuarios WHERE fi_usuario_id = $1", [id]);
    return true;
  },
};

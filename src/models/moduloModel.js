import pool from "../db.js";

class ModulosModel {

  // =============================
  // Obtener todos los módulos
  // =============================
  static async getAll() {

    const result = await pool.query(
      `
      SELECT 
        fi_modulo_id,
        fc_nombre,
        fc_ruta,
        fb_activo
      FROM seguridad.modulos
      ORDER BY fc_nombre ASC
      `
    );

    return result.rows;
  }

  // =============================
  // Obtener módulo por ID
  // =============================
  static async getById(id) {

    const result = await pool.query(
      `
      SELECT 
        fi_modulo_id,
        fc_nombre,
        fc_ruta,
        fb_activo
      FROM seguridad.modulos
      WHERE fi_modulo_id = $1
      `,
      [id]
    );

    return result.rows[0]; // solo uno
  }

}

export default ModulosModel;
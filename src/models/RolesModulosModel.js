import pool from "../db.js";

class RolesModulosModel {

  // =============================
  // Obtener módulos por rol
  // =============================
  static async getModulosByRol(rolId) {
    const result = await pool.query(
      `
      SELECT 
        m.fi_modulo_id,
        m.fc_nombre,
        m.fc_ruta,
        m.fb_activo
      FROM seguridad.roles_modulos rm
      JOIN seguridad.modulos m 
        ON rm.fi_modulo_id = m.fi_modulo_id
      WHERE rm.fi_rol_id = $1
      ORDER BY m.fc_nombre ASC
      `,
      [rolId]
    );

    return result.rows;
  }


  // =============================
  // Asignar módulo a rol
  // =============================
  static async assignModuloToRol(rolId, moduloId) {
    const result = await pool.query(
      `
      INSERT INTO seguridad.roles_modulos (fi_rol_id, fi_modulo_id)
      VALUES ($1, $2)
      ON CONFLICT (fi_rol_id, fi_modulo_id) DO NOTHING
      RETURNING *
      `,
      [rolId, moduloId]
    );

    return result.rows[0];
  }


  // =============================
  // Quitar módulo de rol
  // =============================
  static async removeModuloFromRol(rolId, moduloId) {
    const result = await pool.query(
      `
      DELETE FROM seguridad.roles_modulos
      WHERE fi_rol_id = $1
      AND fi_modulo_id = $2
      RETURNING *
      `,
      [rolId, moduloId]
    );

    return result.rows[0];
  }


  // =============================
  // Reemplazar módulos de un rol
  // (borra todos y vuelve a insertar)
  // =============================
  static async replaceModulosByRol(rolId, modulosIds = []) {

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1️⃣ Borrar actuales
      await client.query(
        `
        DELETE FROM seguridad.roles_modulos
        WHERE fi_rol_id = $1
        `,
        [rolId]
      );

      // 2️⃣ Insertar nuevos
      for (const moduloId of modulosIds) {
        await client.query(
          `
          INSERT INTO seguridad.roles_modulos (fi_rol_id, fi_modulo_id)
          VALUES ($1, $2)
          `,
          [rolId, moduloId]
        );
      }

      await client.query("COMMIT");
      return true;

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

}

export default RolesModulosModel;
import pool from "../db.js";

class RolesModulosModel {

  // =============================
  // Obtener módulos por rol
  // =============================
  static async getModulosByRol(rolId) {

    //Verificar si es root
    const rolResult = await pool.query(
      `SELECT fb_es_root FROM public.roles WHERE fi_rol_id = $1`,
      [rolId]
    );

    const esRoot = rolResult.rows[0]?.fb_es_root;

    //Si es root → devolver todos los módulos activos
    if (esRoot) {
      const result = await pool.query(
        `
        SELECT 
          fi_modulo_id,
          fc_nombre,
          fc_ruta,
          fb_activo
        FROM seguridad.modulos
        WHERE fb_activo = true
        ORDER BY fc_nombre ASC
        `
      );

      return result.rows;
    }

    //comportamiento normal si no es root
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
    const rolResult = await pool.query(
      `SELECT fb_es_root FROM public.roles WHERE fi_rol_id = $1`,
      [rolId]
    );

    if (rolResult.rows[0]?.fb_es_root) {
      throw new Error("No se pueden modificar módulos del rol ROOT.");
    }

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
    const rolResult = await pool.query(
      `SELECT fb_es_root FROM public.roles WHERE fi_rol_id = $1`,
      [rolId]
    );

    if (rolResult.rows[0]?.fb_es_root) {
      throw new Error("No se pueden modificar módulos del rol ROOT.");
    }


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
    const rolResult = await pool.query(
      `SELECT fb_es_root FROM public.roles WHERE fi_rol_id = $1`,
      [rolId]
    );

    if (rolResult.rows[0]?.fb_es_root) {
      throw new Error("No se pueden modificar módulos del rol ROOT.");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1 Borrar actuales
      await client.query(
        `
        DELETE FROM seguridad.roles_modulos
        WHERE fi_rol_id = $1
        `,
        [rolId]
      );

      // 2 Insertar nuevos
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
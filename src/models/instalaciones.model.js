import pool from "../config/database.js";

/**
 * Normalizar nombre de granja
 */
const normalizarGranja = (granja) => {
  if (!granja) return null;

  const g = granja.toLowerCase().trim();

  if (g.includes("medellin")) return "Granja Acuícola Medellin";
  if (g.includes("ceiba")) return "Granja Acuícola La Ceiba";

  throw new Error("Granja inválida");
};

/**
 * Modelo de Instalaciones
 */
export const instalacionesModel = {
  /**
   * Listar instalaciones por usuario
   */
  findByUsuario: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT
        fi_instalacion_id,
        nombre_instalacion,
        largo,
        ancho,
        altura,
        material,
        fc_granja,
        (largo * ancho * altura) AS metros_cubicos
      FROM instalaciones
      WHERE fi_usuario_id = $1
      ORDER BY nombre_instalacion ASC
      `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Listar instalaciones por granja
   */
  findByGranja: async (nombre) => {
    const result = await pool.query(
      `
      SELECT
        fi_instalacion_id,
        nombre_instalacion,
        largo,
        ancho,
        altura,
        material,
        fc_granja,
        (largo * ancho * altura) AS metros_cubicos
      FROM instalaciones
      WHERE LOWER(fc_granja) LIKE LOWER($1)
      ORDER BY nombre_instalacion ASC
      `,
      [`%${nombre}%`]
    );
    return result.rows;
  },

  /**
   * Crear nueva instalación
   */
  create: async (data) => {
    const {
      nombre_instalacion,
      largo,
      ancho,
      altura,
      material,
      fi_usuario_id,
      fc_granja,
    } = data;

    const granjaNormalizada = normalizarGranja(fc_granja);

    const result = await pool.query(
      `
      INSERT INTO instalaciones (
        nombre_instalacion,
        largo,
        ancho,
        altura,
        material,
        fi_usuario_id,
        fc_granja,
        fecha_registro
      )
      VALUES ($1, $2::numeric, $3::numeric, $4::numeric, $5, $6, $7, CURRENT_DATE)
      RETURNING *
      `,
      [
        nombre_instalacion,
        largo,
        ancho,
        altura,
        material,
        fi_usuario_id,
        granjaNormalizada,
      ]
    );

    return result.rows[0];
  },

  /**
   * Actualizar instalación
   */
  update: async (id, data) => {
    const { nombre_instalacion, largo, ancho, altura, material, fc_granja } =
      data;

    const granjaNormalizada = normalizarGranja(fc_granja);

    const result = await pool.query(
      `
      UPDATE instalaciones
      SET nombre_instalacion = $1,
          largo = $2::numeric,
          ancho = $3::numeric,
          altura = $4::numeric,
          material = $5,
          fc_granja = $6
      WHERE fi_instalacion_id = $7
      RETURNING *
      `,
      [nombre_instalacion, largo, ancho, altura, material, granjaNormalizada, id]
    );

    return result.rows[0];
  },

  /**
   * Eliminar instalación
   */
  delete: async (id) => {
    await pool.query(
      "DELETE FROM instalaciones WHERE fi_instalacion_id = $1",
      [id]
    );
    return true;
  },
};

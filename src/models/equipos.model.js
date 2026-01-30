import pool from "../config/database.js";

/**
 * Modelo de Equipos
 */
export const equiposModel = {
  /**
   * Obtener equipos por usuario_id
   */
  findByUsuarioId: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT * 
      FROM equipos
      WHERE fi_usuario_id = $1
      ORDER BY fi_equipo_id DESC
    `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Crear nuevo equipo
   */
  create: async (data) => {
    const {
      fc_nombre,
      fc_marca,
      fc_modelo,
      fc_tipo,
      fd_fecha_compra,
      fn_costo,
      fc_estado,
      fc_ubicacion,
      fc_responsable,
      fd_proximo_mantenimiento,
      fc_notas,
      fi_usuario_id,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO equipos (
        fc_nombre, fc_marca, fc_modelo, fc_tipo,
        fd_fecha_compra, fn_costo, fc_estado,
        fc_ubicacion, fc_responsable,
        fd_proximo_mantenimiento, fc_notas, fi_usuario_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `,
      [
        fc_nombre,
        fc_marca,
        fc_modelo,
        fc_tipo,
        fd_fecha_compra,
        fn_costo,
        fc_estado,
        fc_ubicacion,
        fc_responsable,
        fd_proximo_mantenimiento,
        fc_notas,
        fi_usuario_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar equipo
   */
  update: async (id, data) => {
    const {
      fc_nombre,
      fc_marca,
      fc_modelo,
      fc_tipo,
      fd_fecha_compra,
      fn_costo,
      fc_estado,
      fc_ubicacion,
      fc_responsable,
      fd_proximo_mantenimiento,
      fc_notas,
    } = data;

    const result = await pool.query(
      `
      UPDATE equipos SET
        fc_nombre=$1, fc_marca=$2, fc_modelo=$3, fc_tipo=$4,
        fd_fecha_compra=$5, fn_costo=$6, fc_estado=$7,
        fc_ubicacion=$8, fc_responsable=$9,
        fd_proximo_mantenimiento=$10, fc_notas=$11
      WHERE fi_equipo_id=$12
      RETURNING *
    `,
      [
        fc_nombre,
        fc_marca,
        fc_modelo,
        fc_tipo,
        fd_fecha_compra,
        fn_costo,
        fc_estado,
        fc_ubicacion,
        fc_responsable,
        fd_proximo_mantenimiento,
        fc_notas,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar equipo
   */
  delete: async (id) => {
    await pool.query(`DELETE FROM equipos WHERE fi_equipo_id = $1`, [id]);
    return true;
  },
};

/**
 * Modelo de Mantenimientos
 */
export const mantenimientosModel = {
  /**
   * Obtener mantenimientos por equipo_id
   */
  findByEquipoId: async (equipo_id) => {
    const result = await pool.query(
      `
      SELECT * FROM mantenimientos
      WHERE fi_equipo_id = $1
      ORDER BY fd_fecha DESC
    `,
      [equipo_id]
    );
    return result.rows;
  },

  /**
   * Crear nuevo mantenimiento
   */
  create: async (equipo_id, data) => {
    const {
      fd_fecha,
      fc_tipo,
      fc_responsable,
      fc_descripcion,
      fn_costo,
      fc_estado_post,
      fd_proximo_mantenimiento,
    } = data;

    const result = await pool.query(
      `
      INSERT INTO mantenimientos (
        fi_equipo_id, fd_fecha, fc_tipo, fc_responsable,
        fc_descripcion, fn_costo, fc_estado_post, fd_proximo_mantenimiento
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
      [
        equipo_id,
        fd_fecha,
        fc_tipo,
        fc_responsable,
        fc_descripcion,
        fn_costo,
        fc_estado_post,
        fd_proximo_mantenimiento,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar mantenimiento
   */
  update: async (mantenimiento_id, data) => {
    const {
      fd_fecha,
      fc_tipo,
      fc_responsable,
      fc_descripcion,
      fn_costo,
      fc_estado_post,
      fd_proximo_mantenimiento,
    } = data;

    const result = await pool.query(
      `
      UPDATE mantenimientos SET
        fd_fecha=$1, fc_tipo=$2, fc_responsable=$3,
        fc_descripcion=$4, fn_costo=$5, fc_estado_post=$6,
        fd_proximo_mantenimiento=$7
      WHERE fi_mantenimiento_id=$8
      RETURNING *
    `,
      [
        fd_fecha,
        fc_tipo,
        fc_responsable,
        fc_descripcion,
        fn_costo,
        fc_estado_post,
        fd_proximo_mantenimiento,
        mantenimiento_id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar mantenimiento
   */
  delete: async (mantenimiento_id) => {
    await pool.query(
      `DELETE FROM mantenimientos WHERE fi_mantenimiento_id = $1`,
      [mantenimiento_id]
    );
    return true;
  },
};

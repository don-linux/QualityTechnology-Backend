import pool from "../db.js";

class EstadoModel {

  // =============================
  // Obtener todos
  // =============================
  static async getAll() {
    const result = await pool.query(`
      SELECT fi_estado_id, fc_nombre
      FROM catalogos.estados
      ORDER BY fc_nombre ASC
    `);

    return result.rows;
  }


  // =============================
  // Obtener por ID
  // =============================
  static async getById(id) {
    const result = await pool.query(
      `
      SELECT fi_estado_id, fc_nombre
      FROM catalogos.estados
      WHERE fi_estado_id = $1
      `,
      [id]
    );

    return result.rows[0];
  }


  // =============================
  // Crear estado
  // =============================
  static async create(fc_nombre) {
    const result = await pool.query(
      `
      INSERT INTO catalogos.estados (fc_nombre)
      VALUES ($1)
      RETURNING *
      `,
      [fc_nombre]
    );

    return result.rows[0];
  }


  // =============================
  // Actualizar estado
  // =============================
  static async update(id, fc_nombre) {
    const result = await pool.query(
      `
      UPDATE catalogos.estados
      SET fc_nombre = $1
      WHERE fi_estado_id = $2
      RETURNING *
      `,
      [fc_nombre, id]
    );

    return result.rows[0];
  }


  // =============================
  // Eliminar estado
  // =============================
  static async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM catalogos.estados
      WHERE fi_estado_id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }

}

export default EstadoModel;
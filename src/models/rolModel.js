import pool from "../db.js";

class RolModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM roles");
    return result.rows;
  }

  static async create(nombre) {
    const result = await pool.query(
      "INSERT INTO roles (fc_nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    return result.rows[0];
  }

  static async update(id, nombre) {
    const result = await pool.query(
      "UPDATE roles SET fc_nombre = $1 WHERE fi_rol_id = $2 RETURNING *",
      [nombre, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM roles WHERE fi_rol_id = $1", [id]);
  }
}

export default RolModel;

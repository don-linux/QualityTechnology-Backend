import pool from "../db.js";
import bcrypt from "bcryptjs";

class UsuarioModel {
    static async getAll() {
        const result = await pool.query(
            `SELECT fi_usuario_id, fc_nombre, fi_rol_id FROM usuarios`
        );
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(
            `SELECT fi_usuario_id, fc_nombre, fi_rol_id FROM usuarios WHERE fi_usuario_id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async getByNombre(nombre) {
        const result = await pool.query(
            `
      SELECT 
        u.fi_usuario_id AS usuario_id,
        u.fc_nombre AS nombre,
        u."fc_contraseña" AS contrasena,
        u.fi_rol_id AS rol_id,
        r.fc_nombre AS rol_nombre
      FROM usuarios u
      JOIN roles r ON u.fi_rol_id = r.fi_rol_id
      WHERE u.fc_nombre = $1
      `,
            [nombre]
        );
        return result.rows[0];
    }

    static async create({ nombre, contraseña, rol_id }) {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await pool.query(
            `INSERT INTO usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
       VALUES ($1, $2, $3) RETURNING *`,
            [nombre, hashedPassword, rol_id]
        );
        return result.rows[0];
    }

    static async update(id, { nombre, contraseña, rol_id }) {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await pool.query(
            `UPDATE usuarios
       SET fc_nombre = $1, "fc_contraseña" = $2, fi_rol_id = $3
       WHERE fi_usuario_id = $4 RETURNING *`,
            [nombre, hashedPassword, rol_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query("DELETE FROM usuarios WHERE fi_usuario_id = $1", [id]);
        return true;
    }

    static async verifyPassword(rawPassword, hashedPassword) {
        if (!hashedPassword) return false;
        return await bcrypt.compare(rawPassword, hashedPassword);
    }
}

export default UsuarioModel;

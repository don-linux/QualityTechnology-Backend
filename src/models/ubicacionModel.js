import pool from "../db.js";

class UbicacionModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT * FROM ubicaciones ORDER BY ubicacion_id;
        `);
        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT ubicacion_id, nombre
            FROM ubicaciones
            WHERE activo = true
            ORDER BY nombre;
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT * FROM ubicaciones WHERE ubicacion_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async create({ nombre, direccion, descripcion }) {
        const result = await pool.query(`
            INSERT INTO ubicaciones (nombre, direccion, descripcion)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [nombre, direccion ?? null, descripcion ?? null]);
        return result.rows[0];
    }

    static async update(id, { nombre, direccion, descripcion }) {
        const result = await pool.query(`
            UPDATE ubicaciones
            SET nombre = $1, direccion = $2, descripcion = $3
            WHERE ubicacion_id = $4
            RETURNING *;
        `, [nombre, direccion ?? null, descripcion ?? null, id]);
        return result.rows[0];
    }

    static async activate(id) {
        const result = await pool.query(`
            UPDATE ubicaciones SET activo = true WHERE ubicacion_id = $1 RETURNING *;
        `, [id]);
        return result.rows[0];
    }

    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE ubicaciones SET activo = false WHERE ubicacion_id = $1 RETURNING *;
        `, [id]);
        return result.rows[0];
    }
}

export default UbicacionModel;

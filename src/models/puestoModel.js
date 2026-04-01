import pool from "../db.js";

class PuestoModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT * FROM rrhh.puestos ORDER BY fi_puesto_id;
        `);
        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT fi_puesto_id, fc_nombre
            FROM rrhh.puestos
            WHERE fb_activo = true
            ORDER BY fc_nombre;
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT * FROM rrhh.puestos WHERE fi_puesto_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async create({ fc_nombre }) {
        const result = await pool.query(`
            INSERT INTO rrhh.puestos (fc_nombre)
            VALUES ($1)
            RETURNING *;
        `, [fc_nombre]);
        return result.rows[0];
    }

    static async update(id, { fc_nombre, fb_activo }) {
        const result = await pool.query(`
            UPDATE rrhh.puestos
            SET fc_nombre = $1, fb_activo = $2
            WHERE fi_puesto_id = $3
            RETURNING *;
        `, [fc_nombre, fb_activo, id]);
        return result.rows[0];
    }

    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE rrhh.puestos
            SET fb_activo = false
            WHERE fi_puesto_id = $1
            RETURNING *;
        `, [id]);
        return result.rows[0];
    }
}

export default PuestoModel;

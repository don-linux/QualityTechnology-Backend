import pool from "../db.js";

class DepartamentoModel {

    // Obtener todos
    static async getAll() {
        const result = await pool.query(`
            SELECT *
            FROM rrhh.departamentos
            ORDER BY fi_departamento_id;
        `);

        return result.rows;
    }

    // Obtener solo activos (para dropdown)
    static async getActivos() {
        const result = await pool.query(`
            SELECT fi_departamento_id, fc_nombre
            FROM rrhh.departamentos
            WHERE fb_activo = true
            ORDER BY fc_nombre;
        `);

        return result.rows;
    }

    // Obtener por ID
    static async getById(id) {
        const result = await pool.query(`
            SELECT *
            FROM rrhh.departamentos
            WHERE fi_departamento_id = $1;
        `, [id]);

        return result.rows[0];
    }

    // Crear
    static async create({ fc_nombre }) {
        const result = await pool.query(`
            INSERT INTO rrhh.departamentos (fc_nombre)
            VALUES ($1)
            RETURNING *;
        `, [fc_nombre]);

        return result.rows[0];
    }

    // Actualizar
    static async update(id, { fc_nombre, fb_activo }) {
        const result = await pool.query(`
            UPDATE rrhh.departamentos
            SET fc_nombre = $1,
                fb_activo = $2
            WHERE fi_departamento_id = $3
            RETURNING *;
        `, [fc_nombre, fb_activo, id]);

        return result.rows[0];
    }

    // Baja lógica
    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE rrhh.departamentos
            SET fb_activo = false
            WHERE fi_departamento_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }
}

export default DepartamentoModel;
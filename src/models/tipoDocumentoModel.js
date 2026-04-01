import pool from "../db.js";

class TipoDocumentoModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT * FROM rrhh.tipos_documento ORDER BY fi_tipo_documento_id;
        `);
        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT fi_tipo_documento_id, fc_nombre, fb_obligatorio
            FROM rrhh.tipos_documento
            WHERE fb_activo = true
            ORDER BY fc_nombre;
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT * FROM rrhh.tipos_documento WHERE fi_tipo_documento_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async create({ fc_nombre, fb_obligatorio }) {
        const result = await pool.query(`
            INSERT INTO rrhh.tipos_documento (fc_nombre, fb_obligatorio)
            VALUES ($1, $2)
            RETURNING *;
        `, [fc_nombre, fb_obligatorio || false]);
        return result.rows[0];
    }

    static async update(id, { fc_nombre, fb_obligatorio, fb_activo }) {
        const result = await pool.query(`
            UPDATE rrhh.tipos_documento
            SET fc_nombre = $1, fb_obligatorio = $2, fb_activo = $3
            WHERE fi_tipo_documento_id = $4
            RETURNING *;
        `, [fc_nombre, fb_obligatorio, fb_activo, id]);
        return result.rows[0];
    }
}

export default TipoDocumentoModel;

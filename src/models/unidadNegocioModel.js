import pool from "../db.js";

class UnidadNegocioModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT *
            FROM public.unidades_negocio
            ORDER BY fi_unidad_negocio_id;
        `);

        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT fi_unidad_negocio_id, fc_nombre
            FROM public.unidades_negocio
            WHERE fb_activo = true
            ORDER BY fc_nombre;
        `);

        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT *
            FROM public.unidades_negocio
            WHERE fi_unidad_negocio_id = $1;
        `, [id]);

        return result.rows[0];
    }

    static async getByNombreActiva(nombre) {
        const result = await pool.query(`
            SELECT *
            FROM public.unidades_negocio
            WHERE fc_nombre = $1
              AND fb_activo = true;
        `, [nombre]);

        return result.rows[0];
    }

    static async create({ fc_nombre }) {
        const result = await pool.query(`
            INSERT INTO public.unidades_negocio (fc_nombre)
            VALUES ($1)
            RETURNING *;
        `, [fc_nombre]);

        return result.rows[0];
    }

    static async update(id, { fc_nombre }) {
        const result = await pool.query(`
            UPDATE public.unidades_negocio
            SET fc_nombre = $1
            WHERE fi_unidad_negocio_id = $2
            RETURNING *;
        `, [fc_nombre, id]);

        return result.rows[0];
    }

    static async activate(id) {
        const result = await pool.query(`
            UPDATE public.unidades_negocio
            SET fb_activo = true
            WHERE fi_unidad_negocio_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }

    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE public.unidades_negocio
            SET fb_activo = false
            WHERE fi_unidad_negocio_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }
}

export default UnidadNegocioModel;

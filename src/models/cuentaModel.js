import pool from "../db.js";

class CuentaModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT *
            FROM public.cuentas
            ORDER BY fi_cuenta_id;
        `);

        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT fi_cuenta_id, fc_udn, fc_nombre, fc_numero_cuenta, fc_banco,
                   fc_tipo, fn_saldo_actual
            FROM public.cuentas
            WHERE fb_activo = true
            ORDER BY fc_nombre;
        `);

        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT *
            FROM public.cuentas
            WHERE fi_cuenta_id = $1;
        `, [id]);

        return result.rows[0];
    }

    static async getByNombre(nombre) {
        const result = await pool.query(`
            SELECT *
            FROM public.cuentas
            WHERE fc_nombre = $1
              AND fb_activo = true;
        `, [nombre]);

        return result.rows[0];
    }

    static async create({ fc_udn, fc_nombre, fc_numero_cuenta, fc_banco, fc_tipo }) {
        const result = await pool.query(`
            INSERT INTO public.cuentas (
                fc_udn, fc_nombre, fc_numero_cuenta, fc_banco, fc_tipo
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `, [fc_udn, fc_nombre, fc_numero_cuenta || null, fc_banco || null, fc_tipo]);

        return result.rows[0];
    }

    // Solo se editan datos maestros. fn_saldo_actual solo lo mueve Flujo de Caja.
    static async update(id, { fc_udn, fc_nombre, fc_numero_cuenta, fc_banco, fc_tipo }) {
        const result = await pool.query(`
            UPDATE public.cuentas
            SET fc_udn = $1,
                fc_nombre = $2,
                fc_numero_cuenta = $3,
                fc_banco = $4,
                fc_tipo = $5
            WHERE fi_cuenta_id = $6
            RETURNING *;
        `, [fc_udn, fc_nombre, fc_numero_cuenta || null, fc_banco || null, fc_tipo, id]);

        return result.rows[0];
    }

    // Usado por Flujo de Caja para sumar/restar saldo en una transacción.
    static async updateSaldoActual(id, nuevoSaldo, client) {
        const ejecutor = client || pool;
        const result = await ejecutor.query(`
            UPDATE public.cuentas
            SET fn_saldo_actual = $1
            WHERE fi_cuenta_id = $2
            RETURNING *;
        `, [nuevoSaldo, id]);

        return result.rows[0];
    }

    static async activate(id) {
        const result = await pool.query(`
            UPDATE public.cuentas
            SET fb_activo = true
            WHERE fi_cuenta_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }

    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE public.cuentas
            SET fb_activo = false
            WHERE fi_cuenta_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }
}

export default CuentaModel;

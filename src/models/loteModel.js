import pool from "../db.js";

class LoteModel {

    // Normalización de texto de granja
    static normalizarGranja(valor) {
        if (!valor) return "Granja Acuícola Medellin";

        const v = valor.toLowerCase();

        if (v.includes("medell")) return "Granja Acuícola Medellin";
        if (v.includes("ceib")) return "Granja Acuícola La Ceiba";

        return "Granja Acuícola Medellin";
    }

    /* =====================================================
        INSTALACIONES
    ====================================================== */

    static async getInstalacionesByGranja(granja) {

        const res = await pool.query(`
            SELECT fi_instalacion_id, nombre_instalacion
            FROM instalaciones
            WHERE fc_granja = $1
            ORDER BY nombre_instalacion ASC
        `, [granja]);

        return res.rows;
    }

    static async getInstalacionesFromReproductores(granja) {

        const query = `
            SELECT DISTINCT
                i.fi_instalacion_id,
                i.nombre_instalacion
            FROM instalaciones i
            INNER JOIN reproductores r
                ON i.nombre_instalacion = r.fc_instalacion
            WHERE i.fc_granja = $1
            ORDER BY i.nombre_instalacion ASC
        `;

        const res = await pool.query(query, [granja]);

        return res.rows;
    }

    /* =====================================================
        LOTES POR GRANJA
    ====================================================== */

    static async getByGranja(granja) {

        const result = await pool.query(
            `
            SELECT 
                l.*,
                i.nombre_instalacion
            FROM lotes l
            LEFT JOIN instalaciones i
                ON l.fc_instalacion_id::text = i.fi_instalacion_id::text
            WHERE l.fc_granja = $1
            ORDER BY l.fecha DESC
            `,
            [granja]
        );

        return result.rows;
    }

    /* =====================================================
        CREAR LOTE
    ====================================================== */

    static async create(data) {
        const {
            fecha,
            familia,
            fc_instalacion_id,
            huevos_ml,
            ovadas,
            alevines_inicial,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
        } = data;

        // Si la fecha viene vacía, usamos la fecha actual
        const fechaValida = (fecha && fecha.trim() !== "") ? fecha : new Date().toISOString().split("T")[0];
        
        // Calcular porcentaje de mortalidad si hay datos
        const inicial = Number(alevines_inicial || 0);
        const mort = Number(mortalidad || 0);
        const mortalidad_porcentaje = inicial > 0 ? (mort / inicial) * 100 : 0;

        const result = await pool.query(
            `
            INSERT INTO lotes (
                fecha,
                familia,
                fc_instalacion_id,
                huevos_ml,
                ovadas,
                alevines_inicial,
                no_lote,
                fc_granja,
                observacion,
                mortalidad,
                mortalidad_porcentaje
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
            `,
            [
                fechaValida,
                familia,
                fc_instalacion_id,
                huevos_ml,
                ovadas || 0,
                inicial,
                no_lote,
                fc_granja,
                observacion,
                mort,
                mortalidad_porcentaje
            ]
        );

        return result.rows[0];
    }

    /* =====================================================
        OBTENER ALEVINES
    ====================================================== */

    static async getAlevinesInicial(id) {

        const res = await pool.query(`
            SELECT alevines_inicial
            FROM lotes
            WHERE fi_lote_id = $1
        `, [id]);

        return res.rows[0]?.alevines_inicial || 0;
    }

    /* =====================================================
        ACTUALIZAR LOTE
    ====================================================== */

    static async update(id, data) {
        const {
            fecha,
            familia,
            fc_instalacion_id,
            huevos_ml,
            ovadas,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
            alevines_inicial
        } = data;

        const fechaValida = (fecha && fecha.trim() !== "") ? fecha : new Date().toISOString().split("T")[0];
        const inicial = Number(alevines_inicial || 0);
        const mort = Number(mortalidad || 0);
        const mortalidad_porcentaje = inicial > 0 ? (mort / inicial) * 100 : 0;

        const res = await pool.query(
            `
            UPDATE lotes SET
                fecha = $1,
                familia = $2,
                fc_instalacion_id = $3,
                huevos_ml = $4,
                ovadas = $5,
                no_lote = $6,
                fc_granja = $7,
                observacion = $8,
                mortalidad = $9,
                mortalidad_porcentaje = $10,
                alevines_inicial = $11
            WHERE fi_lote_id = $12
            RETURNING *
            `,
            [
                fechaValida,
                familia,
                String(fc_instalacion_id),
                huevos_ml,
                ovadas || 0,
                no_lote,
                fc_granja,
                observacion,
                mort,
                mortalidad_porcentaje,
                inicial,
                id
            ]
        );

        return res.rows[0];
    }

    /* =====================================================
        VALIDAR DEPENDENCIAS
    ====================================================== */

    static async hasDependencies(id) {

        const checks = [
            "SELECT 1 FROM trazabilidad_alevinaje WHERE fi_lote_id = $1 LIMIT 1",
            "SELECT 1 FROM engorda WHERE fi_lote_id = $1 LIMIT 1"
        ];

        for (let q of checks) {

            const r = await pool.query(q, [id]);

            if (r.rowCount > 0) return true;
        }

        return false;
    }

    /* =====================================================
        ELIMINAR LOTE (EN CASCADA)
    ====================================================== */

    static async delete(id) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // 1. Quitar referencia de piletas
            await client.query("UPDATE piletas SET fi_lote_id = NULL WHERE fi_lote_id = $1", [id]);

            // 2. Eliminar lote_movimientos
            await client.query("DELETE FROM lote_movimientos WHERE fi_lote_id = $1", [id]);

            // 3. Eliminar trazabilidad
            await client.query("DELETE FROM trazabilidad_alevinaje WHERE fi_lote_id = $1", [id]);

            // 4. Eliminar trazabilidad de engorda
            await client.query("DELETE FROM trazabilidad_engorda WHERE fi_engorda_origen IN (SELECT fi_engorda_id FROM engorda WHERE fi_lote_id = $1) OR fi_engorda_destino IN (SELECT fi_engorda_id FROM engorda WHERE fi_lote_id = $1)", [id]);

            // 5. Eliminar alimentos asociados a la engorda de este lote
            await client.query("DELETE FROM alimentos WHERE fi_engorda_id IN (SELECT fi_engorda_id FROM engorda WHERE fi_lote_id = $1)", [id]);

            // 6. Eliminar engorda
            await client.query("DELETE FROM engorda WHERE fi_lote_id = $1", [id]);

            // 7. Finalmente, eliminar el lote
            await client.query("DELETE FROM lotes WHERE fi_lote_id = $1", [id]);

            await client.query("COMMIT");
            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /* =====================================================
        LOTES POR INSTALACION
    ====================================================== */

    static async getByInstalacion(id) {

        const res = await pool.query(
            `
            SELECT fi_lote_id, no_lote
            FROM lotes
            WHERE fc_instalacion_id = $1
            ORDER BY fi_lote_id DESC
            `,
            [id]
        );

        return res.rows;
    }

    /* =====================================================
        OBTENER FAMILIA
    ====================================================== */

 static async getFamiliaPorInstalacion(instalacionId) {

  const result = await pool.query(
    `
    SELECT r.fc_familia AS familia
    FROM reproductores r
    JOIN instalaciones i
      ON r.fc_instalacion = i.nombre_instalacion
    WHERE i.fi_instalacion_id = $1
    LIMIT 1
    `,
    [instalacionId]
  );

  return result.rows[0] || null;
}

}

export default LoteModel;
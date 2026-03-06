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
            mortalidad_porcentaje
        } = data;

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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *
            `,
            [
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
            fc_instalacion_id,
            huevos_ml,
            ovadas,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
            mortalidad_porcentaje
        } = data;

        const res = await pool.query(
            `
            UPDATE lotes SET
                fecha = $1,
                fc_instalacion_id = $2,
                huevos_ml = $3,
                ovadas = $4,
                no_lote = $5,
                fc_granja = $6,
                observacion = $7,
                mortalidad = $8,
                mortalidad_porcentaje = $9
            WHERE fi_lote_id = $10
            RETURNING *
            `,
            [
                fecha,
                String(fc_instalacion_id),
                huevos_ml,
                ovadas,
                no_lote,
                fc_granja,
                observacion,
                mortalidad,
                mortalidad_porcentaje,
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
        ELIMINAR LOTE
    ====================================================== */

    static async delete(id) {

        await pool.query(
            "DELETE FROM lotes WHERE fi_lote_id = $1",
            [id]
        );

        return true;
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
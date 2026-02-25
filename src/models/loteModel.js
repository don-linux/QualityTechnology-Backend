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

    // Instalaciones disponibles por granja
    static async getInstalacionesByGranja(granja) {
        const res = await pool.query(`
            SELECT fi_instalacion_id, nombre_instalacion
            FROM instalaciones
            WHERE fc_granja = $1
            ORDER BY nombre_instalacion ASC
        `, [granja]);
        return res.rows;
    }

    // Obtener lotes por granja (mejorado)
  static async getByGranja(granja) {
    const result = await pool.query(
        `
        SELECT 
            l.*,
            i.nombre_instalacion
        FROM lotes l
        LEFT JOIN instalaciones i
            ON l.fi_instalacion_id = i.nombre_instalacion
        WHERE l.fc_granja = $1
        ORDER BY l.fecha DESC
        `,
        [granja]
    );
    return result.rows;
}
    // Crear lote
    static async create(data) {
    const {
        fecha,
        familia,
        fi_instalacion_id,
        huevos_ml,
        alevines_inicial,
        no_lote,
        fc_granja,
        observacion,
        mortalidad,
        mortalidad_porcentaje
    } = data;

    const res = await pool.query(`
        INSERT INTO lotes (
            fecha,
            familia,
            fi_instalacion_id,
            huevos_ml,
            alevines_inicial,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
            mortalidad_porcentaje,
            fecha_registro
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_DATE)
        RETURNING *
    `, [
        fecha,
        familia,
        fi_instalacion_id,
        huevos_ml,
        alevines_inicial,
        no_lote,
        fc_granja,
        observacion,
        mortalidad,
        mortalidad_porcentaje
    ]);

    return res.rows[0];
}

    // Obtener solo los alevines iniciales
    static async getAlevinesInicial(id) {
        const res = await pool.query(`
            SELECT alevines_inicial
            FROM lotes
            WHERE fi_lote_id = $1
        `, [id]);

        return res.rows[0]?.alevines_inicial || 0;
    }

    // Actualizar lote
    static async update(id, data) {
        const {
            fecha,
            fi_instalacion_id,
            huevos_ml,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
            mortalidad_porcentaje
        } = data;

        const res = await pool.query(`
            UPDATE lotes SET
                fecha = $1,
                fi_instalacion_id = $2,
                huevos_ml = $3,
                no_lote = $4,
                fc_granja = $5,
                observacion = $6,
                mortalidad = $7,
                mortalidad_porcentaje = $8
            WHERE fi_lote_id = $9
            RETURNING *
        `, [
            fecha,
            fi_instalacion_id,
            huevos_ml,
            no_lote,
            fc_granja,
            observacion,
            mortalidad,
            mortalidad_porcentaje,
            id
        ]);

        return res.rows[0];
    }

    // Verificar dependencias antes de borrar
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
    // Eliminar lote
    static async delete(id) {
        await pool.query("DELETE FROM lotes WHERE fi_lote_id = $1", [id]);
        return true;
    }

    // Lotes de una instalación
    static async getByInstalacion(id) {
        const res = await pool.query(`
            SELECT fi_lote_id, no_lote
            FROM lotes
            WHERE fi_instalacion_id = $1
            ORDER BY fi_lote_id DESC
        `, [id]);
        return res.rows;
    }
}

export default LoteModel;
import pool from "../db.js";

class PiletaModel {

    static normalizarGranja(granja) {
        if (!granja) return "Granja Acuícola Medellin";
        const g = granja.toLowerCase();
        if (g.includes("med")) return "Granja Acuícola Medellin";
        if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

   static async getLotesByGranja(granja) {
    const result = await pool.query(
        `
        SELECT 
            l.fi_lote_id,
            l.no_lote,
            l.alevines_inicial,
            l.fecha::date AS fecha,
            l.fi_instalacion_id,
            i.nombre_instalacion AS origen_instalacion,
            (CURRENT_DATE - l.fecha::date) AS dias_en_lote
        FROM lotes l
        INNER JOIN instalaciones i 
            ON l.fi_instalacion_id::integer = i.fi_instalacion_id
        WHERE LOWER(i.fc_granja) = LOWER($1)
        ORDER BY l.no_lote ASC
        `,
        [granja]
    );

    return result.rows;
}

    static async getInventario(granja) {
        const result = await pool.query(
            `
            SELECT 
                p.fi_pileta_id,
                p.cantidad,
                p.talla_gr,
                p.fi_lote_id,
                l.no_lote,
                p.fecha_siembra,
                p.fecha_ultima_biometria,
                (CURRENT_DATE - p.fecha_siembra) AS dias_en_pila,
                (CURRENT_DATE - p.fecha_ultima_biometria) AS dias_transcurridos,
                COALESCE(i.nombre_instalacion, '-') AS nombre_instalacion,
                CASE 
                    WHEN (CURRENT_DATE - l.fecha::date) BETWEEN 1 AND 10 
                        THEN 'Hormonado etapa 1'
                    WHEN (CURRENT_DATE - l.fecha::date) BETWEEN 11 AND 28 
                        THEN 'Hormonado etapa 2'
                    ELSE ''
                END AS etapa_hormonal
            FROM piletas p
            LEFT JOIN instalaciones i ON p.fi_instalacion_id = i.fi_instalacion_id   
            LEFT JOIN lotes l ON p.fi_lote_id = l.fi_lote_id                 
            WHERE LOWER(p.fc_granja) = LOWER($1)
            ORDER BY p.fi_pileta_id DESC
            `,
            [granja]
        );
        return result.rows;
    }

    static async getCantidadYlote(piletaId) {
        const result = await pool.query(
            "SELECT cantidad, fi_lote_id FROM piletas WHERE fi_pileta_id = $1",
            [piletaId]
        );
        return result.rows[0];
    }

        /* =====================================================
   OBTENER MOVIMIENTOS
===================================================== */
static async getMovimientos(usuario, granja) {
    const result = await pool.query(
        `
        SELECT 
            m.fi_movimiento_id,
            COALESCE(po.fi_pileta_id::text, m.origen_externo) AS origen_nombre,
            pd.fi_pileta_id::text AS destino_nombre,
            m.cantidad,
            m.fecha_movimiento,
            m.observacion
        FROM trazabilidad_alevinaje m
        LEFT JOIN piletas po ON po.fi_pileta_id = m.fi_pileta_origen
        LEFT JOIN piletas pd ON pd.fi_pileta_id = m.fi_pileta_destino
        WHERE LOWER(m.fc_granja) = LOWER($1)
        AND m.fi_usuario_id = $2
        ORDER BY m.fecha_movimiento DESC, m.fi_movimiento_id DESC
        `,
        [granja, usuario]
    );
    return result.rows;
}

/* =====================================================
   FILTRO MOVIMIENTOS
===================================================== */
static async getMovimientosFiltro(usuario, granja, buscar, fecha_inicio, fecha_fin) {
    const result = await pool.query(
        `
        SELECT 
            m.fi_movimiento_id,
            COALESCE(po.fi_pileta_id::text, m.origen_externo) AS origen_nombre,
            pd.fi_pileta_id::text AS destino_nombre,
            m.cantidad,
            m.fecha_movimiento,
            m.observacion
        FROM trazabilidad_alevinaje m
        LEFT JOIN piletas po ON po.fi_pileta_id = m.fi_pileta_origen
        LEFT JOIN piletas pd ON pd.fi_pileta_id = m.fi_pileta_destino
        WHERE LOWER(m.fc_granja) = LOWER($1)
        AND m.fi_usuario_id = $2
        AND (
            COALESCE(po.fi_pileta_id::text, m.origen_externo) LIKE $3
            OR pd.fi_pileta_id::text LIKE $3
            OR CAST(m.cantidad AS TEXT) LIKE $3
        )
        AND ($4 = '' OR m.fecha_movimiento >= $4)
        AND ($5 = '' OR m.fecha_movimiento <= $5)
        ORDER BY m.fecha_movimiento DESC
        `,
        [granja, usuario, `%${buscar}%`, fecha_inicio, fecha_fin]
    );
    return result.rows;
}

    static async devolverAlevinesAlLote(loteId, cantidad) {
        await pool.query(
            `UPDATE lotes 
             SET alevines_inicial = alevines_inicial + $1
             WHERE fi_lote_id = $2`,
            [cantidad, loteId]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM piletas WHERE fi_pileta_id = $1", [id]);
    }

    static async createMovimiento(data) {

        const {
            origen_instalacion,
            origen_externo,
            fi_instalacion_id: destino,
            fi_lote_id,
            cantidad,
            observacion,
            tipo_movimiento,
            fi_usuario_id,
            fc_granja
        } = data;

        if (origen_instalacion && origen_externo) {
            throw new Error("No puede existir origen interno y externo al mismo tiempo.");
        }

        if (!origen_instalacion && !origen_externo) {
            throw new Error("Debe existir un origen válido.");
        }

        const insert = await pool.query(
            `
            INSERT INTO trazabilidad_alevinaje
            (fi_pileta_origen, origen_externo, fi_pileta_destino, cantidad,
            fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, fc_granja)
            VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,$8,$9)
            RETURNING fi_movimiento_id
            `,
            [
                origen_instalacion || null,
                origen_externo || null,
                destino || null,
                cantidad,
                observacion,
                fi_usuario_id,
                fi_lote_id,
                tipo_movimiento,
                fc_granja
            ]
        );

        if (origen_instalacion) {
            await pool.query(
                "UPDATE piletas SET cantidad = cantidad - $1 WHERE fi_pileta_id = $2",
                [cantidad, origen_instalacion]
            );
        }

        if (tipo_movimiento === "TRASLADO" && destino) {
            await pool.query(
                "UPDATE piletas SET cantidad = cantidad + $1 WHERE fi_pileta_id = $2",
                [cantidad, destino]
            );
        }

        return insert.rows[0].fi_movimiento_id;
    }
}

export default PiletaModel;
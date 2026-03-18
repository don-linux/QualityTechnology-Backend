import pool from "../db.js";

class PiletaModel {

    static normalizarGranja(granja) {
        if (!granja) return "Granja Acuícola Medellin";
        const g = granja.toLowerCase();
        if (g.includes("med")) return "Granja Acuícola Medellin";
        if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    /* =====================================================
       LOTES
    ===================================================== */
    static async getLotesByGranja(granja) {
        const result = await pool.query(
            `
            SELECT 
                l.fi_lote_id,
                l.no_lote,
                l.alevines_inicial,
                l.fecha::date AS fecha,
                l.fc_instalacion_id,
                i.nombre_instalacion AS origen_instalacion,
                (CURRENT_DATE - l.fecha::date) AS dias_en_lote
            FROM lotes l
            LEFT JOIN instalaciones i 
                ON l.fc_instalacion_id::text = i.fi_instalacion_id::text
            WHERE LOWER(i.fc_granja) = LOWER($1)
            ORDER BY l.no_lote ASC
            `,
            [granja]
        );
        return result.rows;
    }

    /* =====================================================
       INVENTARIO
    ===================================================== */
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
                WHEN (CURRENT_DATE - p.fecha_siembra) BETWEEN 1 AND 10 THEN 'Hormonado etapa 1'
                WHEN (CURRENT_DATE - p.fecha_siembra) BETWEEN 11 AND 20 THEN 'Hormonado etapa 2'
                ELSE p.observacion
            END AS etapa_hormonal
            FROM piletas p
            LEFT JOIN instalaciones i 
                ON p.fi_instalacion_id = i.fi_instalacion_id
            LEFT JOIN lotes l 
                ON p.fi_lote_id::text = l.fi_lote_id::text
            WHERE LOWER(p.fc_granja) = LOWER($1)
            ORDER BY p.fi_pileta_id DESC
            `,
            [granja]
        );
        return result.rows;
    }

    /* =====================================================
       CANTIDAD Y LOTE
    ===================================================== */
    static async getCantidadYlote(piletaId) {
    const result = await pool.query(
        `
        SELECT cantidad, fi_lote_id, fi_instalacion_id
        FROM piletas
        WHERE fi_pileta_id = $1
        `,
        [piletaId]
    );
    return result.rows[0];
}

/* DEVOLVER ALEVINES AL LOTE */

static async devolverAlevinesAlLote(loteId, cantidad) {

    await pool.query(
        `
        UPDATE lotes
        SET alevines_inicial = COALESCE(alevines_inicial,0) + $1
        WHERE fi_lote_id = $2
        `,
        [cantidad, loteId]
    );

}

    /* =====================================================
       MOVIMIENTOS
    ===================================================== */
    static async getMovimientos(usuario, granja) {
    const result = await pool.query(
        `
        SELECT 
            m.fi_movimiento_id,
            COALESCE(i_origen.nombre_instalacion, m.origen_externo) AS origen_nombre,
            i_destino.nombre_instalacion AS destino_nombre,
            m.cantidad,
            m.fecha_movimiento,
            m.observacion,
            m.tipo_movimiento

        FROM trazabilidad_alevinaje m

        LEFT JOIN instalaciones i_origen
            ON i_origen.fi_instalacion_id = m.fi_instalacion_origen

        LEFT JOIN instalaciones i_destino
            ON i_destino.fi_instalacion_id = m.fi_instalacion_destino

        LEFT JOIN lotes l
            ON l.fi_lote_id = m.fi_lote_id

        WHERE LOWER(l.fc_granja) = LOWER($1)
        AND m.fi_usuario_id = $2

        ORDER BY m.fecha_movimiento DESC
        `,
        [granja, usuario]
    );

    return result.rows;
}
    static async getMovimientosFiltro(usuario, granja, buscar, inicio, fin) {
        let sql = `
            SELECT 
                m.fi_movimiento_id,
                COALESCE(
                    i_o.nombre_instalacion, 
                    i_o_m.nombre_instalacion, 
                    i_l_o.nombre_instalacion,
                    m.origen_externo
                ) AS origen_nombre,
                COALESCE(
                    i_d.nombre_instalacion, 
                    i_d_m.nombre_instalacion
                ) AS destino_nombre,
                m.cantidad,
                m.fecha_movimiento,
                m.observacion,
                m.tipo_movimiento
            FROM trazabilidad_alevinaje m
            LEFT JOIN instalaciones po ON po.fi_instalacion_id = m.fi_instalacion_origen
            LEFT JOIN instalaciones i_o ON i_o.fi_instalacion_id::text = p_o.fi_instalacion_id::text
            LEFT JOIN instalaciones pd ON pd.fi_instalacion_id = m.fi_instalacion_destino
            LEFT JOIN instalaciones i_d ON i_d.fi_instalacion_id::text = p_d.fi_instalacion_id::text
            LEFT JOIN instalaciones i_o_m ON i_o_m.fi_instalacion_id::text = m.fi_instalacion_origen::text
            LEFT JOIN instalaciones i_d_m ON i_d_m.fi_instalacion_id::text = m.fi_instalacion_destino::text
            -- Respaldo extra
            LEFT JOIN lotes l_o ON l_o.fi_lote_id = m.fi_lote_id
            LEFT JOIN instalaciones i_l_o ON i_l_o.fi_instalacion_id::text = l_o.fc_instalacion_id::text
            WHERE LOWER(m.fc_granja) = LOWER($1)
            AND m.fi_usuario_id = $2
        `;

        const params = [granja, usuario];

        if (buscar) {
            params.push(`%${buscar}%`);
            sql += ` AND (i_o.nombre_instalacion ILIKE $${params.length} OR i_d.nombre_instalacion ILIKE $${params.length} OR m.observacion ILIKE $${params.length} OR m.origen_externo ILIKE $${params.length})`;
        }

        if (inicio) {
            params.push(inicio);
            sql += ` AND m.fecha_movimiento >= $${params.length}`;
        }
        if (fin) {
            params.push(fin);
            sql += ` AND m.fecha_movimiento <= $${params.length}`;
        }

        sql += ` ORDER BY m.fecha_movimiento DESC`;

        const result = await pool.query(sql, params);
        return result.rows;
    }


    /* =====================================================
       REGISTRAR MOVIMIENTO
    ===================================================== */
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

    const origenInstalacionId = origen_instalacion ? Number(origen_instalacion) : null;
    const destinoId = destino ? Number(destino) : null;
    const loteId = fi_lote_id ? Number(fi_lote_id) : null;

    /* ==============================
       VALIDACIONES
    ============================== */

    if (origenInstalacionId && origen_externo) {
        throw new Error("No puede existir origen interno y externo al mismo tiempo.");
    }

        if (!origenInstalacionId && !origen_externo && tipo_movimiento !== "MORTALIDAD") {
            throw new Error("Debe existir un origen válido.");
        }

        if (origenInstalacionId && destinoId && origenInstalacionId === destinoId) {
            throw new Error("Origen y destino no pueden ser la misma instalación.");
        }

        let piletaOrigenId = null;
        let piletaDestinoId = null;

        /* ==============================
           1. BUSCAR PILETA ORIGEN (SI EXISTE)
        ============================== */
        if (origenInstalacionId) {
            const origen = await pool.query(
                `SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id = $1 LIMIT 1`,
                [origenInstalacionId]
            );
            if (origen.rows.length > 0) {
                piletaOrigenId = origen.rows[0].fi_pileta_id;
            }
        }

        /* ==============================
           2. BUSCAR O CREAR PILETA DESTINO
        ============================== */
        if (destinoId) {
            const destinoRes = await pool.query(
                `SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id = $1 LIMIT 1`,
                [destinoId]
            );

            if (destinoRes.rows.length > 0) {
                piletaDestinoId = destinoRes.rows[0].fi_pileta_id;

                // Si es un traslado, sumamos al destino
                if (tipo_movimiento === "TRASLADO") {
                    await pool.query(
                        `UPDATE piletas SET cantidad = cantidad + $1 WHERE fi_pileta_id = $2`,
                        [cantidad, piletaDestinoId]
                    );
                }
            } else if (tipo_movimiento === "TRASLADO" || tipo_movimiento === "SIEMBRA") {
                // Si no existe y es traslado, creamos la pileta nueva
                const nuevaPileta = await pool.query(
                    `
                    INSERT INTO piletas
                    (fi_instalacion_id, fi_lote_id, cantidad, talla_gr, observacion,
                    fecha_siembra, fecha_ultima_biometria, fc_granja)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING fi_pileta_id
                    `,
                    [
                        destinoId,
                        loteId,
                        cantidad,
                        data.talla_gr || 0,
                        observacion || null,
                        data.fecha_siembra || new Date(),
                        data.fecha_ultima_biometria || new Date(),
                        fc_granja
                    ]
                );
                piletaDestinoId = nuevaPileta.rows[0].fi_pileta_id;
            }

            // Marcamos la instalación como ocupada
            if (tipo_movimiento === "TRASLADO") {
                await this.ocuparInstalacion(destinoId);
            }
        }

        /* ==============================
           3. RESTAR DEL ORIGEN
        ============================== */
        if (piletaOrigenId) {
            await pool.query(
                `UPDATE piletas SET cantidad = cantidad - $1 WHERE fi_pileta_id = $2`,
                [cantidad, piletaOrigenId]
            );
        }

      /* ==============================
        4. GUARDAR TRAZABILIDAD
        ============================== */
        const trace = await pool.query(
        `
        INSERT INTO trazabilidad_alevinaje
        (fi_instalacion_origen, origen_externo, fi_instalacion_destino, cantidad,
        fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8)
        RETURNING fi_movimiento_id
        `,
        [
            origenInstalacionId || null,
            origen_externo || null,
            destinoId || null,
            cantidad,
            observacion,
            fi_usuario_id || null,
            loteId || null,
            tipo_movimiento
        ]
        );

        /* ==============================
           5. ACTUALIZAR CANTIDAD DEL LOTE
        ============================== */
        if (loteId) {
            await pool.query(
                `UPDATE lotes SET alevines_inicial = $1 WHERE fi_lote_id = $2`,
                [cantidad, loteId]
            );
        }

        return trace.rows[0].fi_movimiento_id;
    }

        /* =====================================================
            ACTUALIZAR SIEMBRA
        ===================================================== */

        static async updateSiembra(id, data) {

            const {
                fi_instalacion_id,
                fi_lote_id,
                cantidad,
                talla_gr,
                observacion,
                fecha_siembra,
                fecha_ultima_biometria
            } = data;

            await pool.query(
                `
                UPDATE piletas
                SET 
                    fi_instalacion_id = $1,
                    fi_lote_id = $2,
                    cantidad = $3,
                    talla_gr = $4,
                    observacion = $5,
                    fecha_siembra = $6,
                    fecha_ultima_biometria = $7
                WHERE fi_pileta_id = $8
                `,
                [
                    fi_instalacion_id,
                    fi_lote_id,
                    cantidad,
                    talla_gr,
                    observacion,
                    fecha_siembra,
                    fecha_ultima_biometria,
                    id
                ]
            );

        }
    /* =====================================================
       ELIMINAR PILETA
    ===================================================== */
   static async delete(id) {

    /* ELIMINAR TRAZABILIDAD RELACIONADA */

    await pool.query(
        `
        DELETE FROM trazabilidad_alevinaje
        WHERE fi_instalacion_origen = $1
        OR fi_instalacion_destino = $1
        `,
        [id]
    );

    /* ELIMINAR PILETA */

    await pool.query(
        `
        DELETE FROM piletas
        WHERE fi_pileta_id = $1
        `,
        [id]
    );
}

/* =====================================================
   FILTRAR MOVIMIENTOS
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
        LEFT JOIN piletas po 
            ON po.fi_pileta_id = m.fi_pileta_origen
        LEFT JOIN piletas pd 
            ON pd.fi_pileta_id = m.fi_pileta_destino
        WHERE LOWER(m.fc_granja) = LOWER($1)
        AND m.fi_usuario_id = $2
        AND (
            po.fi_pileta_id::text ILIKE '%' || $3 || '%'
            OR pd.fi_pileta_id::text ILIKE '%' || $3 || '%'
        )
        AND ($4 = '' OR m.fecha_movimiento >= $4)
        AND ($5 = '' OR m.fecha_movimiento <= $5)
        ORDER BY m.fecha_movimiento DESC
        `,
        [granja, usuario, buscar, fecha_inicio, fecha_fin]
    );

    return result.rows;

}
    /* =====================================================
       ELIMINAR UN MOVIMIENTO
    ===================================================== */
    static async deleteMovimiento(movimiento_id) {

        await pool.query(
            `
            DELETE FROM trazabilidad_alevinaje
            WHERE fi_movimiento_id = $1
            `,
            [movimiento_id]
        );

    }

    /* =====================================================
       ELIMINAR TODOS LOS MOVIMIENTOS
    ===================================================== */
    static async deleteAllMovimientos(granja) {

        await pool.query(
            `
            DELETE FROM trazabilidad_alevinaje
            WHERE LOWER(fc_granja) = LOWER($1)
            `,
            [granja]
        );

    }

    /* =====================================================
       OCUPAR INSTALACION
    ===================================================== */
    static async ocuparInstalacion(instalacion_id) {

        await pool.query(
            `
            UPDATE instalaciones
            SET estado = 'Ocupada'
            WHERE fi_instalacion_id = $1
            `,
            [instalacion_id]
        );

    }

    /* =====================================================
       VERIFICAR INSTALACION VACIA
    ===================================================== */
    static async verificarInstalacionVacia(instalacion_id) {

        const result = await pool.query(
            `
            SELECT SUM(cantidad) AS total
            FROM piletas
            WHERE fi_instalacion_id = $1
            `,
            [instalacion_id]
        );

        const total = result.rows[0].total;

        if (!total || total == 0) {

            await pool.query(
                `
                UPDATE instalaciones
                SET estado = 'Vacia'
                WHERE fi_instalacion_id = $1
                `,
                [instalacion_id]
            );

        }
    }

    /* =====================================================
       LOTE POR INSTALACION
    ===================================================== */
    static async getLotePorInstalacion(instalacion_id) {
        const result = await pool.query(
            `
            SELECT
                l.fi_lote_id,
                l.no_lote,
                l.alevines_inicial
            FROM lotes l
            JOIN instalaciones i ON l.fc_instalacion_id::text = i.fi_instalacion_id::text
            WHERE i.fi_instalacion_id = $1
            LIMIT 1
            `,
            [instalacion_id]
        );

return result.rows[0] || null

}
}

export default PiletaModel;
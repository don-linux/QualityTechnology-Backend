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
                COALESCE(i.nombre_instalacion, '-') AS nombre_instalacion
            FROM piletas p
            LEFT JOIN instalaciones i 
                ON p.fi_instalacion_id = i.fi_instalacion_id   
            LEFT JOIN lotes l 
                ON p.fi_lote_id = l.fi_lote_id                 
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
            ORDER BY m.fecha_movimiento DESC
            `,
            [granja, usuario]
        );

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

        if (origen_instalacion && origen_externo) {
            throw new Error("No puede existir origen interno y externo al mismo tiempo.");
        }

        if (!origen_instalacion && !origen_externo && tipo_movimiento !== "MORTALIDAD") {
            throw new Error("Debe existir un origen válido.");
        }

        if (origen_instalacion && destino && origen_instalacion === destino) {
            throw new Error("Origen y destino no pueden ser la misma instalación.");
        }

        let piletaOrigenId = null;
        let piletaDestinoId = null;

        /* ==============================
           BUSCAR PILETA ORIGEN
        ============================== */

        if (origen_instalacion) {

            const origen = await pool.query(
                `
                SELECT fi_pileta_id
                FROM piletas
                WHERE fi_instalacion_id = $1
                LIMIT 1
                `,
                [origen_instalacion]
            );

            if (origen.rows.length > 0) {
                piletaOrigenId = origen.rows[0].fi_pileta_id;
            }
        }

        /* ==============================
           BUSCAR PILETA DESTINO
        ============================== */

        if (destino) {

            const destinoPileta = await pool.query(
                `
                SELECT fi_pileta_id
                FROM piletas
                WHERE fi_instalacion_id = $1
                LIMIT 1
                `,
                [destino]
            );

            if (destinoPileta.rows.length > 0) {
                piletaDestinoId = destinoPileta.rows[0].fi_pileta_id;
            }
        }

        /* ==============================
           INSERTAR TRAZABILIDAD
        ============================== */

        const insert = await pool.query(
            `
            INSERT INTO trazabilidad_alevinaje
            (fi_pileta_origen, origen_externo, fi_pileta_destino, cantidad,
            fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, fc_granja)
            VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,$8,$9)
            RETURNING fi_movimiento_id
            `,
            [
                piletaOrigenId,
                origen_externo || null,
                piletaDestinoId,
                cantidad,
                observacion,
                fi_usuario_id,
                fi_lote_id,
                tipo_movimiento,
                fc_granja
            ]
        );

        /* ==============================
           RESTAR ORIGEN
        ============================== */

        if (piletaOrigenId) {

            await pool.query(
                `
                UPDATE piletas
                SET cantidad = cantidad - $1
                WHERE fi_pileta_id = $2
                `,
                [cantidad, piletaOrigenId]
            );
        }

        /* ==============================
           SUMAR DESTINO
        ============================== */

        if (tipo_movimiento === "TRASLADO" && destino) {

    /* SI YA EXISTE PILETA → SUMAR */

    if (piletaDestinoId) {

        await pool.query(
            `
            UPDATE piletas
            SET cantidad = cantidad + $1
            WHERE fi_pileta_id = $2
            `,
            [cantidad, piletaDestinoId]
        );

    } else {

        /* SI NO EXISTE → CREAR NUEVA PILETA */

            const nuevaPileta = await pool.query(
        `
        INSERT INTO piletas
        (fi_instalacion_id, fi_lote_id, cantidad, talla_gr, observacion,
        fecha_siembra, fecha_ultima_biometria, fc_granja)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING fi_pileta_id
        `,
        [
            destino,
            fi_lote_id,
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

    await this.ocuparInstalacion(destino);
}

        return insert.rows[0].fi_movimiento_id;
    }

    /* =====================================================
       ELIMINAR PILETA
    ===================================================== */
   static async delete(id) {

    /* ELIMINAR TRAZABILIDAD RELACIONADA */

    await pool.query(
        `
        DELETE FROM trazabilidad_alevinaje
        WHERE fi_pileta_origen = $1
        OR fi_pileta_destino = $1
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
                fi_lote_id,
                no_lote,
                alevines_inicial
            FROM lotes
            WHERE fi_instalacion_id = $1
            LIMIT 1
            `,
            [instalacion_id]
        );

        return result.rows[0] || null;
    }

}

export default PiletaModel;
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
        CAST(l.fecha AS DATE) AS fecha,
        l.fi_instalacion_id,
        i.nombre_instalacion AS origen_instalacion,
        CURRENT_DATE - CAST(l.fecha AS DATE) AS dias_en_lote
      FROM lotes l
      LEFT JOIN instalaciones i 
        ON l.fi_instalacion_id = i.fi_instalacion_id::text
      WHERE LOWER(l.fc_granja) = LOWER($1)
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
        p.observacion,
        p.fecha_siembra,
        p.fecha_ultima_biometria,
        (CURRENT_DATE - p.fecha_siembra) AS dias_en_pila,
        (CURRENT_DATE - p.fecha_ultima_biometria) AS dias_transcurridos,
        COALESCE(i.nombre_instalacion, '-') AS nombre_instalacion 
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

    static async getLotePorInstalacion(instId, granja) {
        const result = await pool.query(
            `
      SELECT fi_lote_id, no_lote
      FROM lotes
      WHERE fi_instalacion_id = (
        SELECT nombre_instalacion
        FROM instalaciones
        WHERE fi_instalacion_id = $1
      )
      AND LOWER(fc_granja) = LOWER($2)
      ORDER BY fi_lote_id DESC
      LIMIT 1
      `,
            [instId, granja]
        );
        return result.rows[0] || {};
    }

    static async getCantidadYlote(piletaId) {
        const result = await pool.query(
            "SELECT cantidad, fi_lote_id FROM piletas WHERE fi_pileta_id = $1",
            [piletaId]
        );
        return result.rows[0];
    }

    static async updateSiembra(id, data) {
        const {
            fi_instalacion_id, origen_instalacion, fi_lote_id,
            cantidad, talla_gr, observacion, fecha_siembra,
            fecha_ultima_biometria, fi_usuario_id
        } = data;

        await pool.query(
            `
      UPDATE piletas
      SET 
        fi_instalacion_id = $1,
        origen_instalacion = $2,
        fi_lote_id = $3,
        cantidad = $4,
        talla_gr = $5,
        observacion = $6,
        fecha_siembra = $7,
        fecha_ultima_biometria = $8,
        fi_usuario_id = $9,
        fd_fecha_modificacion = CURRENT_DATE
      WHERE fi_pileta_id = $10
      `,
            [fi_instalacion_id, origen_instalacion, fi_lote_id, cantidad, talla_gr, observacion, fecha_siembra, fecha_ultima_biometria, fi_usuario_id, id]
        );
    }

    static async createSiembra(data) {
        const {
            fi_instalacion_id, origen_instalacion, fi_lote_id,
            cantidad, talla_gr, observacion, fecha_siembra,
            fecha_ultima_biometria, fi_usuario_id, fc_granja
        } = data;

        await pool.query(
            `
      INSERT INTO piletas 
      (
        fi_instalacion_id, origen_instalacion,
        fi_lote_id, cantidad, talla_gr,
        observacion, fecha_siembra, fecha_ultima_biometria,
        fi_usuario_id, fc_granja, fecha_registro
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_DATE)
      `,
            [fi_instalacion_id, origen_instalacion, fi_lote_id, cantidad, talla_gr, observacion, fecha_siembra, fecha_ultima_biometria, fi_usuario_id, fc_granja]
        );
    }

    static async updateAlevinesLote(loteId, diferencia) {
        await pool.query(
            `UPDATE lotes SET alevines_inicial = alevines_inicial + $1 WHERE fi_lote_id = $2`,
            [diferencia, loteId]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM piletas WHERE fi_pileta_id = $1", [id]);
    }

    // MOVIMIENTOS
    static async getMovimientos(usuario, granja) {
        const result = await pool.query(
            `
      SELECT 
        m.fi_movimiento_id,
        COALESCE(o.nombre_instalacion, m.origen_externo) AS origen_nombre,
        d.nombre_instalacion AS destino_nombre,
        m.cantidad AS cantidad_trasladada,
        m.fecha_movimiento,
        m.observacion
      FROM alevinaje_movimientos m
      LEFT JOIN instalaciones o ON o.fi_instalacion_id = m.fi_pileta_origen
      LEFT JOIN instalaciones d ON d.fi_instalacion_id = m.fi_pileta_destino
      WHERE LOWER(m.fc_granja) = LOWER($1)
      AND m.fi_usuario_id = $2
      ORDER BY m.fecha_movimiento DESC, m.fi_movimiento_id DESC
      `,
            [granja, usuario]
        );
        return result.rows;
    }

    static async getMovimientosFiltro(usuario, granja, buscar, fecha_inicio, fecha_fin) {
        const result = await pool.query(
            `
      SELECT 
        m.fi_movimiento_id,
        COALESCE(o.nombre_instalacion, m.origen_externo) AS origen_nombre,
        d.nombre_instalacion AS destino_nombre,
        m.cantidad AS cantidad_trasladada,
        m.fecha_movimiento,
        m.observacion
      FROM alevinaje_movimientos m
      LEFT JOIN instalaciones o ON o.fi_instalacion_id = m.fi_pileta_origen
      LEFT JOIN instalaciones d ON d.fi_instalacion_id = m.fi_pileta_destino
      WHERE LOWER(m.fc_granja) = LOWER($1)
      AND m.fi_usuario_id = $2
      AND (
           LOWER(COALESCE(o.nombre_instalacion, m.origen_externo)) LIKE LOWER($3)
        OR LOWER(d.nombre_instalacion) LIKE LOWER($3)
        OR CAST(m.cantidad AS TEXT) LIKE $3
      )
      AND ( $4 = '' OR m.fecha_movimiento >= $4 )
      AND ( $5 = '' OR m.fecha_movimiento <= $5 )
      ORDER BY m.fecha_movimiento DESC, m.fi_movimiento_id DESC
      `,
            [granja, usuario, `%${buscar}%`, fecha_inicio, fecha_fin]
        );
        return result.rows;
    }

    static async createMovimiento(data) {
        const {
            origen_instalacion, origen_externo, fi_instalacion_id: destino,
            fi_lote_id, cantidad, observacion, tipo_movimiento,
            fi_usuario_id, fc_granja
        } = data;

        const insert = await pool.query(
            `
      INSERT INTO alevinaje_movimientos
      (fi_pileta_origen, origen_externo, fi_pileta_destino, cantidad,
       fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, fc_granja)
      VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,$8,$9)
      RETURNING fi_movimiento_id
      `,
            [origen_instalacion || null, origen_externo || null, destino, cantidad, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, fc_granja]
        );

        // Actualizar inventario
        if (origen_instalacion) {
            await pool.query("UPDATE piletas SET cantidad = cantidad - $1 WHERE fi_instalacion_id = $2", [cantidad, origen_instalacion]);
        }
        if (destino) {
            await pool.query("UPDATE piletas SET cantidad = cantidad + $1 WHERE fi_instalacion_id = $2", [cantidad, destino]);
        }

        return insert.rows[0].fi_movimiento_id;
    }

    static async deleteMovimiento(id) {
        await pool.query("DELETE FROM alevinaje_movimientos WHERE fi_movimiento_id = $1", [id]);
    }

    static async deleteAllMovimientos(granja) {
        await pool.query("DELETE FROM alevinaje_movimientos WHERE LOWER(fc_granja) = LOWER($1)", [granja]);
    }
}

export default PiletaModel;

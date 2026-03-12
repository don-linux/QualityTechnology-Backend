import pool from "../db.js";

class EngordaModel {
  static async esLote(id) {
    const r = await pool.query(
      "SELECT 1 FROM lotes WHERE fi_lote_id = $1",
      [id]
    );
    return r.rowCount > 0;
  }

  static async getByGranja(granja) {
    const result = await pool.query(
      `SELECT
        e.fi_engorda_id, e.fi_instalacion_id,
        i.nombre_instalacion AS destino_nombre,
        e.fi_lote_id, l.no_lote, e.cantidad, e.talla_gr,
        e.observacion, e.fecha_siembra, e.fecha_biometria,
        CURRENT_DATE - e.fecha_siembra AS dias_en_pila,
        CURRENT_DATE - e.fecha_biometria AS dias_transcurridos,
        e.fi_usuario_id, e.fc_granja
      FROM engorda e
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = e.fi_instalacion_id
      LEFT JOIN lotes l ON l.fi_lote_id = e.fi_lote_id
      WHERE LOWER(e.fc_granja) = LOWER($1)
      ORDER BY e.fi_engorda_id DESC`,
      [granja]
    );
    return result.rows;
  }

  static async createOrUpdate(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (data.fi_engorda_id) {
        await client.query(
          `UPDATE engorda SET
            cantidad = $1, talla_gr = $2, observacion = $3,
            fecha_siembra = $4, fecha_biometria = $5,
            fd_fecha_modificacion = CURRENT_DATE
          WHERE fi_engorda_id = $6`,
          [
            data.cantidad, data.talla_gr, data.observacion,
            data.fecha_siembra, data.fecha_biometria, data.fi_engorda_id,
          ]
        );
        await client.query("COMMIT");
        return { updated: true };
      }

      // Determinar lote final segun el origen
      const origenEsLote = await this.esLote(data.origen_instalacion);
      let loteFinal;

      if (origenEsLote) {
        loteFinal = data.origen_instalacion;
      } else {
        const r = await client.query(
          "SELECT fi_lote_id FROM engorda WHERE fi_engorda_id = $1",
          [data.origen_instalacion]
        );
        loteFinal = r.rows[0]?.fi_lote_id || null;
      }

      const insert = await client.query(
        `INSERT INTO engorda (
          fi_instalacion_id, fi_lote_id, cantidad, talla_gr,
          observacion, fecha_siembra, fecha_biometria,
          fi_usuario_id, fc_granja, fecha_registro
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE)
        RETURNING fi_engorda_id`,
        [
          data.fi_instalacion_id, loteFinal, data.cantidad,
          data.talla_gr, data.observacion, data.fecha_siembra,
          data.fecha_biometria, data.fi_usuario_id, data.fc_granja,
        ]
      );

      const destinoId = insert.rows[0].fi_engorda_id;

      // Restar origen
      if (origenEsLote) {
        await client.query(
          "UPDATE lotes SET alevines_inicial = alevines_inicial - $1 WHERE fi_lote_id = $2",
          [data.cantidad, data.origen_instalacion]
        );
      } else {
        await client.query(
          "UPDATE engorda SET cantidad = cantidad - $1 WHERE fi_engorda_id = $2",
          [data.cantidad, data.origen_instalacion]
        );
      }

      // Trazabilidad
      if (origenEsLote) {
        await client.query(
          `INSERT INTO trazabilidad_engorda (
            fi_engorda_destino, cantidad_trasladada,
            fecha_movimiento, observacion, fi_usuario_id
          ) VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
          [destinoId, data.cantidad, data.observacion, data.fi_usuario_id]
        );
      } else {
        await client.query(
          `INSERT INTO trazabilidad_engorda (
            fi_engorda_origen, fi_engorda_destino,
            cantidad_trasladada, fecha_movimiento,
            observacion, fi_usuario_id
          ) VALUES ($1,$2,$3,CURRENT_DATE,$4,$5)`,
          [
            data.origen_instalacion, destinoId, data.cantidad,
            data.observacion, data.fi_usuario_id,
          ]
        );
      }

      await client.query("COMMIT");
      return { created: true };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    await pool.query(
      "DELETE FROM trazabilidad_engorda WHERE fi_engorda_origen = $1 OR fi_engorda_destino = $1",
      [id]
    );
    const result = await pool.query(
      "DELETE FROM engorda WHERE fi_engorda_id = $1 RETURNING *",
      [id]
    );
    return result.rowCount;
  }

  static async getMovimientos(usuarioId) {
    const result = await pool.query(
      `SELECT
        t.fi_movimiento_id,
        COALESCE(io.nombre_instalacion, 'Siembra Lote') AS origen_nombre,
        idst.nombre_instalacion AS destino_nombre,
        t.cantidad_trasladada,
        t.fecha_movimiento,
        t.observacion
      FROM trazabilidad_engorda t
      LEFT JOIN engorda eo ON eo.fi_engorda_id = t.fi_engorda_origen
      LEFT JOIN instalaciones io ON io.fi_instalacion_id = eo.fi_instalacion_id
      LEFT JOIN engorda ed ON ed.fi_engorda_id = t.fi_engorda_destino
      LEFT JOIN instalaciones idst ON idst.fi_instalacion_id = ed.fi_instalacion_id
      WHERE t.fi_usuario_id = $1
      ORDER BY t.fi_movimiento_id DESC`,
      [usuarioId]
    );
    return result.rows;
  }

  static async deleteMovimiento(movimientoId) {
    const result = await pool.query(
      "DELETE FROM trazabilidad_engorda WHERE fi_movimiento_id = $1 RETURNING *",
      [movimientoId]
    );
    return result.rowCount;
  }
}

export default EngordaModel;

import pool from "../db.js";

class ReproductorModel {
  static async getMovimientos(granja) {
    const result = await pool.query(
      `SELECT
        rr.fi_movimiento_id,
        rr.origen_texto AS origen,
        i.nombre_instalacion AS destino,
        rr.cantidad_trasladada,
        rr.fd_fecha_movimiento AS fecha_movimiento,
        rr.observacion
      FROM trazabilidad_reproductores rr
      INNER JOIN reproductores r ON r.fi_reproductor_id = rr.fi_repro_destino
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = r.fi_instalacion_id
      WHERE LOWER(r.fc_granja) = LOWER($1)
      ORDER BY rr.fi_movimiento_id DESC`,
      [granja]
    );
    return result.rows;
  }

  static async getByGranja(granja) {
    const result = await pool.query(
      `SELECT
        r.fi_reproductor_id, r.fi_instalacion_id,
        i.nombre_instalacion,
        r.fn_cantidad, r.fn_talla,
        r.fn_machos, r.fn_hembras, r.fc_ratio, r.fc_linea, r.fc_familia,
        r.fc_observacion, r.fd_fecha_siembra, r.fd_fecha_biometria,
        CURRENT_DATE - r.fd_fecha_siembra AS dias_en_pila
      FROM reproductores r
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = r.fi_instalacion_id
      WHERE LOWER(r.fc_granja) = LOWER($1)
      ORDER BY r.fi_reproductor_id DESC`,
      [granja]
    );
    return result.rows;
  }

  static async getInstalaciones(granja) {
    const result = await pool.query(
      `SELECT fi_instalacion_id, nombre_instalacion, fc_granja
       FROM instalaciones
       WHERE LOWER(fc_granja) = LOWER($1)
       ORDER BY nombre_instalacion ASC`,
      [granja]
    );
    return result.rows;
  }

  static async create(data) {
    const machos = Number(data.fn_machos || 0);
    const hembras = Number(data.fn_hembras || 0);
    const cantidad = machos + hembras;

    let fc_ratio = null;
    if (machos > 0 && hembras > 0) {
      const r = hembras / machos;
      fc_ratio = `1:${Math.round(r * 100) / 100}`;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const repro = await client.query(
        `INSERT INTO reproductores (
          fi_instalacion_id, fn_talla,
          fd_fecha_siembra, fd_fecha_biometria,
          fi_usuario_id, fc_granja,
          fn_machos, fn_hembras, fc_ratio,
          fc_linea, fc_familia, fc_observacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12
        ) RETURNING fi_reproductor_id`,
        [
          data.fi_instalacion_id, data.fn_talla,
          data.fd_fecha_siembra, data.fd_fecha_biometria,
          data.fi_usuario_id, data.fc_granja,
          machos, hembras, fc_ratio,
          data.fc_linea, data.fc_familia, data.fc_observacion,
        ]
      );

      const reproId = repro.rows[0].fi_reproductor_id;

      await client.query(
        `INSERT INTO trazabilidad_reproductores (
          fi_repro_origen, origen_texto, fi_repro_destino,
          cantidad_trasladada, fd_fecha_movimiento,
          observacion, fi_usuario_id
        ) VALUES (NULL, $1, $2, $3, CURRENT_DATE, $4, $5)`,
        [
          data.origen_texto, reproId, cantidad,
          data.fc_observacion || null, data.fi_usuario_id,
        ]
      );

      await client.query("COMMIT");
      return { reproId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async update(id, data) {
    const machos = Number(data.fn_machos || 0);
    const hembras = Number(data.fn_hembras || 0);
    const cantidad = machos + hembras;

    let fc_ratio = null;
    if (machos > 0 && hembras > 0) {
      const r = hembras / machos;
      fc_ratio = `1:${Math.round(r * 100) / 100}`;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE reproductores SET
          fi_instalacion_id = $1, fn_talla = $2,
          fn_machos = $3, fn_hembras = $4,
          fc_ratio = $5, fc_linea = $6, fc_familia = $7,
          fc_observacion = $8, fd_fecha_siembra = $9,
          fd_fecha_biometria = $10
        WHERE fi_reproductor_id = $11`,
        [
          data.fi_instalacion_id, data.fn_talla,
          machos, hembras, fc_ratio,
          data.fc_linea, data.fc_familia, data.fc_observacion,
          data.fd_fecha_siembra, data.fd_fecha_biometria, id,
        ]
      );

      await client.query(
        `INSERT INTO trazabilidad_reproductores (
          fi_repro_origen, origen_texto, fi_repro_destino,
          cantidad_trasladada, fd_fecha_movimiento,
          observacion, fi_usuario_id
        ) VALUES (NULL, $1, $2, $3, CURRENT_DATE, $4, $5)`,
        [
          data.origen_texto, id, cantidad,
          data.fc_observacion, data.fi_usuario_id,
        ]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "DELETE FROM trazabilidad_reproductores WHERE fi_repro_destino = $1 OR fi_repro_origen = $1",
        [id]
      );
      await client.query(
        "DELETE FROM reproductores WHERE fi_reproductor_id = $1",
        [id]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

export default ReproductorModel;

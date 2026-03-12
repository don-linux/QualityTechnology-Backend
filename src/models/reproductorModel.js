import pool from "../db.js";

class ReproductorModel {
  static async getMovimientos(granja) {
    const result = await pool.query(
      `SELECT
        rr.fi_movimiento_id,
        rr.origen_texto AS origen,
        r.fc_instalacion AS destino,
        rr.cantidad_trasladada,
        rr.fecha_movimiento,
        rr.observacion
      FROM trazabilidad_reproductores rr
      INNER JOIN reproductores r ON r.fi_reproductor_id = rr.fi_repro_destino
      WHERE LOWER(r.fc_granja) = LOWER($1)
      ORDER BY rr.fi_movimiento_id DESC`,
      [granja]
    );
    return result.rows;
  }

  static async getByGranja(granja) {
    const result = await pool.query(
      `SELECT
        fi_reproductor_id, fc_instalacion, fn_cantidad, fn_talla,
        fn_machos, fn_hembras, fc_ratio, fc_linea, fc_familia,
        fc_observacion, fd_fecha_siembra, fd_fecha_biometria,
        CURRENT_DATE - fd_fecha_siembra AS dias_en_pila
      FROM reproductores
      WHERE LOWER(fc_granja) = LOWER($1)
      ORDER BY fi_reproductor_id DESC`,
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
          fc_instalacion, fn_cantidad, fn_talla,
          fd_fecha_siembra, fd_fecha_biometria,
          fi_usuario_id, fc_granja,
          fn_machos, fn_hembras, fc_ratio,
          fc_linea, fc_familia, fc_observacion,
          fd_fecha_registro
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          COALESCE(NULLIF($7,''),'Granja Acuicola Medellin'),
          $8, $9, $10, $11, $12, $13,
          CURRENT_TIMESTAMP
        ) RETURNING fi_reproductor_id`,
        [
          data.fc_instalacion, cantidad, data.fn_talla,
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
          cantidad_trasladada, fecha_movimiento,
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
          fc_instalacion = $1, fn_talla = $2,
          fn_machos = $3, fn_hembras = $4, fn_cantidad = $5,
          fc_ratio = $6, fc_linea = $7, fc_familia = $8,
          fc_observacion = $9, fd_fecha_siembra = $10,
          fd_fecha_biometria = $11
        WHERE fi_reproductor_id = $12`,
        [
          data.fc_instalacion, data.fn_talla,
          machos, hembras, cantidad, fc_ratio,
          data.fc_linea, data.fc_familia, data.fc_observacion,
          data.fd_fecha_siembra, data.fd_fecha_biometria, id,
        ]
      );

      await client.query(
        `INSERT INTO trazabilidad_reproductores (
          fi_repro_origen, origen_texto, fi_repro_destino,
          cantidad_trasladada, fecha_movimiento,
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
    await pool.query(
      "DELETE FROM reproductores WHERE fi_reproductor_id = $1",
      [id]
    );
  }
}

export default ReproductorModel;

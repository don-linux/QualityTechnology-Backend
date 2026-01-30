import pool from "../config/database.js";

/**
 * Modelo de Piletas
 * Maneja todas las consultas a la base de datos relacionadas con piletas
 */
export const piletasModel = {
  /**
   * Obtener todas las piletas (para administradores)
   */
  findAll: async () => {
    const result = await pool.query(`
      SELECT
        p.fi_pileta_id,
        i.fi_instalacion_id,
        i.nombre_instalacion AS destino_nombre,
        i.material,
        i.metros_cubicos,
        p.origen_instalacion,
        p.cantidad,
        p.talla_gr,
        p.no_lote,
        p.observacion,
        p.fecha_siembra,
        p.fecha_ultima_biometria,
        CURRENT_DATE - p.fecha_siembra AS dias_en_pila,
        CURRENT_DATE - p.fecha_ultima_biometria AS dias_transcurridos,
        p.fi_usuario_id,
        p.fc_granja
      FROM piletas p
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = p.fi_instalacion_id
      ORDER BY p.fi_pileta_id DESC
    `);
    return result.rows;
  },

  /**
   * Obtener piletas por usuario_id
   */
  findByUsuarioId: async (usuario_id) => {
    const result = await pool.query(
      `
      SELECT
        p.fi_pileta_id,
        i.fi_instalacion_id,
        i.nombre_instalacion AS destino_nombre,
        i.material,
        i.metros_cubicos,
        p.origen_instalacion,
        p.cantidad,
        p.talla_gr,
        p.no_lote,
        p.observacion,
        p.fecha_siembra,
        p.fecha_ultima_biometria,
        CURRENT_DATE - p.fecha_siembra AS dias_en_pila,
        CURRENT_DATE - p.fecha_ultima_biometria AS dias_transcurridos,
        p.fi_usuario_id,
        p.fc_granja
      FROM piletas p
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = p.fi_instalacion_id
      WHERE p.fi_usuario_id = $1
      ORDER BY p.fi_pileta_id DESC
    `,
      [usuario_id]
    );
    return result.rows;
  },

  /**
   * Obtener piletas por granja
   */
  findByGranja: async (nombre) => {
    const result = await pool.query(
      `
      SELECT
        p.fi_pileta_id,
        i.fi_instalacion_id,
        i.nombre_instalacion AS destino_nombre,
        i.material,
        i.metros_cubicos,
        p.origen_instalacion,
        p.cantidad,
        p.talla_gr,
        p.no_lote,
        p.observacion,
        p.fecha_siembra,
        p.fecha_ultima_biometria,
        CURRENT_DATE - p.fecha_siembra AS dias_en_pila,
        CURRENT_DATE - p.fecha_ultima_biometria AS dias_transcurridos,
        p.fi_usuario_id,
        p.fc_granja
      FROM piletas p
      LEFT JOIN instalaciones i ON i.fi_instalacion_id = p.fi_instalacion_id
      WHERE p.fc_granja ILIKE $1
      ORDER BY p.fi_pileta_id DESC
      `,
      [`%${nombre}%`]
    );
    return result.rows;
  },

  /**
   * Obtener pileta por ID
   */
  findById: async (id) => {
    const result = await pool.query(
      "SELECT * FROM piletas WHERE fi_pileta_id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * Crear nueva pileta o movimiento (con transacción)
   */
  createWithTransaction: async (data) => {
    const {
      fi_instalacion_id,
      origen_instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
      fi_usuario_id,
      fc_granja,
    } = data;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Verificar que el origen pertenezca a la misma granja
      if (origen_instalacion && !isNaN(parseInt(origen_instalacion))) {
        const { rows } = await client.query(
          "SELECT fc_granja FROM piletas WHERE fi_pileta_id = $1",
          [origen_instalacion]
        );
        const granjaOrigen = rows[0]?.fc_granja ?? null;

        if (!granjaOrigen) {
          throw new Error("El origen no existe o no tiene granja definida.");
        }

        if (
          granjaOrigen.trim().toLowerCase() !== fc_granja.trim().toLowerCase()
        ) {
          throw new Error(
            `No se puede trasladar entre granjas distintas (${granjaOrigen} → ${fc_granja}).`
          );
        }
      }

      // 2. Buscar si ya existe una pileta destino en la misma instalación y granja
      const existingPileta = await client.query(
        `
        SELECT fi_pileta_id, cantidad
        FROM piletas
        WHERE fi_instalacion_id = $1
          AND LOWER(fc_granja) = LOWER($2)
        `,
        [fi_instalacion_id, fc_granja]
      );

      let destinoPiletaId;

      if (existingPileta.rowCount > 0) {
        // Ya existe → solo actualizar cantidad
        const currentQty = parseFloat(existingPileta.rows[0].cantidad || 0);
        const nuevaCantidad = currentQty + parseFloat(cantidad);

        await client.query(
          `
          UPDATE piletas
          SET cantidad = $1,
              talla_gr = $2,
              no_lote = $3,
              observacion = $4,
              fecha_ultima_biometria = $5,
              fd_fecha_modificacion = CURRENT_DATE
          WHERE fi_pileta_id = $6
          `,
          [
            nuevaCantidad,
            talla_gr,
            no_lote,
            observacion,
            fecha_ultima_biometria,
            existingPileta.rows[0].fi_pileta_id,
          ]
        );

        destinoPiletaId = existingPileta.rows[0].fi_pileta_id;
      } else {
        // No existe → crear nueva
        const insertPileta = await client.query(
          `
          INSERT INTO piletas (
            fi_instalacion_id,
            origen_instalacion,
            cantidad,
            talla_gr,
            no_lote,
            observacion,
            fecha_siembra,
            fecha_ultima_biometria,
            fi_usuario_id,
            fc_granja,
            fecha_registro,
            fd_fecha_modificacion
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, CURRENT_DATE
          )
          RETURNING fi_pileta_id
          `,
          [
            fi_instalacion_id,
            origen_instalacion,
            cantidad,
            talla_gr,
            no_lote,
            observacion,
            fecha_siembra,
            fecha_ultima_biometria,
            fi_usuario_id,
            fc_granja,
          ]
        );
        destinoPiletaId = insertPileta.rows[0].fi_pileta_id;
      }

      // 3. Si hay origen, ajustar stock y registrar movimiento
      if (origen_instalacion && !isNaN(parseInt(origen_instalacion))) {
        const origenId = parseInt(origen_instalacion, 10);

        // Restar del origen
        await client.query(
          `
          UPDATE piletas
          SET cantidad = GREATEST(cantidad - $1, 0),
              fd_fecha_modificacion = CURRENT_DATE
          WHERE fi_pileta_id = $2
          `,
          [cantidad, origenId]
        );

        // Registrar el movimiento en rastreabilidad
        await client.query(
          `
          INSERT INTO rastreabilidad (
            fi_pileta_origen,
            fi_pileta_destino,
            cantidad_trasladada,
            fecha_movimiento,
            observacion,
            fi_usuario_id
          )
          VALUES ($1, $2, $3, CURRENT_DATE, $4, $5)
          `,
          [origenId, destinoPiletaId, cantidad, observacion, fi_usuario_id]
        );
      }

      await client.query("COMMIT");
      return { message: "Movimiento registrado sin duplicar piletas." };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Crear nueva pileta (simple)
   */
  create: async (piletaData) => {
    const {
      fi_instalacion_id,
      origen_instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
      fi_usuario_id,
      fc_granja,
    } = piletaData;

    const result = await pool.query(
      `
      INSERT INTO piletas (
        fi_instalacion_id,
        origen_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
        fc_granja,
        fecha_registro,
        fd_fecha_modificacion
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE, CURRENT_DATE)
      RETURNING *
    `,
      [
        fi_instalacion_id,
        origen_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
        fc_granja,
      ]
    );
    return result.rows[0];
  },

  /**
   * Actualizar pileta
   */
  update: async (id, piletaData) => {
    const {
      fi_instalacion_id,
      origen_instalacion,
      cantidad,
      talla_gr,
      no_lote,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
      fc_granja,
    } = piletaData;

    const result = await pool.query(
      `
      UPDATE piletas
      SET fi_instalacion_id = $1,
          origen_instalacion = $2,
          cantidad = $3,
          talla_gr = $4,
          no_lote = $5,
          observacion = $6,
          fecha_siembra = $7,
          fecha_ultima_biometria = $8,
          fc_granja = $9,
          fd_fecha_modificacion = CURRENT_DATE
      WHERE fi_pileta_id = $10
      RETURNING *
    `,
      [
        fi_instalacion_id,
        origen_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fc_granja,
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar pileta
   */
  delete: async (id) => {
    await pool.query("DELETE FROM piletas WHERE fi_pileta_id = $1", [id]);
    return true;
  },

  /**
   * Obtener rastreabilidad por usuario y granja
   */
  getRastreabilidad: async (usuario_id, granja) => {
    const result = await pool.query(
      `
      SELECT
        r.fi_movimiento_id,
        po.nombre_instalacion AS origen_nombre,
        pd.nombre_instalacion AS destino_nombre,
        r.cantidad_trasladada,
        r.fecha_movimiento,
        r.observacion,
        p_origen.fc_granja AS origen_granja,
        p_destino.fc_granja AS destino_granja
      FROM rastreabilidad r
      LEFT JOIN piletas p_origen ON p_origen.fi_pileta_id = r.fi_pileta_origen
      LEFT JOIN instalaciones po ON po.fi_instalacion_id = p_origen.fi_instalacion_id
      LEFT JOIN piletas p_destino ON p_destino.fi_pileta_id = r.fi_pileta_destino
      LEFT JOIN instalaciones pd ON pd.fi_instalacion_id = p_destino.fi_instalacion_id
      WHERE r.fi_usuario_id = $1
        AND (
          LOWER(p_origen.fc_granja) LIKE LOWER($2)
          OR LOWER(p_destino.fc_granja) LIKE LOWER($2)
        )
      ORDER BY r.fecha_movimiento DESC
      `,
      [usuario_id, `%${granja}%`]
    );
    return result.rows;
  },

  /**
   * Filtrar rastreabilidad
   */
  filtrarRastreabilidad: async (usuario_id, granja, filters) => {
    const { buscar, fecha_inicio, fecha_fin } = filters;

    const condiciones = ["r.fi_usuario_id = $1"];
    const valores = [usuario_id];
    let index = 2;

    if (buscar && buscar.trim() !== "") {
      condiciones.push(`
        (
          LOWER(po.nombre_instalacion) LIKE LOWER($${index})
          OR LOWER(pd.nombre_instalacion) LIKE LOWER($${index})
          OR LOWER(r.observacion) LIKE LOWER($${index})
        )
      `);
      valores.push(`%${buscar}%`);
      index++;
    }

    if (fecha_inicio && fecha_fin) {
      condiciones.push(
        `r.fecha_movimiento BETWEEN $${index} AND $${index + 1}`
      );
      valores.push(fecha_inicio, fecha_fin);
      index += 2;
    }

    condiciones.push(`
      (
        LOWER(p_origen.fc_granja) LIKE LOWER($${index})
        OR LOWER(p_destino.fc_granja) LIKE LOWER($${index})
      )
    `);
    valores.push(`%${granja}%`);

    const query = `
      SELECT
        r.fi_movimiento_id,
        po.nombre_instalacion AS origen_nombre,
        pd.nombre_instalacion AS destino_nombre,
        r.cantidad_trasladada,
        r.fecha_movimiento,
        r.observacion,
        p_origen.fc_granja AS origen_granja,
        p_destino.fc_granja AS destino_granja
      FROM rastreabilidad r
      LEFT JOIN piletas p_origen ON p_origen.fi_pileta_id = r.fi_pileta_origen
      LEFT JOIN instalaciones po ON po.fi_instalacion_id = p_origen.fi_instalacion_id
      LEFT JOIN piletas p_destino ON p_destino.fi_pileta_id = r.fi_pileta_destino
      LEFT JOIN instalaciones pd ON pd.fi_instalacion_id = p_destino.fi_instalacion_id
      WHERE ${condiciones.join(" AND ")}
      ORDER BY r.fecha_movimiento DESC
    `;

    const result = await pool.query(query, valores);
    return result.rows;
  },

  /**
   * Eliminar rastreabilidad
   */
  deleteRastreabilidad: async (movimiento_id, eliminar_todos, granja) => {
    if (eliminar_todos && granja) {
      await pool.query(
        `
        DELETE FROM rastreabilidad
        WHERE fi_movimiento_id IN (
          SELECT r.fi_movimiento_id
          FROM rastreabilidad r
          LEFT JOIN piletas p1 ON p1.fi_pileta_id = r.fi_pileta_origen
          LEFT JOIN piletas p2 ON p2.fi_pileta_id = r.fi_pileta_destino
          WHERE LOWER(p1.fc_granja) LIKE LOWER($1)
             OR LOWER(p2.fc_granja) LIKE LOWER($1)
        )
        `,
        [`%${granja}%`]
      );
      return {
        message: `Todos los movimientos de la granja '${granja}' fueron eliminados.`,
      };
    }

    if (!movimiento_id) {
      throw new Error(
        "Debe especificar un movimiento_id o activar eliminar_todos con granja"
      );
    }

    await pool.query(
      "DELETE FROM rastreabilidad WHERE fi_movimiento_id = $1",
      [movimiento_id]
    );
    return { message: "Movimiento eliminado correctamente." };
  },

  /**
   * Obtener inventario por granja
   */
  getInventario: async (granja) => {
    const result = await pool.query(
      `
      SELECT
        i.fi_instalacion_id,
        i.nombre_instalacion,
        ROUND(i.metros_cubicos::numeric, 2) AS metros_cubicos,
        i.material,
        p.fi_pileta_id,
        COALESCE(p.cantidad, 0) AS cantidad,
        COALESCE(p.talla_gr, 0) AS talla_gr,
        COALESCE(p.no_lote::text, '-') AS no_lote,
        COALESCE(p.observacion, '-') AS observacion,
        p.fecha_siembra,
        p.fecha_ultima_biometria,
        CURRENT_DATE - p.fecha_siembra AS dias_en_pila,
        CURRENT_DATE - p.fecha_ultima_biometria AS dias_transcurridos
      FROM instalaciones i
      LEFT JOIN piletas p ON p.fi_instalacion_id = i.fi_instalacion_id
      WHERE LOWER(TRIM(i.fc_granja)) = LOWER(TRIM($1))
      ORDER BY i.nombre_instalacion ASC
      `,
      [granja]
    );
    return result.rows;
  },
};

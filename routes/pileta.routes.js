import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ============================================================
   NORMALIZAR GRANJA → nombres reales de BD
============================================================ */
function normalizarGranja(granja) {
  if (!granja) return "Granja Acuícola Medellin";
  const g = granja.toLowerCase();
  if (g.includes("med")) return "Granja Acuícola Medellin";
  if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
  return "Granja Acuícola Medellin";
}

/* ============================================================
   1. GET — LOTES POR GRANJA
============================================================ */
router.get("/lotes/:granja", async (req, res) => {
  const granja = normalizarGranja(req.params.granja);

  try {
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
        ON l.fi_instalacion_id = i.fi_instalacion_id::text  -- 👈 FIX DEFINITIVO
      WHERE LOWER(l.fc_granja) = LOWER($1)
      ORDER BY l.no_lote ASC
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error lotes:", err);
    res.status(500).json({ error: "Error cargando lotes" });
  }
});

/* ============================================================
   2. GET — INVENTARIO DE PILETAS
============================================================ */
router.get("/inventario/:granja", async (req, res) => {
  const granja = normalizarGranja(req.params.granja);

  try {
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
      LEFT JOIN instalaciones i 
        ON p.fi_instalacion_id = i.fi_instalacion_id   

      LEFT JOIN lotes l
        ON p.fi_lote_id = l.fi_lote_id                 

      WHERE LOWER(p.fc_granja) = LOWER($1)
      ORDER BY p.fi_pileta_id DESC
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error inventario:", err);
    res.status(500).json({ error: "Error cargando inventario" });
  }
});

/* ============================================================
   3. GET — TODAS LAS INSTALACIONES (ORIGEN / DESTINO)
============================================================ */
router.get("/origen/:granja", async (req, res) => {
  const granja = normalizarGranja(req.params.granja);

  try {
    const result = await pool.query(
      `
      SELECT fi_instalacion_id, nombre_instalacion
      FROM instalaciones
      WHERE LOWER(fc_granja) = LOWER($1)
      ORDER BY nombre_instalacion ASC
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error origen instalaciones:", err);
    res.status(500).json({ error: "Error obteniendo instalaciones" });
  }
});

/* ============================================================
   4. GET — LOTE SEGÚN INSTALACIÓN + GRANJA
============================================================ */
router.get("/lote-por-inst/:inst/:granja", async (req, res) => {
  try {
    const instId = req.params.inst; 
    const granja = normalizarGranja(req.params.granja);

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

    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("❌ Error lote según instalación:", err);
    res.status(500).json({ error: "Error obteniendo lote" });
  }
});
/* ============================================================
   5. POST — SIEMBRA (Insert + Update con suma de lote)
============================================================ */
router.post("/siembra", async (req, res) => {
  try {
    const {
      fi_pileta_id,
      fi_instalacion_id,
      origen_instalacion,
      fi_lote_id,
      cantidad,
      talla_gr,
      observacion,
      fecha_siembra,
      fecha_ultima_biometria,
      fi_usuario_id,
      fc_granja
    } = req.body;

    // ----------------------------------------------------------
    // 🟢 SI ES UPDATE (se modifica una pileta existente)
    // ----------------------------------------------------------
    if (fi_pileta_id) {

      // Obtener cantidad anterior
      const prev = await pool.query(
        `SELECT cantidad FROM piletas WHERE fi_pileta_id = $1`,
        [fi_pileta_id]
      );

      const cantidad_anterior = prev.rows[0].cantidad || 0;

      // Actualizar la pileta
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
        [
          fi_instalacion_id,
          origen_instalacion,
          fi_lote_id,
          cantidad,
          talla_gr,
          observacion,
          fecha_siembra,
          fecha_ultima_biometria,
          fi_usuario_id,
          fi_pileta_id
        ]
      );

      // 🔥 Actualizar el lote (restar anterior + sumar nuevo)
      await pool.query(
        `
        UPDATE lotes
        SET alevines_inicial = alevines_inicial - $1 + $2
        WHERE fi_lote_id = $3
        `,
        [cantidad_anterior, cantidad, fi_lote_id]
      );

      return res.json({ success: true, message: "Actualizado correctamente" });
    }

    // ----------------------------------------------------------
    // 🟢 SI ES INSERT (nueva pileta)
    // ----------------------------------------------------------
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
      [
        fi_instalacion_id,
        origen_instalacion,
        fi_lote_id,
        cantidad,
        talla_gr,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
        fc_granja
      ]
    );

    // 🔥 SUMAR AL LOTE
    await pool.query(
      `UPDATE lotes SET alevines_inicial = alevines_inicial + $1 WHERE fi_lote_id = $2`,
      [cantidad, fi_lote_id]
    );

    res.json({ success: true, message: "Registrado correctamente" });

  } catch (err) {
    console.error("❌ Error siembra:", err);
    res.status(500).json({ error: "Error registrando siembra" });
  }
});

/* ============================================================
   6. DELETE — PILETA (resta del lote)
============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener cantidad y lote antes de borrar
    const prev = await pool.query(
      `SELECT cantidad, fi_lote_id FROM piletas WHERE fi_pileta_id = $1`,
      [id]
    );

    if (prev.rowCount === 0) {
      return res.status(404).json({ error: "No existe la pileta" });
    }

    const { cantidad, fi_lote_id } = prev.rows[0];

    // Borrar pileta
    await pool.query(
      `DELETE FROM piletas WHERE fi_pileta_id = $1`,
      [id]
    );

    // Restar al lote
    await pool.query(
      `UPDATE lotes SET alevines_inicial = alevines_inicial - $1 WHERE fi_lote_id = $2`,
      [cantidad, fi_lote_id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Error eliminando pileta:", err);
    res.status(500).json({ error: "Error eliminando pileta" });
  }
});

/* ============================================================
   7. TRAZABILIDAD — MOVIMIENTOS ALEVINAJE
============================================================ */

/* ============================================================
   GET — LISTAR MOVIMIENTOS POR USUARIO + GRANJA
============================================================ */
router.get("/movimientos/:usuario/:granja", async (req, res) => {
  const { usuario, granja } = req.params;

  try {
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

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo movimientos:", err);
    res.status(500).json({ error: "Error obteniendo movimientos" });
  }
});


/* ============================================================
   GET — FILTRO DE MOVIMIENTOS
============================================================ */
router.get("/movimientos/filtro/:usuario/:granja", async (req, res) => {
  const { usuario, granja } = req.params;
  const { buscar = "", fecha_inicio = "", fecha_fin = "" } = req.query;

  try {
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

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error filtrando movimientos:", err);
    res.status(500).json({ error: "Error en filtrado" });
  }
});


/* ============================================================
   POST — REGISTRAR MOVIMIENTO
============================================================ */
router.post("/movimientos/registrar", async (req, res) => {
  try {
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
    } = req.body;

    if (!cantidad || cantidad <= 0)
      return res.status(400).json({ error: "Cantidad inválida" });

    // ----------------------------------------------------------
    // 1️⃣ REGISTRAR MOVIMIENTO
    // ----------------------------------------------------------
    const insert = await pool.query(
      `
      INSERT INTO alevinaje_movimientos
      (fi_pileta_origen, origen_externo, fi_pileta_destino, cantidad,
       fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, fc_granja)
      VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,$8,$9)
      RETURNING fi_movimiento_id
      `,
      [
        origen_instalacion || null,
        origen_externo || null,
        destino,
        cantidad,
        observacion,
        fi_usuario_id,
        fi_lote_id,
        tipo_movimiento,
        fc_granja
      ]
    );

    // ----------------------------------------------------------
    // 2️⃣ ACTUALIZAR INVENTARIO
    // ----------------------------------------------------------

    // 🔵 SI HAY ORIGEN (interno) → RESTA
    if (origen_instalacion) {
      await pool.query(
        `UPDATE piletas SET cantidad = cantidad - $1 WHERE fi_instalacion_id = $2`,
        [cantidad, origen_instalacion]
      );
    }

    // 🔵 SI HAY DESTINO → SUMA
    if (destino) {
      await pool.query(
        `UPDATE piletas SET cantidad = cantidad + $1 WHERE fi_instalacion_id = $2`,
        [cantidad, destino]
      );
    }

    res.json({ success: true, movimiento_id: insert.rows[0].fi_movimiento_id });

  } catch (err) {
    console.error("❌ Error registrando movimiento:", err);
    res.status(500).json({ error: "Error guardando movimiento" });
  }
});


/* ============================================================
   DELETE — ELIMINAR UNO O TODOS
============================================================ */
router.delete("/movimientos/eliminar", async (req, res) => {
  try {
    const { movimiento_id, eliminar_todos, granja } = req.body;

    // 🛑 ELIMINAR TODOS
    if (eliminar_todos && granja) {
      await pool.query(
        `DELETE FROM alevinaje_movimientos WHERE LOWER(fc_granja) = LOWER($1)`,
        [granja]
      );
      return res.json({ success: true });
    }

    // 🛑 ELIMINAR UNO
    if (movimiento_id) {
      await pool.query(
        `DELETE FROM alevinaje_movimientos WHERE fi_movimiento_id = $1`,
        [movimiento_id]
      );
      return res.json({ success: true });
    }

    res.status(400).json({ error: "Solicitud inválida" });

  } catch (err) {
    console.error("❌ Error eliminando movimiento:", err);
    res.status(500).json({ error: "Error eliminando movimiento" });
  }
});


export default router;

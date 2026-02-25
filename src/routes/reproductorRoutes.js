import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   🔁 GET – Trazabilidad por granja
========================================================= */
router.get("/movimientos/:granja", async (req, res) => {
  const { granja } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        rr.fi_movimiento_id,
        rr.origen_texto AS origen,
        r.fc_instalacion AS destino,
        rr.cantidad_trasladada,
        rr.fecha_movimiento,
        rr.observacion
      FROM trazabilidad_reproductores rr
      INNER JOIN reproductores r
        ON r.fi_reproductor_id = rr.fi_repro_destino
      WHERE LOWER(r.fc_granja) = LOWER($1)
      ORDER BY rr.fi_movimiento_id DESC;
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error trazabilidad:", err);
    res.status(500).json({ error: "Error al obtener trazabilidad" });
  }
});

/* =========================================================
   📋 GET – Reproductores por granja
========================================================= */
router.get("/granja/:granja", async (req, res) => {
  const { granja } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        fi_reproductor_id,
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_machos,
        fn_hembras,
        fc_ratio,
        fc_linea,
        fc_familia,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        CURRENT_DATE - fd_fecha_siembra AS dias_en_pila
      FROM reproductores
      WHERE LOWER(fc_granja) = LOWER($1)
      ORDER BY fi_reproductor_id DESC;
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error reproductores:", err);
    res.status(500).json({ error: "Error al obtener reproductores" });
  }
});

/* =========================================================
   📌 GET – Instalaciones por granja
========================================================= */
router.get("/instalaciones/:granja", async (req, res) => {
  const { granja } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        fc_granja
      FROM instalaciones
      WHERE LOWER(fc_granja) = LOWER($1)
      ORDER BY nombre_instalacion ASC;
      `,
      [granja]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error instalaciones:", err);
    res.status(500).json({ error: "Error obteniendo instalaciones" });
  }
});

/* =========================================================
   ✅ POST – Registrar reproductor + trazabilidad
========================================================= */
router.post("/", async (req, res) => {
  const {
      fc_instalacion,
      origen_texto,
      origen_tipo,   
      fn_talla,
      fi_usuario_id,
      fc_granja,
      fn_machos,
      fn_hembras,
      fc_linea,
      fc_familia,
      fc_observacion,
    } = req.body;

  if (!origen_texto || origen_texto.trim() === "") {
    return res.status(400).json({
      error: "Debe especificar el origen del reproductor",
    });
  }

  const machos = Number(fn_machos || 0);
  const hembras = Number(fn_hembras || 0);
  const cantidad = machos + hembras;

  let fc_ratio = null;
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    const r2 = Math.round(r * 100) / 100; 
    fc_ratio = `1:${r2}`;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const repro = await client.query(
      `
      INSERT INTO reproductores (
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fd_fecha_siembra,
        fd_fecha_biometria,
        fi_usuario_id,
        fc_granja,
        fn_machos,
        fn_hembras,
        fc_ratio,
        fc_linea,
        fc_familia,
        fc_observacion,
        fd_fecha_registro
      )
      VALUES (
        $1, $2, $3,
        $4,                 
        $5,                 
        $6,
        COALESCE(NULLIF($7,''),'Granja Acuícola Medellin'),
        $8, $9, $10, $11, $12, $13,
        CURRENT_TIMESTAMP
      )
      RETURNING fi_reproductor_id;
      `,
      [
        fc_instalacion,
        cantidad,
        fn_talla,
        req.body.fd_fecha_siembra,     
        req.body.fd_fecha_biometria,   
        fi_usuario_id,
        fc_granja,
        machos,
        hembras,
        fc_ratio,
        fc_linea,
        fc_familia,
        fc_observacion,
      ]
    );

    const reproId = repro.rows[0].fi_reproductor_id;

    await client.query(
      `
      INSERT INTO trazabilidad_reproductores (
        fi_repro_origen,
        origen_texto,
        fi_repro_destino,
        cantidad_trasladada,
        fecha_movimiento,
        observacion,
        fi_usuario_id
      )
      VALUES (
        NULL,
        $1,
        $2,
        $3,
        CURRENT_DATE,
        $4,
        $5
      );
      `,
      [
        origen_texto,
        reproId,
        cantidad,
        fc_observacion || null,
        fi_usuario_id,
      ]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "✅ Reproductor y trazabilidad registrados correctamente",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error registrar reproductor:", err);
    res.status(500).json({ error: "Error al registrar reproductor" });
  } finally {
    client.release();
  }
});

/* =========================================================
   ✏️ PUT – Actualizar reproductor + trazabilidad
========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    origen_texto,
    origen_tipo,
    fc_instalacion,
    fn_talla,
    fn_machos,
    fn_hembras,
    fc_linea,
    fc_familia,
    fc_observacion,
    fd_fecha_siembra,
    fd_fecha_biometria,
    fi_usuario_id,
  } = req.body;

  const machos = Number(fn_machos || 0);
  const hembras = Number(fn_hembras || 0);
  const cantidad = machos + hembras;

  let fc_ratio = null;
  if (machos > 0 && hembras > 0) {
  const r = hembras / machos;
  const r2 = Math.round(r * 100) / 100; 
  fc_ratio = `1:${r2}`;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      UPDATE reproductores
      SET
        fc_instalacion = $1,
        fn_talla = $2,
        fn_machos = $3,
        fn_hembras = $4,
        fn_cantidad = $5,
        fc_ratio = $6,
        fc_linea = $7,
        fc_familia = $8,
        fc_observacion = $9,
        fd_fecha_siembra = $10,
        fd_fecha_biometria = $11
      WHERE fi_reproductor_id = $12;
      `,
      [
        fc_instalacion,
        fn_talla,
        machos,
        hembras,
        cantidad,
        fc_ratio,
        fc_linea,
        fc_familia,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        id,
      ]
    );

    await client.query(
      `
      INSERT INTO trazabilidad_reproductores (
        fi_repro_origen,
        origen_texto,
        fi_repro_destino,
        cantidad_trasladada,
        fecha_movimiento,
        observacion,
        fi_usuario_id
      )
      VALUES (
        NULL,
        $1,
        $2,
        $3,
        CURRENT_DATE,
        $4,
        $5
      );
      `,
      [origen_texto, id, cantidad, fc_observacion, fi_usuario_id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Reproductor actualizado y trazabilidad registrada",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error actualizar reproductor:", err);
    res.status(500).json({ error: "Error al actualizar reproductor" });
  } finally {
    client.release();
  }
});

/* =========================================================
   🗑 DELETE – Eliminar reproductor
========================================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM reproductores WHERE fi_reproductor_id = $1",
      [id]
    );

    res.json({ success: true, message: "✅ Reproductor eliminado" });
  } catch (err) {
    console.error("❌ Error eliminar:", err);
    res.status(500).json({ error: "Error al eliminar reproductor" });
  }
});

export default router;
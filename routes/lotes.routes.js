import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------------------------
   🏷 Normalizar texto de granja
-------------------------------------------------------- */
function normalizarGranja(valor) {
  if (!valor) return "Granja Acuícola Medellin";

  const v = valor.toLowerCase();
  if (v.includes("medell")) return "Granja Acuícola Medellin";
  if (v.includes("ceiba")) return "Granja Acuícola La Ceiba";

  return "Granja Acuícola Medellin";
}

/* --------------------------------------------------------
   GET - Todas las instalaciones por granja
-------------------------------------------------------- */
router.get("/instalaciones/:granja", async (req, res) => {
  const granja = normalizarGranja(req.params.granja);

  try {
    const result = await pool.query(
      `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion
      FROM instalaciones
      WHERE fc_granja = $1
      ORDER BY nombre_instalacion ASC;
      `,
      [granja]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error al obtener instalaciones:", err);
    res.status(500).send("Error obteniendo instalaciones");
  }
});

/* --------------------------------------------------------
   📌 GET - Obtener familia por instalación
-------------------------------------------------------- */
router.get("/familia/:instalacion", async (req, res) => {
  const instalacion = req.params.instalacion;

  try {
    const result = await pool.query(`
      SELECT fc_familia 
      FROM reproductores
      WHERE fc_instalacion = $1
      ORDER BY fi_reproductor_id DESC
      LIMIT 1;
    `, [instalacion]);

    res.json(result.rows.length > 0 ? result.rows[0] : { fc_familia: "" });
  } catch (err) {
    console.error("❌ Error al obtener familia:", err);
    res.status(500).send("Error al obtener familia");
  }
});


/* --------------------------------------------------------
   📌 GET - Obtener lotes por granja (MOSTRAR INSTALACIÓN REAL)
-------------------------------------------------------- */
router.get("/granja/:granja", async (req, res) => {
  const granja = normalizarGranja(req.params.granja);

  try {
    const result = await pool.query(
      `
      SELECT 
        l.*,
        r.fc_instalacion AS nombre_instalacion
      FROM lotes l
      LEFT JOIN reproductores r
        ON l.fi_instalacion_id = r.fc_instalacion
      WHERE l.fc_granja = $1
      ORDER BY l.fecha DESC
      `,
      [granja]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error al obtener lotes por granja:", err);
    res.status(500).send("Error al obtener lotes por granja");
  }
});


/* --------------------------------------------------------
   📌 POST - Registrar un nuevo lote
-------------------------------------------------------- */
router.post("/", async (req, res) => {
  const {
    fecha,
    familia,
    fi_instalacion_id,
    huevos_ml,
    no_lote,
    fc_granja,
    observacion,
    mortalidad
  } = req.body;

  try {
    const granjaFinal = normalizarGranja(fc_granja);

    // ❌ YA NO OBTENER DE REPRODUCTORES
    // const alev = await pool.query(...)

    // ✅ SIEMPRE DEBE INICIAR EN 0
    const alevines_inicial = 0;

    const mortalidad_porcentaje =
      alevines_inicial > 0 ? (mortalidad / alevines_inicial) * 100 : 0;

    await pool.query(
      `
      INSERT INTO lotes 
      (fecha, familia, fi_instalacion_id, huevos_ml, 
       alevines_inicial, no_lote, fc_granja, observacion,
       mortalidad, mortalidad_porcentaje, fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_DATE)
      `,
      [
        fecha,
        familia,
        fi_instalacion_id,
        huevos_ml,
        alevines_inicial, // ← SIEMPRE CERO
        no_lote,
        granjaFinal,
        observacion,
        mortalidad,
        mortalidad_porcentaje
      ]
    );

    res.json({ message: "✓ Lote registrado correctamente." });

  } catch (err) {
    console.error("❌ Error al registrar lote:", err);
    res.status(500).send("Error al registrar lote");
  }
});

/* --------------------------------------------------------
   📌 PUT - Actualizar lote existente
-------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    fecha,
    familia,
    fi_instalacion_id,
    huevos_ml,
    no_lote,
    fc_granja,
    observacion,
    mortalidad
  } = req.body;

  try {
    const granjaFinal = normalizarGranja(fc_granja);

    // Obtener alevines iniciales del lote
    const alev = await pool.query(
      `
      SELECT alevines_inicial
      FROM lotes
      WHERE fi_lote_id = $1
      `,
      [id]
    );

    const alevines_inicial = alev.rows[0]?.alevines_inicial || 0;
    const mortalidad_porcentaje =
      alevines_inicial > 0 ? (mortalidad / alevines_inicial) * 100 : 0;

    await pool.query(
      `
      UPDATE lotes
      SET 
        fecha = $1,
        familia = $2,
        fi_instalacion_id = $3,
        huevos_ml = $4,
        no_lote = $5,
        fc_granja = $6,
        observacion = $7,
        mortalidad = $8,
        mortalidad_porcentaje = $9
      WHERE fi_lote_id = $10
      `,
      [
        fecha,
        familia,
        fi_instalacion_id,
        huevos_ml,
        no_lote,
        granjaFinal,
        observacion,
        mortalidad,
        mortalidad_porcentaje,
        id
      ]
    );

    res.json({ message: "📝 Lote actualizado correctamente" });

  } catch (err) {
    console.error("❌ Error al actualizar lote:", err);
    res.status(500).send("Error al actualizar lote");
  }
});

/* --------------------------------------------------------
   📌 DELETE - Eliminar lote
-------------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM lotes WHERE fi_lote_id = $1`, [id]);

    res.json({ message: "🗑️ Lote eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar lote:", err);
    res.status(500).send("Error al eliminar lote");
  }
});

/* --------------------------------------------------------
   📌 GET - Obtener lotes por instalación (para biometrías)
-------------------------------------------------------- */
router.get("/instalacion/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        fi_lote_id,
        no_lote
      FROM lotes
      WHERE fi_instalacion_id = $1
      ORDER BY fi_lote_id DESC
      `,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ Error al obtener lotes por instalación:", err);
    res.status(500).send("Error al obtener lotes por instalación");
  }
});

export default router;

import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   📌 Normalizar granja (evita inconsistencias por acentos)
========================================================= */
function normalizarGranja(valor) {
  if (!valor) return "Granja Acuícola Medellin";

  const texto = valor.toLowerCase();

  if (texto.includes("medell")) return "Granja Acuícola Medellin";
  if (texto.includes("ceiba")) return "Granja Acuícola La Ceiba";

  return "Granja Acuícola Medellin";
}

/* =========================================================
   📌 GET - Todas las instalaciones
========================================================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        fc_granja,
        estado,
        largo,
        ancho,
        altura,
        material,
        metros_cubicos
      FROM instalaciones
      ORDER BY nombre_instalacion ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener instalaciones:", err);
    res.status(500).send("Error al obtener instalaciones");
  }
});

/* =========================================================
   📌 GET - Instalaciones por granja
========================================================= */
router.get("/granja/:granja", async (req, res) => {
  const { granja } = req.params;

  try {
    const granjaNormalizada = normalizarGranja(granja);

    const result = await pool.query(
      `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        fc_granja,
        estado,
        largo,
        ancho,
        altura,
        material,
        ROUND(
          COALESCE(largo::numeric, 0) *
          COALESCE(ancho::numeric, 0) *
          COALESCE(altura::numeric, 0),
        2) AS metros_cubicos
      FROM instalaciones
      WHERE fc_granja = $1
      ORDER BY nombre_instalacion ASC;
      `,
      [granjaNormalizada]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener instalaciones:", err);
    res.status(500).send("Error al obtener instalaciones");
  }
});

/* =========================================================
   📌 POST - Registrar nueva instalación
========================================================= */
router.post("/", async (req, res) => {
  const {
    nombre_instalacion,
    tipo_instalacion,
    fc_granja,
    estado,
    largo,
    ancho,
    altura,
    material
  } = req.body;

  try {
    const granjaFinal = normalizarGranja(fc_granja);
    const estadoFinal = estado || "vacia";

    await pool.query(
      `
      INSERT INTO instalaciones
      (nombre_instalacion, tipo_instalacion, fc_granja, estado,
       largo, ancho, altura, material, fecha_registro)
      VALUES ($1,$2,$3,$4,
        NULLIF($5,'')::numeric,
        NULLIF($6,'')::numeric,
        NULLIF($7,'')::numeric,
        $8,
      CURRENT_DATE);
      `,
      [
        nombre_instalacion,
        tipo_instalacion,
        granjaFinal,
        estadoFinal,
        largo,
        ancho,
        altura,
        material
      ]
    );

    res.json({ message: "✅ Instalación registrada correctamente." });
  } catch (err) {
    console.error("❌ Error al registrar instalación:", err);
    res.status(500).send("Error al registrar instalación");
  }
});

/* =========================================================
   📌 PUT - Actualizar instalación
========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    nombre_instalacion,
    tipo_instalacion,
    fc_granja,
    estado,
    largo,
    ancho,
    altura,
    material
  } = req.body;

  try {
    const granjaFinal = normalizarGranja(fc_granja);
    const estadoFinal = estado || "vacia";

    const result = await pool.query(
      `
      UPDATE instalaciones
      SET 
        nombre_instalacion = $1,
        tipo_instalacion = $2,
        fc_granja = $3,
        estado = $4,
        largo  = NULLIF($5,'')::numeric,
        ancho  = NULLIF($6,'')::numeric,
        altura = NULLIF($7,'')::numeric,
        material = $8,
        fd_fecha_modificacion = CURRENT_DATE
      WHERE fi_instalacion_id = $9
      RETURNING *;
      `,
      [
        nombre_instalacion,
        tipo_instalacion,
        granjaFinal,
        estadoFinal,
        largo,
        ancho,
        altura,
        material,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "❌ Instalación no encontrada." });
    }

    res.json({
      success: true,
      message: "✅ Instalación actualizada correctamente.",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Error al actualizar instalación:", err);
    res.status(500).send("Error al actualizar instalación");
  }
});

/* =========================================================
   📌 DELETE - Eliminar instalación
========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM instalaciones WHERE fi_instalacion_id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "❌ Instalación no encontrada." });

    res.json({ message: "🗑️ Instalación eliminada correctamente." });
  } catch (err) {
    console.error("❌ Error al eliminar instalación:", err);
    res.status(500).send("Error al eliminar instalación");
  }
});

/* =========================================================
   📌 GET - Instalaciones por tipo y granja (Engorda, Piletas, etc.)
========================================================= */
router.get("/tipo/:tipo/:granja", async (req, res) => {
  const { tipo, granja } = req.params;

  try {
    const granjaNormalizada = normalizarGranja(granja);

    const result = await pool.query(
      `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        estado
      FROM instalaciones
      WHERE tipo_instalacion ILIKE $1
        AND fc_granja = $2
      ORDER BY nombre_instalacion ASC;
      `,
      [`%${tipo}%`, granjaNormalizada]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener instalaciones por tipo:", err);
    res.status(500).json({ error: "Error al obtener instalaciones por tipo" });
  }
});

export default router;

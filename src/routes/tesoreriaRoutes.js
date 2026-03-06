import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
    TESORERIA GENERAL (usa la vista vw_tesoreria_overview)
   ========================================================= */
router.get("/", async (req, res) => {
  try {
    const { anio, granja, grupo, subgrupo, categoria } = req.query;

    let query = `
      SELECT 
        anio,
        periodo,
        mes_nombre,
        fc_granja,
        grupo,
        subgrupo,
        categoria,
        total_ingreso,
        total_egreso,
        saldo_neto
      FROM vw_tesoreria_overview
      WHERE 1=1
    `;

    const params = [];

    // Filtros dinámicos
    if (anio) {
      params.push(anio);
      query += ` AND anio = $${params.length}`;
    }

    if (granja) {
      params.push(granja);
      query += ` AND UPPER(fc_granja) = UPPER($${params.length})`;
    }

    if (grupo) {
      params.push(grupo);
      query += ` AND UPPER(grupo) = UPPER($${params.length})`;
    }

    if (subgrupo) {
      params.push(subgrupo);
      query += ` AND UPPER(subgrupo) = UPPER($${params.length})`;
    }

    if (categoria) {
      params.push(categoria);
      query += ` AND UPPER(categoria) = UPPER($${params.length})`;
    }

    query += `
      ORDER BY anio, periodo, fc_granja, grupo, subgrupo, categoria;
    `;

    const result = await pool.query(query, params);
    res.json(result.rows); // Devuelve JSON al frontend

  } catch (err) {
    console.error("Error al obtener datos de tesoreria:", err);
    res.status(500).send("Error del servidor al obtener datos de tesoreria");
  }
});

export default router;

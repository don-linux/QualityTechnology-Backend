import { Router } from "express";
import pool from "./../../db.js";

const router = Router();


// =============================
// Obtener todos los estados
// =============================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM catalogos.estados ORDER BY fi_estado_id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    res.status(500).json({ error: "Error al obtener estados" });
  }
});


// =============================
// Obtener estado por ID
// =============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM catalogos.estados WHERE fi_estado_id = $1",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Estado no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener estado:", error);
    res.status(500).json({ error: "Error al obtener estado" });
  }
});


// =============================
// Insertar estado
// =============================
router.post("/", async (req, res) => {
  try {
    const { fc_nombre } = req.body;

    if (!fc_nombre)
      return res.status(400).json({ error: "El nombre es obligatorio" });

    const result = await pool.query(
      `INSERT INTO catalogos.estados (fc_nombre)
       VALUES ($1)
       RETURNING *`,
      [fc_nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar estado:", error);

    if (error.code === "23505")
      return res.status(400).json({ error: "El estado ya existe" });

    res.status(500).json({ error: "Error al insertar estado" });
  }
});


// =============================
// Actualizar estado
// =============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fc_nombre } = req.body;

    const result = await pool.query(
      `UPDATE catalogos.estados
       SET fc_nombre = $1
       WHERE fi_estado_id = $2
       RETURNING *`,
      [fc_nombre, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Estado no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});


// =============================
// Eliminar estado
// =============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM catalogos.estados WHERE fi_estado_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Estado no encontrado" });

    res.json({ message: "Estado eliminado", estado: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar estado:", error);
    res.status(500).json({ error: "Error al eliminar estado" });
  }
});

export default router;
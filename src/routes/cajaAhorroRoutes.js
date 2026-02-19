import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * 🟢 Obtener registros por granja
 */
router.get("/:granja", async (req, res) => {
  try {
    const { granja } = req.params;
    const result = await pool.query(
      "SELECT * FROM caja_ahorro_resumen WHERE granja = $1 ORDER BY id",
      [granja]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener registros:", err);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

/**
 * 🟡 Crear nueva categoría
 */
router.post("/", async (req, res) => {
  const { categoria, granja = "Ceiba" } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO caja_ahorro_resumen (categoria, granja) VALUES ($1, $2) RETURNING *",
      [categoria, granja]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear categoría:", err);
    res.status(500).json({ error: "Error al crear categoría" });
  }
});

/**
 * 🔵 Actualizar valores de una categoría
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const campos = req.body;
  const columnas = Object.keys(campos);
  const valores = Object.values(campos);

  const set = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");
  const sql = `UPDATE caja_ahorro_resumen SET ${set} WHERE id = ${id}`;

  try {
    await pool.query(sql, valores);
    res.json({ message: "Actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar:", err);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

/**
 * 🔴 Eliminar una categoría por ID
 */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM caja_ahorro_resumen WHERE id = $1", [req.params.id]);
    res.json({ message: "Eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar registro:", err);
    res.status(500).json({ error: "Error al eliminar registro" });
  }
});

/**
 * ⚫ Eliminar todas las categorías de una granja
 */
router.delete("/", async (req, res) => {
  const { granja } = req.query;
  try {
    await pool.query("DELETE FROM caja_ahorro_resumen WHERE granja = $1", [granja]);
    res.json({ message: "Eliminados todos los registros" });
  } catch (err) {
    console.error("Error al eliminar todos:", err);
    res.status(500).json({ error: "Error al eliminar todos" });
  }
});

export default router;

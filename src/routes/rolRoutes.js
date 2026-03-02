import express from "express";
import pool from "../db.js";

const router = express.Router();

// POST - Registrar roles
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO roles (fc_nombre) VALUES ($1) RETURNING *",
      [nombre]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al insertar roles:", err);
    res.status(500).send("Error del servidor");
  }
});

// GET - Ver todos los roles
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener roles:", err);
    res.status(500).send("Error del servidor");
  }
});

// PUT - Actualizar roles
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      "UPDATE roles SET fc_nombre = $1 WHERE fi_rol_id = $2 RETURNING *",
      [nombre, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar roles:", err);
    res.status(500).send("Error del servidor");
  }
});

// DELETE - Eliminar roles
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM roles WHERE fi_rol_id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error al eliminar rol:", err);
    res.status(500).send("Error del servidor");
  }
});

export default router;
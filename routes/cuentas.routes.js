// routes/cuentas.routes.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =====================================================
   ✅ Obtener todas las cuentas
===================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cuentas ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener cuentas:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   ➕ Crear una nueva cuenta
===================================================== */
router.post("/", async (req, res) => {
  const { nombre, saldo } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO cuentas (nombre, saldo) VALUES ($1, $2) RETURNING *",
      [nombre, saldo || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear cuenta:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   ✏️ Editar cuenta (nombre o saldo)
===================================================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, saldo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE cuentas SET nombre=$1, saldo=$2 WHERE id=$3 RETURNING *",
      [nombre, saldo, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar cuenta:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   🗑️ Eliminar cuenta
===================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM cuentas WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al eliminar cuenta:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   🔁 Actualizar saldo (ingreso o egreso)
===================================================== */
router.put("/actualizar-saldo/:id", async (req, res) => {
  const { id } = req.params;
  const { tipo, monto } = req.body; // tipo = "ingreso" o "egreso"

  try {
    const query =
      tipo === "ingreso"
        ? "UPDATE cuentas SET saldo = saldo + $1 WHERE id=$2 RETURNING *"
        : "UPDATE cuentas SET saldo = saldo - $1 WHERE id=$2 RETURNING *";

    const result = await pool.query(query, [monto, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar saldo:", err);
    res.status(500).send("Error al actualizar saldo");
  }
});

export default router;

import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =====================================================
   🔹 Obtener todos los clientes
===================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY fi_cliente_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   🔹 Registrar nuevo cliente
===================================================== */
router.post("/", async (req, res) => {
  const { fc_nombre, fc_telefono, fc_correo, fc_localidad, fc_cp, fi_usuario_id } = req.body;

  try {
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO clientes (
        fc_nombre, fc_telefono, fc_correo, fc_localidad,
        fc_cp, fi_usuario_id, fd_fecha_registro, fd_fecha_modificacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [fc_nombre, fc_telefono, fc_correo, fc_localidad, fc_cp, fi_usuario_id, now, now]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al registrar cliente:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   🔹 Actualizar cliente
===================================================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fc_nombre, fc_telefono, fc_correo, fc_localidad, fc_cp, fi_usuario_id } = req.body;

  try {
    const now = new Date();
    const result = await pool.query(
      `UPDATE clientes SET
        fc_nombre=$1, fc_telefono=$2, fc_correo=$3,
        fc_localidad=$4, fc_cp=$5, fi_usuario_id=$6,
        fd_fecha_modificacion=$7
      WHERE fi_cliente_id=$8
      RETURNING *`,
      [fc_nombre, fc_telefono, fc_correo, fc_localidad, fc_cp, fi_usuario_id, now, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar cliente:", err);
    res.status(500).send("Error del servidor");
  }
});

/* =====================================================
   🔹 Eliminar cliente
===================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM clientes WHERE fi_cliente_id=$1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    res.status(500).send("Error del servidor");
  }
});

export default router;

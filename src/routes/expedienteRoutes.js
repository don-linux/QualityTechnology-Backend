import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
    OBTENER TODOS LOS EXPEDIENTES O BUSCAR POR NOMBRE
   ========================================================= */
router.get("/", async (req, res) => {
  try {
    const { nombre } = req.query;

    let result;
    if (nombre) {
      result = await pool.query(
        `SELECT * FROM expedientes 
         WHERE LOWER(fc_nombre) LIKE LOWER($1)
         ORDER BY fc_nombre ASC`,
        [`%${nombre}%`]
      );
    } else {
      result = await pool.query(`SELECT * FROM expedientes ORDER BY fc_nombre ASC`);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener expedientes:", err);
    res.status(500).send("Error al obtener expedientes");
  }
});

/* =========================================================
    CREAR NUEVO EXPEDIENTE
   ========================================================= */
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

    const query = `
      INSERT INTO expedientes (${keys.join(",")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear expediente:", err);
    res.status(500).send("Error al crear expediente");
  }
});

/* =========================================================
    ACTUALIZAR EXPEDIENTE
   ========================================================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Clonamos y eliminamos campos que no deben actualizarse manualmente
    const data = { ...req.body };
    delete data.fd_fecha_actualizacion; // Evita colisión con NOW()

    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0)
      return res.status(400).send("No se enviaron campos para actualizar.");

    // Construimos el SET dinámico
    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const query = `
      UPDATE expedientes
      SET ${sets}, fd_fecha_actualizacion=NOW()
      WHERE fi_expediente_id=$${keys.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar expediente:", err);
    res.status(500).send("Error al actualizar expediente");
  }
});

/* =========================================================
    ELIMINAR UN EXPEDIENTE
   ========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM expedientes WHERE fi_expediente_id=$1", [id]);
    res.send("Expediente eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar expediente:", err);
    res.status(500).send("Error al eliminar expediente");
  }
});

/* =========================================================
    ELIMINAR TODOS LOS EXPEDIENTES
   ========================================================= */
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM expedientes");
    res.send("Todos los expedientes eliminados correctamente");
  } catch (err) {
    console.error("Error al eliminar todos:", err);
    res.status(500).send("Error al eliminar todos los expedientes");
  }
});

export default router;

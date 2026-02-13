import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   🟢 Obtener todos los registros
   ========================================================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vacaciones ORDER BY fc_nombre_empleado ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener vacaciones:", err);
    res.status(500).send("Error al obtener vacaciones");
  }
});

/* =========================================================
   🟢 Crear nuevo registro manual
   ========================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      fc_nombre_empleado,
      fi_empleado_id,
      fc_departamento,
      fd_inicio_periodo,
      fd_fin_periodo,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vacaciones (
        fc_nombre_empleado, fi_empleado_id, fc_departamento,
        fd_inicio_periodo, fd_fin_periodo, fd_fecha_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        fc_nombre_empleado,
        fi_empleado_id,
        fc_departamento,
        fd_inicio_periodo,
        fd_fin_periodo,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear registro:", err);
    res.status(500).send("Error al crear registro");
  }
});

/* =========================================================
   🟡 Actualizar registro
   ========================================================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    delete data.fd_fecha_actualizacion;

    const keys = Object.keys(data);
    const values = Object.values(data);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    const result = await pool.query(
      `UPDATE vacaciones
       SET ${sets}, fd_fecha_actualizacion=NOW()
       WHERE fi_vacacion_id=$${keys.length + 1}
       RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar vacaciones:", err);
    res.status(500).send("Error al actualizar registro");
  }
});

/* =========================================================
   🔴 Eliminar registro individual
   ========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM vacaciones WHERE fi_vacacion_id=$1", [
      req.params.id,
    ]);
    res.send("✅ Registro eliminado correctamente");
  } catch (err) {
    console.error("❌ Error al eliminar registro:", err);
    res.status(500).send("Error al eliminar registro");
  }
});

/* =========================================================
   ⚠️ Eliminar TODOS los registros
   ========================================================= */
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM vacaciones");
    res.send("⚠️ Todos los registros de vacaciones fueron eliminados.");
  } catch (err) {
    console.error("❌ Error al eliminar todos los registros:", err);
    res.status(500).send("Error al eliminar todos los registros");
  }
});

export default router;

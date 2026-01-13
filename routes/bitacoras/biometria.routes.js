import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Obtener todos los registros
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ceiba_biometrias ORDER BY fi_id DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

// Crear registro
router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fn_peso_promedio,
      fc_observaciones,
      fc_encargado,
      fi_usuario_id
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO ceiba_biometrias 
      (fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
       fc_observaciones, fc_encargado, fi_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING fi_id
      `,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fn_peso_promedio,
        fc_observaciones,
        fc_encargado,
        fi_usuario_id
      ]
    );

    res.json({ message: "Registro creado", id: result.rows[0].fi_id });
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ error: "Error creando registro" });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fn_peso_promedio,
      fc_observaciones,
      fc_encargado,
      fi_usuario_id
    } = req.body;

    await pool.query(
      `
      UPDATE ceiba_biometrias SET
      fd_fecha=$1, fn_peso_total_gramos=$2, fn_organismos_muestreados=$3,
      fn_peso_promedio=$4, fc_observaciones=$5, fc_encargado=$6, fi_usuario_id=$7
      WHERE fi_id=$8
      `,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fn_peso_promedio,
        fc_observaciones,
        fc_encargado,
        fi_usuario_id,
        id
      ]
    );

    res.json({ message: "Registro actualizado" });

  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(500).json({ error: "Error actualizando registro" });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM ceiba_biometrias WHERE fi_id=$1`, [req.params.id]);
    res.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Error eliminando registro" });
  }
});

// 🗑️ Eliminar todos los registros
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM ceiba_biometrias");
    res.json({ message: "Todos los registros fueron eliminados." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

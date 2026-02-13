import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medellin_banos ORDER BY fi_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar nuevo
router.post("/", async (req, res) => {
  try {
    const {
      fc_mes,
      fc_dia,
      fc_banio_hombres,
      fc_banio_mujeres,
      fc_regadera,
      fc_realizo,
      fc_firma,
      fc_observaciones,
      fi_usuario_id,
    } = req.body;

    await pool.query(
      `INSERT INTO medellin_banos
      (fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [
        fc_mes,
        fc_dia,
        fc_banio_hombres,
        fc_banio_mujeres,
        fc_regadera,
        fc_realizo,
        fc_firma,
        fc_observaciones,
        fi_usuario_id,
      ]
    );

    res.json({ message: "Registro agregado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const {
      fc_mes,
      fc_dia,
      fc_banio_hombres,
      fc_banio_mujeres,
      fc_regadera,
      fc_realizo,
      fc_firma,
      fc_observaciones,
    } = req.body;

    await pool.query(
      `UPDATE medellin_banos SET
      fc_mes=$1, fc_dia=$2, fc_banio_hombres=$3, fc_banio_mujeres=$4,
      fc_regadera=$5, fc_realizo=$6, fc_firma=$7, fc_observaciones=$8,
      fd_fecha_modificacion=NOW()
      WHERE fi_id=$9`,
      [
        fc_mes,
        fc_dia,
        fc_banio_hombres,
        fc_banio_mujeres,
        fc_regadera,
        fc_realizo,
        fc_firma,
        fc_observaciones,
        req.params.id,
      ]
    );

    res.json({ message: "Registro actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_banos WHERE fi_id=$1", [
      req.params.id,
    ]);
    res.json({ message: "Registro eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================
// ⚠️ Eliminar todos los registros
// ======================================
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_banos");
    res.json({ message: "Todos los registros eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

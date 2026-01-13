import express from "express";
import pool from "../../db.js";

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medellin_recambios ORDER BY fi_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error GET /medellin/recambios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      fc_mes,
      fn_num_instalacion,
      fd_fecha1,
      fc_tipo1,
      fd_fecha2,
      fc_tipo2,
      fd_fecha3,
      fc_tipo3,
      fd_fecha4,
      fc_tipo4,
      fd_fecha5,
      fc_tipo5,
      fd_fecha6,
      fc_tipo6,
      fc_responsable,
      fi_usuario_id,
    } = req.body;

    await pool.query(
      `INSERT INTO medellin_recambios
      (fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2,
       fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5,
       fd_fecha6, fc_tipo6, fc_responsable, fi_usuario_id, fd_fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())`,
      [
        fc_mes,
        fn_num_instalacion,
        fd_fecha1,
        fc_tipo1,
        fd_fecha2,
        fc_tipo2,
        fd_fecha3,
        fc_tipo3,
        fd_fecha4,
        fc_tipo4,
        fd_fecha5,
        fc_tipo5,
        fd_fecha6,
        fc_tipo6,
        fc_responsable,
        fi_usuario_id || 1,
      ]
    );

    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error POST /medellin/recambios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      fc_mes,
      fn_num_instalacion,
      fd_fecha1,
      fc_tipo1,
      fd_fecha2,
      fc_tipo2,
      fd_fecha3,
      fc_tipo3,
      fd_fecha4,
      fc_tipo4,
      fd_fecha5,
      fc_tipo5,
      fd_fecha6,
      fc_tipo6,
      fc_responsable,
    } = req.body;

    await pool.query(
      `UPDATE medellin_recambios SET
        fc_mes=$1, fn_num_instalacion=$2,
        fd_fecha1=$3, fc_tipo1=$4, fd_fecha2=$5, fc_tipo2=$6,
        fd_fecha3=$7, fc_tipo3=$8, fd_fecha4=$9, fc_tipo4=$10,
        fd_fecha5=$11, fc_tipo5=$12, fd_fecha6=$13, fc_tipo6=$14,
        fc_responsable=$15, fd_fecha_modificacion=NOW()
      WHERE fi_id=$16`,
      [
        fc_mes,
        fn_num_instalacion,
        fd_fecha1,
        fc_tipo1,
        fd_fecha2,
        fc_tipo2,
        fd_fecha3,
        fc_tipo3,
        fd_fecha4,
        fc_tipo4,
        fd_fecha5,
        fc_tipo5,
        fd_fecha6,
        fc_tipo6,
        fc_responsable,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error PUT /medellin/recambios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_recambios WHERE fi_id=$1", [
      req.params.id,
    ]);
    res.json({ message: "🗑️ Registro eliminado correctamente" });
  } catch (err) {
    console.error("Error DELETE /medellin/recambios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Eliminar todos los registros de Recambios (Medellín)
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_recambios");
    res.json({ message: "Todos los registros de recambios fueron eliminados correctamente." });
  } catch (error) {
    console.error("Error al eliminar registros de recambios:", error);
    res.status(500).json({ error: "Error eliminando todos los registros de recambios." });
  }
});


export default router;

import express from "express";
import pool from "../../db.js";

const router = express.Router();
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM medellin_medicamentos ORDER BY fi_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /medellin/medicamentos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha_hora,
      fn_num_estanque,
      fc_diagnosis,
      fc_tratamiento,
      fc_dosis,
      fc_forma_aplicacion,
      fd_fecha_ultima_dosis,
      fc_responsable,
      fi_usuario_id,
    } = req.body;

    // 🔒 Validaciones previas obligatorias
    if (!fd_fecha_hora) throw new Error("La fecha es obligatoria (fd_fecha_hora)");
    if (!fn_num_estanque) throw new Error("El número de estanque es obligatorio");

    const numEstanque = parseNum(fn_num_estanque);
    const userId = parseNum(fi_usuario_id);

    if (isNaN(numEstanque)) throw new Error("fn_num_estanque debe ser numérico");
    if (isNaN(userId)) throw new Error("fi_usuario_id debe ser numérico");

    await pool.query(
      `INSERT INTO medellin_medicamentos
      (fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
       fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis,
       fc_responsable, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [
        fd_fecha_hora,
        numEstanque,
        fc_diagnosis || null,
        fc_tratamiento || null,
        fc_dosis || null,
        fc_forma_aplicacion || null,
        fd_fecha_ultima_dosis || null,
        fc_responsable || null,
        userId,
      ]
    );

    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error en POST /medellin/medicamentos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      fd_fecha_hora,
      fn_num_estanque,
      fc_diagnosis,
      fc_tratamiento,
      fc_dosis,
      fc_forma_aplicacion,
      fd_fecha_ultima_dosis,
      fc_responsable,
    } = req.body;

    await pool.query(
      `UPDATE medellin_medicamentos SET
      fd_fecha_hora=$1, fn_num_estanque=$2, fc_diagnosis=$3, fc_tratamiento=$4,
      fc_dosis=$5, fc_forma_aplicacion=$6, fd_fecha_ultima_dosis=$7,
      fc_responsable=$8, fd_fecha_modificacion=NOW()
      WHERE fi_id=$9`,
      [
        fd_fecha_hora || null,
        parseNum(fn_num_estanque),
        fc_diagnosis || null,
        fc_tratamiento || null,
        fc_dosis || null,
        fc_forma_aplicacion || null,
        fd_fecha_ultima_dosis || null,
        fc_responsable || null,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error en PUT /medellin/medicamentos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_medicamentos WHERE fi_id=$1", [
      req.params.id,
    ]);
    res.json({ message: "🗑️ Registro eliminado" });
  } catch (err) {
    console.error("Error en DELETE /medellin/medicamentos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar todos
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_medicamentos");
    res.json({ message: "Todos los registros eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

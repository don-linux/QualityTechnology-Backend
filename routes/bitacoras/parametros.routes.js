import express from "express";
import pool from "../../db.js";

const router = express.Router();
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM medellin_parametros ORDER BY fi_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /medellin/parametros:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha,
      fn_num_estanque,
      fn_oxigeno,
      fn_temperatura,
      fn_ph,
      fn_amonio,
      fn_nitritos,
      fn_nitratos,
      fc_responsable,
      fi_usuario_id,
    } = req.body;

    // 🔒 Validación de obligatorios
    if (!fd_fecha) throw new Error("La fecha (fd_fecha) es obligatoria");
    if (!fn_num_estanque) throw new Error("El número de estanque es obligatorio");

    const numEstanque = parseNum(fn_num_estanque);
    const userId = parseNum(fi_usuario_id);

    if (isNaN(numEstanque)) throw new Error("fn_num_estanque debe ser numérico");
    if (isNaN(userId)) throw new Error("fi_usuario_id debe ser numérico");

    await pool.query(
      `INSERT INTO medellin_parametros
      (fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
       fn_amonio, fn_nitritos, fn_nitratos, fc_responsable,
       fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
      [
        fd_fecha,
        numEstanque,
        parseNum(fn_oxigeno),
        parseNum(fn_temperatura),
        parseNum(fn_ph),
        parseNum(fn_amonio),
        parseNum(fn_nitritos),
        parseNum(fn_nitratos),
        fc_responsable || null,
        userId,
      ]
    );

    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error en POST /medellin/parametros:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      fd_fecha,
      fn_num_estanque,
      fn_oxigeno,
      fn_temperatura,
      fn_ph,
      fn_amonio,
      fn_nitritos,
      fn_nitratos,
      fc_responsable,
    } = req.body;

    await pool.query(
      `UPDATE medellin_parametros SET
      fd_fecha=$1, fn_num_estanque=$2, fn_oxigeno=$3, fn_temperatura=$4,
      fn_ph=$5, fn_amonio=$6, fn_nitritos=$7, fn_nitratos=$8,
      fc_responsable=$9, fd_fecha_modificacion=NOW()
      WHERE fi_id=$10`,
      [
        fd_fecha,
        parseNum(fn_num_estanque),
        parseNum(fn_oxigeno),
        parseNum(fn_temperatura),
        parseNum(fn_ph),
        parseNum(fn_amonio),
        parseNum(fn_nitritos),
        parseNum(fn_nitratos),
        fc_responsable || null,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error en PUT /medellin/parametros:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_parametros WHERE fi_id=$1", [
      req.params.id,
    ]);
    res.json({ message: "🗑️ Registro eliminado" });
  } catch (err) {
    console.error("Error en DELETE /medellin/parametros:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar todos
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_parametros");
    res.json({ message: "Todos los registros eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

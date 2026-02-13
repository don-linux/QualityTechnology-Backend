import express from "express";
import pool from "../../db.js";

const router = express.Router();
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

// ✅ Obtener todos los registros
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medellin_inventario_alevines ORDER BY fi_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /medellin/inventario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear registro
router.post("/", async (req, res) => {
  try {
    const {
      fn_num_instalacion,
      fn_cantidad,
      fn_talla,
      fc_lote,
      fc_observacion,
      fd_fecha_siembra,
      fd_fecha_salida_hormonado,
      fi_usuario_id,
    } = req.body;

    await pool.query(
      `INSERT INTO medellin_inventario_alevines
      (fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
       fd_fecha_siembra, fd_fecha_salida_hormonado, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [
        parseNum(fn_num_instalacion),
        parseNum(fn_cantidad),
        parseNum(fn_talla),
        fc_lote || null,
        fc_observacion || null,
        fd_fecha_siembra || null,
        fd_fecha_salida_hormonado || null,
        parseNum(fi_usuario_id),
      ]
    );

    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error en POST /medellin/inventario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar registro
router.put("/:id", async (req, res) => {
  try {
    const {
      fn_num_instalacion,
      fn_cantidad,
      fn_talla,
      fc_lote,
      fc_observacion,
      fd_fecha_siembra,
      fd_fecha_salida_hormonado,
    } = req.body;

    await pool.query(
      `UPDATE medellin_inventario_alevines SET
        fn_num_instalacion=$1, fn_cantidad=$2, fn_talla=$3,
        fc_lote=$4, fc_observacion=$5,
        fd_fecha_siembra=$6, fd_fecha_salida_hormonado=$7,
        fd_fecha_modificacion=NOW()
       WHERE fi_id=$8`,
      [
        parseNum(fn_num_instalacion),
        parseNum(fn_cantidad),
        parseNum(fn_talla),
        fc_lote || null,
        fc_observacion || null,
        fd_fecha_siembra || null,
        fd_fecha_salida_hormonado || null,
        req.params.id,
      ]
    );

    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error en PUT /medellin/inventario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar registro
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM medellin_inventario_alevines WHERE fi_id=$1",
      [req.params.id]
    );
    res.json({ message: "🗑️ Registro eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /medellin/inventario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

  // 🗑️ Eliminar todos los registros de Inventario de Alevines (Medellín)
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM medellin_inventario_alevines");
    res.json({ message: "Todos los registros de inventario fueron eliminados correctamente." });
  } catch (error) {
    console.error("Error al eliminar registros de inventario:", error);
    res.status(500).json({ error: "Error eliminando todos los registros de inventario." });
  }
});

export default router;

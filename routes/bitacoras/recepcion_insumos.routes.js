import express from "express";
import pool from "../../db.js";

const router = express.Router();

// ✅ Obtener registros filtrados por ubicación
router.get("/", async (req, res) => {
  const { ubicacion } = req.query; // Filtrar por ubicación (Medellín, Ceiba, Quality)
  try {
    let query = "SELECT * FROM recepcion_insumos";
    const params = [];

    if (ubicacion) {
      query += " WHERE ubicacion = $1";
      params.push(ubicacion);
    }

    query += " ORDER BY fi_id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error GET /recepcion_insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear nuevo registro
router.post("/", async (req, res) => {
  const {
    fd_fecha,
    fc_proveedor,
    fc_producto,
    fc_lote,
    fn_cantidad,
    fc_unidad_medida,
    fc_condiciones_entrega,
    fc_verifico,
    fc_observaciones,
    fi_usuario_id,
    ubicacion,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO recepcion_insumos
      (fd_fecha, fc_proveedor, fc_producto, fc_lote, fn_cantidad, fc_unidad_medida, fc_condiciones_entrega, fc_verifico, fc_observaciones, fi_usuario_id, ubicacion, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
      [
        fd_fecha,
        fc_proveedor,
        fc_producto,
        fc_lote,
        fn_cantidad,
        fc_unidad_medida,
        fc_condiciones_entrega,
        fc_verifico,
        fc_observaciones,
        fi_usuario_id || 1,
        ubicacion || "medellin",
      ]
    );
    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error POST /recepcion_insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar registro
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fd_fecha,
    fc_proveedor,
    fc_producto,
    fc_lote,
    fn_cantidad,
    fc_unidad_medida,
    fc_condiciones_entrega,
    fc_verifico,
    fc_observaciones,
    ubicacion,
  } = req.body;

  try {
    await pool.query(
      `UPDATE recepcion_insumos SET
        fd_fecha=$1, fc_proveedor=$2, fc_producto=$3, fc_lote=$4,
        fn_cantidad=$5, fc_unidad_medida=$6, fc_condiciones_entrega=$7,
        fc_verifico=$8, fc_observaciones=$9, ubicacion=$10,
        fd_fecha_modificacion=NOW()
       WHERE fi_id=$11`,
      [
        fd_fecha,
        fc_proveedor,
        fc_producto,
        fc_lote,
        fn_cantidad,
        fc_unidad_medida,
        fc_condiciones_entrega,
        fc_verifico,
        fc_observaciones,
        ubicacion || "medellin",
        id,
      ]
    );
    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error PUT /recepcion_insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar uno
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM recepcion_insumos WHERE fi_id=$1", [id]);
    res.json({ message: "🗑️ Registro eliminado correctamente" });
  } catch (err) {
    console.error("Error DELETE /recepcion_insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Eliminar todos los registros por ubicación
router.delete("/", async (req, res) => {
  const { ubicacion } = req.query;
  try {
    if (ubicacion) {
      await pool.query("DELETE FROM recepcion_insumos WHERE ubicacion=$1", [ubicacion]);
      res.json({ message: `✅ Registros de ${ubicacion} eliminados.` });
    } else {
      await pool.query("DELETE FROM recepcion_insumos");
      res.json({ message: "✅ Todos los registros eliminados." });
    }
  } catch (err) {
    console.error("Error DELETE /recepcion_insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

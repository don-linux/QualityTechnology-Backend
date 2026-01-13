import express from "express";
import pool from "../../db.js";

const router = express.Router();

// ✅ Obtener registros (filtrados por ubicación si se pasa ?ubicacion=)
router.get("/", async (req, res) => {
  const { ubicacion } = req.query;
  try {
    let query = "SELECT * FROM plagas";
    const params = [];

    if (ubicacion) {
      query += " WHERE ubicacion = $1";
      params.push(ubicacion);
    }

    query += " ORDER BY fi_id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error GET /plagas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear nuevo registro
router.post("/", async (req, res) => {
  const {
    fd_fecha,
    fn_num_trampa,
    tipo_trampa,
    fc_hallazgo,
    fc_malla,
    fc_veneno,
    fc_observaciones,
    fc_verifico,
    unidad_produccion,
    fi_usuario_id,
    ubicacion,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO plagas 
        (fd_fecha, fn_num_trampa, tipo_trampa, fc_hallazgo, fc_malla, fc_veneno, 
         fc_observaciones, fc_verifico, unidad_produccion, ubicacion, fi_usuario_id, fd_fecha_registro)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
      [
        fd_fecha,
        fn_num_trampa,
        tipo_trampa,
        fc_hallazgo,
        fc_malla,
        fc_veneno,
        fc_observaciones,
        fc_verifico,
        unidad_produccion,
        ubicacion || "medellin",
        fi_usuario_id || 1,
      ]
    );

    res.json({ message: "✅ Registro agregado correctamente" });
  } catch (err) {
    console.error("Error POST /plagas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar registro
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fd_fecha,
    fn_num_trampa,
    tipo_trampa,
    fc_hallazgo,
    fc_malla,
    fc_veneno,
    fc_observaciones,
    fc_verifico,
    unidad_produccion,
    ubicacion,
  } = req.body;

  try {
    await pool.query(
      `UPDATE plagas SET
        fd_fecha=$1, fn_num_trampa=$2, tipo_trampa=$3, fc_hallazgo=$4,
        fc_malla=$5, fc_veneno=$6, fc_observaciones=$7, fc_verifico=$8,
        unidad_produccion=$9, ubicacion=$10, fd_fecha_modificacion=NOW()
       WHERE fi_id=$11`,
      [
        fd_fecha,
        fn_num_trampa,
        tipo_trampa,
        fc_hallazgo,
        fc_malla,
        fc_veneno,
        fc_observaciones,
        fc_verifico,
        unidad_produccion,
        ubicacion || "medellin",
        id,
      ]
    );
    res.json({ message: "✅ Registro actualizado correctamente" });
  } catch (err) {
    console.error("Error PUT /plagas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar registro individual
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM plagas WHERE fi_id=$1", [id]);
    res.json({ message: "🗑️ Registro eliminado correctamente" });
  } catch (err) {
    console.error("Error DELETE /plagas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Eliminar todos los registros (por ubicación o todos)
router.delete("/", async (req, res) => {
  const { ubicacion } = req.query;
  try {
    if (ubicacion) {
      await pool.query("DELETE FROM plagas WHERE ubicacion=$1", [ubicacion]);
      res.json({ message: `✅ Todos los registros de ${ubicacion} eliminados.` });
    } else {
      await pool.query("DELETE FROM plagas");
      res.json({ message: "✅ Todos los registros eliminados (todas las ubicaciones)." });
    }
  } catch (err) {
    console.error("Error DELETE /plagas:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

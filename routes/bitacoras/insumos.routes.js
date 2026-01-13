import express from "express";
import pool from "../../db.js";

const router = express.Router();

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM ceiba_insumos
      ORDER BY fi_id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: "Error obteniendo insumos" });
  }
});

// Crear
router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha,
      fc_cantidad_udm,
      fc_num_lote,
      fc_descripcion,
      fc_observaciones,
      fc_encargado_entrega,
      fc_encargado_recepcion,
      fi_usuario_id,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO ceiba_insumos 
      (fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, 
       fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, 
       fd_fecha_registro, fi_usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), $8)
      RETURNING fi_id
      `,
      [
        fd_fecha,
        fc_cantidad_udm,
        fc_num_lote,
        fc_descripcion,
        fc_observaciones,
        fc_encargado_entrega,
        fc_encargado_recepcion,
        fi_usuario_id,
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
      fc_cantidad_udm,
      fc_num_lote,
      fc_descripcion,
      fc_observaciones,
      fc_encargado_entrega,
      fc_encargado_recepcion,
      fi_usuario_id,
    } = req.body;

    await pool.query(
      `
      UPDATE ceiba_insumos SET
        fd_fecha=$1,
        fc_cantidad_udm=$2,
        fc_num_lote=$3,
        fc_descripcion=$4,
        fc_observaciones=$5,
        fc_encargado_entrega=$6,
        fc_encargado_recepcion=$7,
        fd_fecha_modificacion=NOW(),
        fi_usuario_id=$8
      WHERE fi_id=$9
      `,
      [
        fd_fecha,
        fc_cantidad_udm,
        fc_num_lote,
        fc_descripcion,
        fc_observaciones,
        fc_encargado_entrega,
        fc_encargado_recepcion,
        fi_usuario_id,
        id,
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
    const { id } = req.params;

    await pool.query(`DELETE FROM ceiba_insumos WHERE fi_id=$1`, [id]);

    res.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Error eliminando registro" });
  }
});

// 🗑️ Eliminar todos los registros de Insumos
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM ceiba_insumos");
    res.json({ message: "Todos los registros de insumos fueron eliminados." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;

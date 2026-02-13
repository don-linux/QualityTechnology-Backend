import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todos los alevines
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alevines ORDER BY fi_alevines_id DESC");

    // Convertir las fechas a ISO string para que el frontend las maneje bien
    const rows = result.rows.map(row => ({
      ...row,
      fd_fecha_registro: row.fd_fecha_registro ? row.fd_fecha_registro.toISOString() : null,
      fd_fecha_modificacion: row.fd_fecha_modificacion ? row.fd_fecha_modificacion.toISOString() : null,
      // Si tienes otras fechas, conviértelas aquí también
    }));

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener alevines:", error);
    res.status(500).json({ error: "Error al obtener alevines" });
  }
});

// Insertar un nuevo alevín
router.post("/", async (req, res) => {
  try {
    let {
      fc_numero_lote,
      fn_peso_promedio,
      fn_cantidad,
      fc_observacion,
      fi_usuario_id,
      fi_colecta_id,
      fd_fecha_registro,
      fd_fecha_modificacion,
    } = req.body;

    const fechaActual = new Date();

    // Asignar fecha actual si no viene en la petición
    if (!fd_fecha_registro) fd_fecha_registro = fechaActual;
    if (!fd_fecha_modificacion) fd_fecha_modificacion = fechaActual;

    const result = await pool.query(
      `INSERT INTO alevines (
        fc_numero_lote,
        fn_peso_promedio,
        fn_cantidad,
        fc_observacion,
        fi_usuario_id,
        fi_colecta_id,
        fd_fecha_registro,
        fd_fecha_modificacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        fc_numero_lote,
        fn_peso_promedio,
        fn_cantidad,
        fc_observacion,
        fi_usuario_id,
        fi_colecta_id,
        fd_fecha_registro,
        fd_fecha_modificacion,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar alevines:", error);
    res.status(500).json({ error: "Error al insertar alevines" });
  }
});

// Actualizar un alevín por ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fc_numero_lote,
      fn_peso_promedio,
      fn_cantidad,
      fc_observacion,
      fi_usuario_id,
      fi_colecta_id,
      
    } = req.body;

    const fechaActual = new Date();

    
    const fd_fecha_modificacion = fechaActual;

    const result = await pool.query(
      `UPDATE alevines SET
        fc_numero_lote = $1,
        fn_peso_promedio = $2,
        fn_cantidad = $3,
        fc_observacion = $4,
        fi_usuario_id = $5,
        fi_colecta_id = $6,
        fd_fecha_modificacion = $7
      WHERE fi_alevines_id = $8 RETURNING *`,
      [
        fc_numero_lote,
        fn_peso_promedio,
        fn_cantidad,
        fc_observacion,
        fi_usuario_id,
        fi_colecta_id,
        fd_fecha_modificacion,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Alevín no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar alevines:", error);
    res.status(500).json({ error: "Error al actualizar alevines" });
  }
});

// Eliminar un alevín por ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM alevines WHERE fi_alevines_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Alevín no encontrado" });
    }

    res.json({ message: "Alevín eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar alevines:", error);
    res.status(500).json({ error: "Error al eliminar alevines" });
  }
});

export default router;

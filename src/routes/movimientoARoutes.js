import express from "express";
import pool from "../db.js";

const router = express.Router();

// Crear un nuevo movimiento de alevines
router.post("/", async (req, res) => {
  const {
    fi_usuario_id,
    fi_alevines_id,
    fi_pileta_id,
    fi_tipo,
    fi_cantidad_alevines,
    fn_peso_promedio,
  } = req.body;

  try {
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO movimiento_alevines (
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        fd_fecha_registro,
        fd_fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        now,
        now,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar movimiento:", error);
    res.status(500).json({ error: "Error al insertar movimiento" });
  }
});

// Obtener todos los movimientos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM movimiento_alevines ORDER BY fi_movimiento_alevines_id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener movimientos:", error);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

// Actualizar un movimiento
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fi_usuario_id,
    fi_alevines_id,
    fi_pileta_id,
    fi_tipo,
    fi_cantidad_alevines,
    fn_peso_promedio,
  } = req.body;

  try {
    const now = new Date();

    const result = await pool.query(
      `UPDATE movimiento_alevines SET
        fi_usuario_id = $1,
        fi_alevines_id = $2,
        fi_pileta_id = $3,
        fi_tipo = $4,
        fi_cantidad_alevines = $5,
        fn_peso_promedio = $6,
        fd_fecha_modificacion = $7
      WHERE fi_movimiento_alevines_id = $8
      RETURNING *`,
      [
        fi_usuario_id,
        fi_alevines_id,
        fi_pileta_id,
        fi_tipo,
        fi_cantidad_alevines,
        fn_peso_promedio,
        now,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al actualizar movimiento:", error);
    res.status(500).json({ error: "Error al actualizar movimiento" });
  }
});

// Eliminar un movimiento
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM movimiento_alevines WHERE fi_movimiento_alevines_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("❌ Error al eliminar movimiento:", error);
    res.status(500).json({ error: "Error al eliminar movimiento" });
  }
});

export default router;

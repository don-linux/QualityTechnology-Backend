import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todos los empleados con datos JOIN para mostrar nombres de FK
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
        p.fc_nombre AS puesto_nombre,
        d.fc_nombre AS departamento_nombre,
        c.fc_nombre AS ciudad_nombre,
        es.fc_nombre AS estado_nombre
      FROM empleados e
      LEFT JOIN puestos p ON e.fi_puesto_id = p.fi_puesto_id
      LEFT JOIN departamentos d ON e.fi_departamento_id = d.fi_departamento_id
      LEFT JOIN ciudades c ON e.fi_ciudad_id = c.fi_ciudad_id
      LEFT JOIN estados es ON e.fi_estado_id = es.fi_estado_id
      ORDER BY e.fi_empleado_id DESC
    `);

    
    const rows = result.rows.map(row => ({
      ...row,
      fd_fecha_nacimiento: row.fd_fecha_nacimiento ? row.fd_fecha_nacimiento.toISOString() : null,
      fd_fecha_contratacion: row.fd_fecha_contratacion ? row.fd_fecha_contratacion.toISOString() : null,
    }));

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// Insertar empleado
router.post("/", async (req, res) => {
  try {
    const {
      fc_nombre,
      fc_apellido_paterno,
      fc_apellido_materno,
      fc_genero,
      fc_calle,
      fc_cp,
      fc_referencia,
      fc_comentarios,
      fi_usuario_id,
      fi_puesto_id,
      fi_departamento_id,
      fi_ciudad_id,
      fi_estado_id,
      fi_edad,
      fd_fecha_nacimiento,
      fd_fecha_contratacion,
    } = req.body;

    const fechaActual = new Date();

    const result = await pool.query(
      `INSERT INTO empleados (
        fc_nombre,
        fc_apellido_paterno,
        fc_apellido_materno,
        fc_genero,
        fc_calle,
        fc_cp,
        fc_referencia,
        fc_comentarios,
        fi_usuario_id,
        fi_puesto_id,
        fi_departamento_id,
        fi_ciudad_id,
        fi_estado_id,
        fi_edad,
        fd_fecha_nacimiento,
        fd_fecha_contratacion,
        fd_fecha_registro,
        fd_fecha_modificacion
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [
        fc_nombre,
        fc_apellido_paterno,
        fc_apellido_materno,
        fc_genero,
        fc_calle,
        fc_cp,
        fc_referencia,
        fc_comentarios,
        fi_usuario_id,
        fi_puesto_id,
        fi_departamento_id,
        fi_ciudad_id,
        fi_estado_id,
        fi_edad,
        fd_fecha_nacimiento,
        fd_fecha_contratacion,
        fechaActual,
        fechaActual,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar empleado:", error);
    res.status(500).json({ error: "Error al insertar empleado" });
  }
});

// Actualizar empleado
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fc_nombre,
      fc_apellido_paterno,
      fc_apellido_materno,
      fc_genero,
      fc_calle,
      fc_cp,
      fc_referencia,
      fc_comentarios,
      fi_usuario_id,
      fi_puesto_id,
      fi_departamento_id,
      fi_ciudad_id,
      fi_estado_id,
      fi_edad,
      fd_fecha_nacimiento,
      fd_fecha_contratacion,
    } = req.body;

    const fechaActual = new Date();

    const result = await pool.query(
      `UPDATE empleados SET
        fc_nombre = $1,
        fc_apellido_paterno = $2,
        fc_apellido_materno = $3,
        fc_genero = $4,
        fc_calle = $5,
        fc_cp = $6,
        fc_referencia = $7,
        fc_comentarios = $8,
        fi_usuario_id = $9,
        fi_puesto_id = $10,
        fi_departamento_id = $11,
        fi_ciudad_id = $12,
        fi_estado_id = $13,
        fi_edad = $14,
        fd_fecha_nacimiento = $15,
        fd_fecha_contratacion = $16,
        fd_fecha_modificacion = $17
      WHERE fi_empleado_id = $18
      RETURNING *`,
      [
        fc_nombre,
        fc_apellido_paterno,
        fc_apellido_materno,
        fc_genero,
        fc_calle,
        fc_cp,
        fc_referencia,
        fc_comentarios,
        fi_usuario_id,
        fi_puesto_id,
        fi_departamento_id,
        fi_ciudad_id,
        fi_estado_id,
        fi_edad,
        fd_fecha_nacimiento,
        fd_fecha_contratacion,
        fechaActual,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
});

// Eliminar empleado
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM empleados WHERE fi_empleado_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
});

export default router;

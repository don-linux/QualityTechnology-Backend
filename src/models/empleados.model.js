import pool from "../config/database.js";

/**
 * Modelo de Empleados
 */
export const empleadosModel = {
  /**
   * Obtener todos los empleados con JOINs
   */
  findAll: async () => {
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

    // Formatear fechas
    return result.rows.map((row) => ({
      ...row,
      fd_fecha_nacimiento: row.fd_fecha_nacimiento
        ? row.fd_fecha_nacimiento.toISOString()
        : null,
      fd_fecha_contratacion: row.fd_fecha_contratacion
        ? row.fd_fecha_contratacion.toISOString()
        : null,
    }));
  },

  /**
   * Crear nuevo empleado
   */
  create: async (data) => {
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
    } = data;

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
    return result.rows[0];
  },

  /**
   * Actualizar empleado
   */
  update: async (id, data) => {
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
    } = data;

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
    return result.rows[0];
  },

  /**
   * Eliminar empleado
   */
  delete: async (id) => {
    const result = await pool.query(
      "DELETE FROM empleados WHERE fi_empleado_id = $1",
      [id]
    );
    return result.rowCount > 0;
  },
};

import pool from "../db.js";

class EquipoModel {
  static async getEmpleadosActivos() {
    const result = await pool.query(`
      SELECT
        e.fi_empleado_id,
        CONCAT_WS(' ', e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno) AS fc_nombre_completo
      FROM rrhh.empleados e
      WHERE e.fb_activo = true
      ORDER BY fc_nombre_completo;
    `);
    return result.rows;
  }

  static async getByUsuario(usuarioId) {
    const result = await pool.query(
      "SELECT * FROM equipos WHERE fi_usuario_id = $1 ORDER BY fi_equipo_id DESC",
      [usuarioId]
    );
    return result.rows;
  }

  static async create(data) {
    const result = await pool.query(
      `INSERT INTO equipos (
        fc_nombre, fc_marca, fc_modelo, fc_tipo,
        fd_fecha_compra, fn_costo, fc_estado,
        fc_ubicacion, fc_responsable,
        fd_proximo_mantenimiento, fc_notas, fi_usuario_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        data.fc_nombre, data.fc_marca, data.fc_modelo, data.fc_tipo,
        data.fd_fecha_compra, data.fn_costo, data.fc_estado,
        data.fc_ubicacion, data.fc_responsable,
        data.fd_proximo_mantenimiento, data.fc_notas, data.fi_usuario_id,
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE equipos SET
        fc_nombre=$1, fc_marca=$2, fc_modelo=$3, fc_tipo=$4,
        fd_fecha_compra=$5, fn_costo=$6, fc_estado=$7,
        fc_ubicacion=$8, fc_responsable=$9,
        fd_proximo_mantenimiento=$10, fc_notas=$11
      WHERE fi_equipo_id=$12
      RETURNING *`,
      [
        data.fc_nombre, data.fc_marca, data.fc_modelo, data.fc_tipo,
        data.fd_fecha_compra, data.fn_costo, data.fc_estado,
        data.fc_ubicacion, data.fc_responsable,
        data.fd_proximo_mantenimiento, data.fc_notas, id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM equipos WHERE fi_equipo_id = $1", [id]);
  }

  /* =========================================================
     MANTENIMIENTOS
  ========================================================= */
  static async getMantenimientos(equipoId) {
    const result = await pool.query(
      "SELECT * FROM mantenimientos WHERE fi_equipo_id = $1 ORDER BY fd_fecha DESC",
      [equipoId]
    );
    return result.rows;
  }

  static async createMantenimiento(equipoId, data) {
    const result = await pool.query(
      `INSERT INTO mantenimientos (
        fi_equipo_id, fd_fecha, fc_tipo, fc_responsable,
        fc_descripcion, fn_costo, fc_estado_post, fd_proximo_mantenimiento
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        equipoId, data.fd_fecha, data.fc_tipo, data.fc_responsable,
        data.fc_descripcion, data.fn_costo,
        data.fc_estado_post, data.fd_proximo_mantenimiento,
      ]
    );
    return result.rows[0];
  }

  static async updateMantenimiento(mantenimientoId, data) {
    const result = await pool.query(
      `UPDATE mantenimientos SET
        fd_fecha=$1, fc_tipo=$2, fc_responsable=$3,
        fc_descripcion=$4, fn_costo=$5, fc_estado_post=$6,
        fd_proximo_mantenimiento=$7
      WHERE fi_mantenimiento_id=$8
      RETURNING *`,
      [
        data.fd_fecha, data.fc_tipo, data.fc_responsable,
        data.fc_descripcion, data.fn_costo,
        data.fc_estado_post, data.fd_proximo_mantenimiento,
        mantenimientoId,
      ]
    );
    return result.rows[0];
  }

  static async deleteMantenimiento(mantenimientoId) {
    await pool.query(
      "DELETE FROM mantenimientos WHERE fi_mantenimiento_id = $1",
      [mantenimientoId]
    );
  }
}

export default EquipoModel;

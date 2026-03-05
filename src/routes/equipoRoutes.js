import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
    OBTENER TODOS LOS EQUIPOS (por usuario)
   ========================================================= */
router.get("/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const result = await pool.query(
      `
      SELECT * 
      FROM equipos
      WHERE fi_usuario_id = $1
      ORDER BY fi_equipo_id DESC
      `,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener equipos:", err);
    res.status(500).send("Error al obtener equipos");
  }
});

/* =========================================================
    REGISTRAR NUEVO EQUIPO
   ========================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      fc_nombre,
      fc_marca,
      fc_modelo,
      fc_tipo,
      fd_fecha_compra,
      fn_costo,
      fc_estado,
      fc_ubicacion,
      fc_responsable,
      fd_proximo_mantenimiento,
      fc_notas,
      fi_usuario_id
    } = req.body;

    const insert = await pool.query(
      `
      INSERT INTO equipos (
        fc_nombre, fc_marca, fc_modelo, fc_tipo,
        fd_fecha_compra, fn_costo, fc_estado,
        fc_ubicacion, fc_responsable,
        fd_proximo_mantenimiento, fc_notas, fi_usuario_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        fc_nombre,
        fc_marca,
        fc_modelo,
        fc_tipo,
        fd_fecha_compra,
        fn_costo,
        fc_estado,
        fc_ubicacion,
        fc_responsable,
        fd_proximo_mantenimiento,
        fc_notas,
        fi_usuario_id
      ]
    );

    res.json(insert.rows[0]);
  } catch (err) {
    console.error("Error al registrar equipo:", err);
    res.status(500).send("Error al registrar equipo");
  }
});

/* =========================================================
    ACTUALIZAR EQUIPO
   ========================================================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fc_nombre,
      fc_marca,
      fc_modelo,
      fc_tipo,
      fd_fecha_compra,
      fn_costo,
      fc_estado,
      fc_ubicacion,
      fc_responsable,
      fd_proximo_mantenimiento,
      fc_notas
    } = req.body;

    const result = await pool.query(
      `
      UPDATE equipos SET
        fc_nombre=$1, fc_marca=$2, fc_modelo=$3, fc_tipo=$4,
        fd_fecha_compra=$5, fn_costo=$6, fc_estado=$7,
        fc_ubicacion=$8, fc_responsable=$9,
        fd_proximo_mantenimiento=$10, fc_notas=$11
      WHERE fi_equipo_id=$12
      RETURNING *
      `,
      [
        fc_nombre,
        fc_marca,
        fc_modelo,
        fc_tipo,
        fd_fecha_compra,
        fn_costo,
        fc_estado,
        fc_ubicacion,
        fc_responsable,
        fd_proximo_mantenimiento,
        fc_notas,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar equipo:", err);
    res.status(500).send("Error al actualizar equipo");
  }
});

/* =========================================================
    ELIMINAR EQUIPO
   ========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM equipos WHERE fi_equipo_id = $1`, [id]);
    res.send("Equipo eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar equipo:", err);
    res.status(500).send("Error al eliminar equipo");
  }
});

/* =========================================================
    REGISTRAR MANTENIMIENTO
   ========================================================= */
router.post("/:equipo_id/mantenimientos", async (req, res) => {
  try {
    const { equipo_id } = req.params;
    const {
      fd_fecha,
      fc_tipo,
      fc_responsable,
      fc_descripcion,
      fn_costo,
      fc_estado_post,
      fd_proximo_mantenimiento
    } = req.body;

    const insert = await pool.query(
      `
      INSERT INTO mantenimientos (
        fi_equipo_id, fd_fecha, fc_tipo, fc_responsable,
        fc_descripcion, fn_costo, fc_estado_post, fd_proximo_mantenimiento
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        equipo_id,
        fd_fecha,
        fc_tipo,
        fc_responsable,
        fc_descripcion,
        fn_costo,
        fc_estado_post,
        fd_proximo_mantenimiento
      ]
    );

    res.json(insert.rows[0]);
  } catch (err) {
    console.error("Error al registrar mantenimiento:", err);
    res.status(500).send("Error al registrar mantenimiento");
  }
});

/* =========================================================
    ACTUALIZAR MANTENIMIENTO
   ========================================================= */
router.put("/mantenimientos/:mantenimiento_id", async (req, res) => {
  try {
    const { mantenimiento_id } = req.params;
    const {
      fd_fecha,
      fc_tipo,
      fc_responsable,
      fc_descripcion,
      fn_costo,
      fc_estado_post,
      fd_proximo_mantenimiento
    } = req.body;

    const result = await pool.query(
      `
      UPDATE mantenimientos SET
        fd_fecha=$1, fc_tipo=$2, fc_responsable=$3,
        fc_descripcion=$4, fn_costo=$5, fc_estado_post=$6,
        fd_proximo_mantenimiento=$7
      WHERE fi_mantenimiento_id=$8
      RETURNING *
      `,
      [
        fd_fecha,
        fc_tipo,
        fc_responsable,
        fc_descripcion,
        fn_costo,
        fc_estado_post,
        fd_proximo_mantenimiento,
        mantenimiento_id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar mantenimiento:", err);
    res.status(500).send("Error al actualizar mantenimiento");
  }
});

/* =========================================================
    ELIMINAR MANTENIMIENTO
   ========================================================= */
router.delete("/mantenimientos/:mantenimiento_id", async (req, res) => {
  try {
    const { mantenimiento_id } = req.params;
    await pool.query(`DELETE FROM mantenimientos WHERE fi_mantenimiento_id = $1`, [
      mantenimiento_id,
    ]);
    res.send("Mantenimiento eliminado correctamente");
  } catch (err) {
    console.error("Error al eliminar mantenimiento:", err);
    res.status(500).send("Error al eliminar mantenimiento");
  }
});

/* =========================================================
    OBTENER MANTENIMIENTOS POR EQUIPO
   ========================================================= */
router.get("/:equipo_id/mantenimientos", async (req, res) => {
  try {
    const { equipo_id } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM mantenimientos
      WHERE fi_equipo_id = $1
      ORDER BY fd_fecha DESC
      `,
      [equipo_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener mantenimientos:", err);
    res.status(500).send("Error al obtener mantenimientos");
  }
});

export default router;

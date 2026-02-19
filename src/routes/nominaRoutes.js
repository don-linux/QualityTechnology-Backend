import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   🟢 OBTENER NÓMINAS (filtrado opcional)
   ========================================================= */
router.get("/", async (req, res) => {
  try {
    const { nombre, fecha } = req.query;

    let query = "SELECT * FROM nomina WHERE 1=1";
    const params = [];

    if (nombre) {
      params.push(`%${nombre.toLowerCase()}%`);
      query += ` AND LOWER(fc_nombre_empleado) LIKE $${params.length}`;
    }
    if (fecha) {
      params.push(fecha);
      query += ` AND fd_fecha_pago = $${params.length}`;
    }

    query += " ORDER BY fd_fecha_pago DESC, fc_nombre_empleado ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener nóminas:", err);
    res.status(500).send("Error al obtener nóminas");
  }
});

/* =========================================================
   🟢 REGISTRAR PAGO DE NÓMINA
   ========================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      fc_nombre_empleado,
      fi_empleado_id,
      fd_fecha_pago,
      fn_total,
      fn_bono,
      fn_deuda,
      fn_descuento,
      fn_anticipo,
      fi_usuario_id
    } = req.body;

    const insert = await pool.query(
      `
      INSERT INTO nomina (
        fc_nombre_empleado, fi_empleado_id, fd_fecha_pago,
        fn_total, fn_bono, fn_deuda, fn_descuento, fn_anticipo, fi_usuario_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `,
      [
        fc_nombre_empleado,
        fi_empleado_id,
        fd_fecha_pago,
        fn_total,
        fn_bono,
        fn_deuda,
        fn_descuento,
        fn_anticipo,
        fi_usuario_id
      ]
    );

    res.json(insert.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar nómina:", err);
    res.status(500).send("Error al registrar nómina");
  }
});

/* =========================================================
   🟡 ACTUALIZAR NÓMINA
   ========================================================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    delete data.fd_fecha_actualizacion;

    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return res.status(400).send("Nada que actualizar.");

    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");
    const query = `
      UPDATE nomina SET ${sets}, fd_fecha_actualizacion=NOW()
      WHERE fi_nomina_id=$${keys.length + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, [...values, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar nómina:", err);
    res.status(500).send("Error al actualizar nómina");
  }
});

/* =========================================================
   🔴 ELIMINAR NÓMINA
   ========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM nomina WHERE fi_nomina_id=$1", [req.params.id]);
    res.send("✅ Registro eliminado correctamente");
  } catch (err) {
    console.error("❌ Error al eliminar nómina:", err);
    res.status(500).send("Error al eliminar nómina");
  }
});

export default router;

import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ---------------------------------------------------------
   UTILIDADES
--------------------------------------------------------- */
function sanitize(value) {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
}

function calcularEstado(total, abonado) {
  if (abonado <= 0) return "ADEUDO";
  if (abonado > 0 && abonado < total) return "PARCIAL";
  return "LIQUIDADO";
}

/* ---------------------------------------------------------
   LISTAS
--------------------------------------------------------- */

router.get("/clientes", async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT fi_cliente_id AS id, fc_nombre AS nombre
      FROM clientes
      ORDER BY nombre ASC
    `);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   ENCARGADOS POR EMPRESA (ANTES DEL /)
--------------------------------------------------------- */
router.get("/encargados/:empresa", async (req, res) => {
  const { empresa } = req.params;

  let puesto = null;

  if (empresa === "MEDELLIN") puesto = "GAM";
  if (empresa === "CEIBA") puesto = "GAC";

  // QUALITY u otros → sin encargados
  if (!puesto) return res.json([]);

  try {
    const r = await pool.query(
      `
      SELECT fi_expediente_id AS id, fc_nombre AS nombre
      FROM expedientes
      WHERE fc_puesto = $1
      ORDER BY fc_nombre ASC
      `,
      [puesto]
    );

    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   LISTAR VENTAS
--------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM ventas ORDER BY fd_fecha_venta DESC, fi_venta_id DESC`
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   REGISTRAR
--------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    let {
      fc_folio,
      fd_fecha_venta,
      fc_cliente,
      fc_tipo_venta,
      fn_cantidad_vendida,
      fn_precio_venta,
      fn_abonado,
      fc_encargado_venta,
      fc_observaciones,
      fc_empresa,
    } = req.body;

    fn_cantidad_vendida = sanitize(fn_cantidad_vendida);
    fn_precio_venta = sanitize(fn_precio_venta);
    fn_abonado = sanitize(fn_abonado);

    /* VALIDACIONES */
    if (!fc_cliente) {
      return res.status(400).json({ error: "Cliente obligatorio" });
    }

    if (!fc_encargado_venta) {
      return res.status(400).json({ error: "Encargado obligatorio" });
    }

    if (fn_cantidad_vendida <= 0 || fn_precio_venta <= 0) {
      return res
        .status(400)
        .json({ error: "Cantidad o precio inválidos" });
    }

    const fn_monto_total = fn_cantidad_vendida * fn_precio_venta;
    const fn_adeudo = fn_monto_total - fn_abonado;
    const fc_estado_pago = calcularEstado(fn_monto_total, fn_abonado);

    await pool.query(
      `
      INSERT INTO ventas (
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_monto_total,
        fn_abonado, fn_adeudo, fc_estado_pago,
        fc_encargado_venta, fc_observaciones, fc_empresa,
        fd_fecha_registro
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
    `,
      [
        fc_folio,
        fd_fecha_venta,
        fc_cliente,
        fc_tipo_venta,
        fn_cantidad_vendida,
        fn_precio_venta,
        fn_monto_total,
        fn_abonado,
        fn_adeudo,
        fc_estado_pago,
        fc_encargado_venta,
        fc_observaciones,
        fc_empresa,
      ]
    );

    res.json({ msg: "Venta registrada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   ACTUALIZAR
--------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let {
      fc_folio,
      fd_fecha_venta,
      fc_cliente,
      fc_tipo_venta,
      fn_cantidad_vendida,
      fn_precio_venta,
      fn_abonado,
      fc_encargado_venta,
      fc_observaciones,
      fc_empresa,
    } = req.body;

    fn_cantidad_vendida = sanitize(fn_cantidad_vendida);
    fn_precio_venta = sanitize(fn_precio_venta);
    fn_abonado = sanitize(fn_abonado);

    const fn_monto_total = fn_cantidad_vendida * fn_precio_venta;
    const fn_adeudo = fn_monto_total - fn_abonado;
    const fc_estado_pago = calcularEstado(fn_monto_total, fn_abonado);

    await pool.query(
      `
      UPDATE ventas SET
        fc_folio = $1,
        fd_fecha_venta = $2,
        fc_cliente = $3,
        fc_tipo_venta = $4,
        fn_cantidad_vendida = $5,
        fn_precio_venta = $6,
        fn_monto_total = $7,
        fn_abonado = $8,
        fn_adeudo = $9,
        fc_estado_pago = $10,
        fc_encargado_venta = $11,
        fc_observaciones = $12,
        fc_empresa = $13,
        fd_fecha_modificacion = NOW()
      WHERE fi_venta_id = $14
    `,
      [
        fc_folio,
        fd_fecha_venta,
        fc_cliente,
        fc_tipo_venta,
        fn_cantidad_vendida,
        fn_precio_venta,
        fn_monto_total,
        fn_abonado,
        fn_adeudo,
        fc_estado_pago,
        fc_encargado_venta,
        fc_observaciones,
        fc_empresa,
        id,
      ]
    );

    res.json({ msg: "Venta actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   ELIMINAR
--------------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ventas WHERE fi_venta_id = $1", [
      req.params.id,
    ]);
    res.json({ msg: "Venta eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

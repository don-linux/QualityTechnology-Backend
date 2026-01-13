import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ============================================================
   🧮 FUNCIONES AUXILIARES
============================================================ */
function calcularTotal(cantidad, precio) {
  const c = Number(cantidad) || 0;
  const p = Number(precio) || 0;
  return c * p;
}

function normalizarGranja(g) {
  if (!g) return null;
  const g2 = g.toLowerCase().trim();

  if (g2 === "medellin") return "Medellin";
  if (g2 === "la ceiba") return "La Ceiba";
  return g;
}

/**
 * Convierte "" o undefined en null, y si es numérico lo castea a Number.
 * Así evitamos el error “invalid input syntax for type numeric: ''”
 */
function sanitizeNumeric(val) {
  if (val === "" || val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

/* ============================================================
   🟡 OBTENER TODAS LAS VENTAS
============================================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ventas ORDER BY fi_venta_id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener ventas:", err);
    res.status(500).send("Error del servidor");
  }
});

/* ============================================================
   🟢 INSERTAR VENTA
============================================================ */
router.post("/", async (req, res) => {
  try {
    let {
      fd_fecha_venta,
      fn_talla,
      fn_cantidad_vendida,
      fc_cliente,
      fn_precio_venta,

      fc_lugar_entrega,
      fc_estado,
      fc_encargado_venta,
      fc_estanque_cosecha,
      fc_estado_pago,
      fc_metodo_pago,
      fc_observaciones,
      fc_unidad_produccion,
      fc_granja,

      fi_usuario_id
    } = req.body;

    // 🔧 Sanitizar datos numéricos
    fn_talla = sanitizeNumeric(fn_talla);
    fn_cantidad_vendida = sanitizeNumeric(fn_cantidad_vendida);
    fn_precio_venta = sanitizeNumeric(fn_precio_venta);
    fi_usuario_id = sanitizeNumeric(fi_usuario_id);

    const fn_monto_total = calcularTotal(fn_cantidad_vendida, fn_precio_venta);
    const now = new Date();

    const result = await pool.query(
      `
      INSERT INTO ventas (
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,

        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        fc_granja,

        fd_fecha_registro,
        fd_fecha_modificacion,
        fi_usuario_id
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$16,$17
      )
      RETURNING *
      `,
      [
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,

        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        normalizarGranja(fc_granja),

        now,
        fi_usuario_id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al crear venta:", err);
    res.status(500).send("Error del servidor");
  }
});

/* ============================================================
   🔵 ACTUALIZAR VENTA
============================================================ */
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let {
      fd_fecha_venta,
      fn_talla,
      fn_cantidad_vendida,
      fc_cliente,
      fn_precio_venta,

      fc_lugar_entrega,
      fc_estado,
      fc_encargado_venta,
      fc_estanque_cosecha,
      fc_estado_pago,
      fc_metodo_pago,
      fc_observaciones,
      fc_unidad_produccion,
      fc_granja,

      fi_usuario_id
    } = req.body;

    // 🔧 Sanitizar numéricos
    fn_talla = sanitizeNumeric(fn_talla);
    fn_cantidad_vendida = sanitizeNumeric(fn_cantidad_vendida);
    fn_precio_venta = sanitizeNumeric(fn_precio_venta);
    fi_usuario_id = sanitizeNumeric(fi_usuario_id);

    const fn_monto_total = calcularTotal(fn_cantidad_vendida, fn_precio_venta);
    const now = new Date();

    const result = await pool.query(
      `
      UPDATE ventas SET
        fd_fecha_venta = $1,
        fn_talla = $2,
        fn_cantidad_vendida = $3,
        fc_cliente = $4,
        fn_precio_venta = $5,
        fn_monto_total = $6,
        fc_lugar_entrega = $7,
        fc_estado = $8,
        fc_encargado_venta = $9,
        fc_estanque_cosecha = $10,
        fc_estado_pago = $11,
        fc_metodo_pago = $12,
        fc_observaciones = $13,
        fc_unidad_produccion = $14,
        fc_granja = $15,
        fd_fecha_modificacion = $16,
        fi_usuario_id = $17
      WHERE fi_venta_id = $18
      RETURNING *
      `,
      [
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,
        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        normalizarGranja(fc_granja),
        now,
        fi_usuario_id,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar venta:", err);
    res.status(500).send("Error del servidor");
  }
});

/* ============================================================
   📊 CONCENTRADO
============================================================ */
router.get("/concentrado", async (req, res) => {
  let { granja } = req.query;

  try {
    let where = "";
    const params = [];

    if (granja && granja !== "ALL") {
      where = "WHERE fc_granja = $1";
      params.push(normalizarGranja(granja));
    }

    const result = await pool.query(
      `
      SELECT *
      FROM vw_concentrado_general_granjas
      ${where}
      ORDER BY mes
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener concentrado:", err);
    res.status(500).send("Error al generar concentrado.");
  }
});

export default router;

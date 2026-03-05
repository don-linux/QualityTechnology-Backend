import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* =========================================================
    Configuración de subida de archivos (facturas)
========================================================= */

// Carpeta donde se guardarán las facturas
const uploadDir = "./uploads/facturas";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configurar Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/* =========================================================
    Integración: obtener lista de clientes y proveedores
========================================================= */
router.get("/clientes", async (req, res) => {
  console.log("Ruta /flujo-caja/clientes recibida");
  try {
    const result = await pool.query(`
      SELECT fc_nombre AS nombre
      FROM public.clientes
      ORDER BY fc_nombre ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).send("Error al obtener clientes");
  }
});

router.get("/proveedores", async (req, res) => {
  console.log("Ruta /flujo-caja/proveedores recibida");
  try {
    const result = await pool.query(`
      SELECT nombre
      FROM public.proveedores
      ORDER BY nombre ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener proveedores:", err);
    res.status(500).send("Error al obtener proveedores");
  }
});

/* =========================================================
    GET - Tesorería por granja
========================================================= */
router.get("/tesoreria/:granja", async (req, res) => {
  const { granja } = req.params;
  try {
    const query = `
      SELECT 
        fc_mes,
        fc_categoria,
        total_ingreso AS total_ingresos,
        total_egreso AS total_egresos,
        saldo_neto AS saldo
      FROM vw_tesoreria_general
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fc_mes ASC;
    `;
    const result = await pool.query(query, [granja]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener tesorería:", err);
    res.status(500).send("Error al obtener datos de tesorería");
  }
});

/* =========================================================
    GET - Movimientos por granja
========================================================= */
router.get("/:granja", async (req, res) => {
  const { granja } = req.params;
  try {
    const query = `
      SELECT 
        fi_movimiento_id, fc_granja, fd_fecha, fn_ingreso, fn_egreso,
        fc_descripcion, fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto,
        fc_factura, fc_estatus, fc_mes, fd_fecha_registro
      FROM flujo_caja
      WHERE UPPER(fc_granja) = UPPER($1)
      ORDER BY fd_fecha DESC;
    `;
    const result = await pool.query(query, [granja]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener movimientos:", err);
    res.status(500).send("Error del servidor al obtener movimientos");
  }
});

/* =========================================================
    POST - Registrar nuevo movimiento con control de cuentas
      + Soporte de factura (imagen opcional)
========================================================= */
router.post("/", upload.single("facturaFile"), async (req, res) => {
  try {
    const {
      fc_granja,
      fd_fecha,
      fn_ingreso,
      fn_egreso,
      fc_descripcion,
      fc_cuenta,
      fc_categoria,
      fc_subcategoria,
      fc_beneficiario,
      fc_noproyecto,
      fc_estatus,
    } = req.body;

    const fc_mes = fd_fecha?.slice(0, 7);
    const ingreso = Number(fn_ingreso) || 0;
    const egreso = Number(fn_egreso) || 0;
    const ingresoFinal = ingreso > 0 ? ingreso : 0;
    const egresoFinal = egreso > 0 ? egreso : 0;

    // Verificar existencia de la cuenta
    const cuentaQuery = await pool.query(
      "SELECT * FROM cuentas WHERE nombre = $1",
      [fc_cuenta]
    );

    if (cuentaQuery.rows.length === 0) {
      return res.status(400).json({ error: "La cuenta seleccionada no existe." });
    }

    const cuenta = cuentaQuery.rows[0];
    let saldoActual = parseFloat(cuenta.saldo);

    // Validar saldo suficiente si es egreso
    if (egresoFinal > 0) {
      if (egresoFinal > saldoActual) {
        return res.status(400).json({
          error: `Saldo insuficiente en "${fc_cuenta}". Disponible: $${saldoActual.toFixed(2)}.`,
        });
      }
      saldoActual -= egresoFinal;
    }

    // Aumentar saldo si es ingreso
    if (ingresoFinal > 0) {
      saldoActual += ingresoFinal;
    }

    // Si se sube archivo, guarda la ruta; si no, queda null
    const fc_factura = req.file ? `/uploads/facturas/${req.file.filename}` : null;

    // Registrar movimiento en flujo_caja
    const result = await pool.query(
      `INSERT INTO flujo_caja (
        fc_granja, fd_fecha, fn_ingreso, fn_egreso, fc_descripcion,
        fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto,
        fc_factura, fc_estatus, fc_mes, fd_fecha_registro
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
      RETURNING *;`,
      [
        fc_granja,
        fd_fecha,
        ingresoFinal,
        egresoFinal,
        fc_descripcion,
        fc_cuenta,
        fc_categoria,
        fc_subcategoria,
        fc_beneficiario,
        fc_noproyecto,
        fc_factura,
        fc_estatus,
        fc_mes,
      ]
    );

    // Actualizar saldo de la cuenta
    await pool.query("UPDATE cuentas SET saldo = $1 WHERE id = $2", [
      saldoActual,
      cuenta.id,
    ]);

    console.log(`Saldo actualizado para ${fc_cuenta}: $${saldoActual.toFixed(2)}`);

    res.json({
      message: "Movimiento registrado correctamente",
      movimiento: result.rows[0],
      nuevoSaldo: saldoActual,
    });
  } catch (err) {
    console.error("Error al registrar movimiento:", err);
    res.status(500).json({ error: "Error al registrar movimiento" });
  }
});

/* =========================================================
    PUT - Actualizar movimiento
========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const {
      fc_granja,
      fd_fecha,
      fn_ingreso,
      fn_egreso,
      fc_descripcion,
      fc_cuenta,
      fc_categoria,
      fc_subcategoria,
      fc_beneficiario,
      fc_noproyecto,
      fc_factura,
      fc_estatus,
    } = req.body;

    const fc_mes = fd_fecha?.slice(0, 7);
    const ingreso = Number(fn_ingreso) || 0;
    const egreso = Number(fn_egreso) || 0;
    const ingresoFinal = ingreso > 0 ? ingreso : 0;
    const egresoFinal = egreso > 0 ? egreso : 0;

    const result = await pool.query(
      `UPDATE flujo_caja
       SET fc_granja=$1, fd_fecha=$2, fn_ingreso=$3, fn_egreso=$4,
           fc_descripcion=$5, fc_cuenta=$6, fc_categoria=$7, fc_subcategoria=$8,
           fc_beneficiario=$9, fc_noproyecto=$10,
           fc_factura=$11, fc_estatus=$12, fc_mes=$13
       WHERE fi_movimiento_id=$14 RETURNING *`,
      [
        fc_granja,
        fd_fecha,
        ingresoFinal,
        egresoFinal,
        fc_descripcion,
        fc_cuenta,
        fc_categoria,
        fc_subcategoria,
        fc_beneficiario,
        fc_noproyecto,
        fc_factura,
        fc_estatus,
        fc_mes,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar movimiento:", err);
    res.status(500).send("Error al actualizar movimiento");
  }
});

/* =========================================================
    DELETE - Eliminar movimiento
========================================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM flujo_caja WHERE fi_movimiento_id=$1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("Error al eliminar movimiento:", err);
    res.status(500).send("Error al eliminar movimiento");
  }
});

/* =========================================================
    Servir archivos estáticos de facturas
========================================================= */
router.use("/uploads/facturas", express.static("uploads/facturas"));

export default router;

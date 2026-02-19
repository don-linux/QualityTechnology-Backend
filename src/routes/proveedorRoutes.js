import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ============================================================
   📦 GET: Obtener todos los proveedores
============================================================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM proveedores ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   📦 POST: Crear proveedor nuevo
============================================================ */
router.post("/", async (req, res) => {
  const {
    nombre,
    empresa,
    rfc,
    categoria,
    contacto,
    telefono,
    correo,
    direccion,
    forma_pago,
    plazo_credito,
    ultima_compra,
    monto_promedio,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO proveedores 
        (nombre, empresa, rfc, categoria, contacto, telefono, correo, direccion, forma_pago, plazo_credito, ultima_compra, monto_promedio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        nombre,
        empresa,
        rfc,
        categoria,
        contacto,
        telefono,
        correo,
        direccion,
        forma_pago,
        plazo_credito,
        ultima_compra || null,
        monto_promedio || 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   ✏️ PUT: Actualizar proveedor
============================================================ */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    empresa,
    rfc,
    categoria,
    contacto,
    telefono,
    correo,
    direccion,
    forma_pago,
    plazo_credito,
    ultima_compra,
    monto_promedio,
    activo,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE proveedores
       SET nombre=$1, empresa=$2, rfc=$3, categoria=$4, contacto=$5, telefono=$6, correo=$7,
           direccion=$8, forma_pago=$9, plazo_credito=$10, ultima_compra=$11, monto_promedio=$12,
           activo=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [
        nombre,
        empresa,
        rfc,
        categoria,
        contacto,
        telefono,
        correo,
        direccion,
        forma_pago,
        plazo_credito,
        ultima_compra || null,
        monto_promedio || 0,
        activo,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   🗑️ DELETE: Eliminar proveedor
============================================================ */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM proveedores WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

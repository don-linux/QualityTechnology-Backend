import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   ✅ GET - Registros de Engorda por usuario (o todos si admin)
   ========================================================= */
router.get("/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // 1️⃣ Verificar el rol del usuario
    const rolRes = await pool.query(
      `SELECT r.fc_nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.fi_rol_id = r.fi_rol_id
       WHERE u.fi_usuario_id = $1`,
      [usuario_id]
    );

    const rol = rolRes.rows[0]?.rol || "";

    // 2️⃣ Obtener registros según el rol
    let result;
    if (rol.toLowerCase() === "administrador") {
      // 🔸 Administrador ve todos los registros
      result = await pool.query(`
        SELECT 
          fi_engorda_id,
          instalacion,
          cantidad,
          talla_gr,
          no_lote,
          observacion,
          fecha_siembra,
          fecha_biometria,
          CURRENT_DATE - fecha_siembra AS dias_en_pila,
          CURRENT_DATE - fecha_biometria AS dias_transcurridos,
          particula_mm,
          fi_usuario_id
        FROM engorda
        ORDER BY fi_engorda_id DESC;
      `);
    } else {
      // 🔹 Usuario normal solo ve los suyos
      result = await pool.query(
        `
        SELECT 
          fi_engorda_id,
          instalacion,
          cantidad,
          talla_gr,
          no_lote,
          observacion,
          fecha_siembra,
          fecha_biometria,
          CURRENT_DATE - fecha_siembra AS dias_en_pila,
          CURRENT_DATE - fecha_biometria AS dias_transcurridos,
          particula_mm,
          fi_usuario_id
        FROM engorda
        WHERE fi_usuario_id = $1
        ORDER BY fi_engorda_id DESC;
        `,
        [usuario_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener engorda:", err);
    res.status(500).send("Error del servidor al obtener engorda");
  }
});

/* =========================================================
   ✅ POST - Registrar Engorda (guarda fi_usuario_id)
   ========================================================= */
router.post("/", async (req, res) => {
  const {
    instalacion,
    cantidad,
    talla_gr,
    no_lote,
    observacion,
    fecha_siembra,
    fecha_biometria,
    particula_mm,
    fi_usuario_id,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO engorda (
        instalacion, cantidad, talla_gr, no_lote, observacion,
        fecha_siembra, fecha_biometria, particula_mm, fecha_registro, fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9)
      RETURNING *`,
      [
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        particula_mm,
        fi_usuario_id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar engorda:", err);
    res.status(500).send("Error del servidor al registrar engorda");
  }
});

/* =========================================================
   🔄 PUT - Actualizar Engorda
   ========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    instalacion,
    cantidad,
    talla_gr,
    no_lote,
    observacion,
    fecha_siembra,
    fecha_biometria,
    particula_mm,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE engorda
       SET instalacion=$1, cantidad=$2, talla_gr=$3, no_lote=$4,
           observacion=$5, fecha_siembra=$6, fecha_biometria=$7, particula_mm=$8
       WHERE fi_engorda_id=$9
       RETURNING *`,
      [
        instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_biometria,
        particula_mm,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar engorda:", err);
    res.status(500).send("Error del servidor al actualizar engorda");
  }
});

/* =========================================================
   ❌ DELETE - Eliminar Engorda
   ========================================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM engorda WHERE fi_engorda_id=$1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error al eliminar engorda:", err);
    res.status(500).send("Error del servidor al eliminar engorda");
  }
});

export default router;

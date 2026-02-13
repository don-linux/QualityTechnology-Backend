import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   ✅ REGISTRAR NUEVO ALIMENTO
   ========================================================= */
router.post("/", async (req, res) => {
  try {
    const { fi_reproductor_id, fi_pileta_id, fi_engorda_id, fi_usuario_id } = req.body;

    let particula_mm = 0;
    let alimento_dia = 0;
    let porcion = 0;
    let gasto_alimento = 0;

    // 🐟 Caso 1: PILETA (Alevinaje)
    if (fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
      const p = await pool.query(
        `SELECT cantidad, talla_gr FROM piletas WHERE fi_pileta_id = $1`,
        [fi_pileta_id]
      );

      if (p.rows.length > 0) {
        const cantidad = Number(p.rows[0].cantidad) || 0;
        const talla = Number(p.rows[0].talla_gr) || 0;

        if (talla < 5) particula_mm = 1.0;
        else if (talla < 20) particula_mm = 2.0;
        else if (talla < 50) particula_mm = 3.0;
        else particula_mm = 4.0;

        porcion = 0.03;
        alimento_dia = cantidad * porcion;
        gasto_alimento = alimento_dia * 60;
      }
    }

    // 🧬 Caso 2: REPRODUCTOR
    else if (fi_reproductor_id && !fi_pileta_id && !fi_engorda_id) {
      const r = await pool.query(
        `SELECT fn_cantidad FROM reproductores WHERE fi_reproductor_id = $1`,
        [fi_reproductor_id]
      );
      if (r.rows.length > 0) {
        const cantidad = Number(r.rows[0].fn_cantidad) || 0;
        alimento_dia = cantidad * 0.03;
        porcion = 0.03;
        particula_mm = 3.0;
        gasto_alimento = alimento_dia * 60;
      }
    }

    // 🧫 Caso 3: ENGORDA
    else if (fi_engorda_id && !fi_pileta_id && !fi_reproductor_id) {
      const e = await pool.query(
        `SELECT cantidad, talla_gr FROM engorda WHERE fi_engorda_id = $1`,
        [fi_engorda_id]
      );

      if (e.rows.length > 0) {
        const cantidad = Number(e.rows[0].cantidad) || 0;
        const talla = Number(e.rows[0].talla_gr) || 0;

        if (talla < 100) particula_mm = 3.0;
        else if (talla < 400) particula_mm = 4.0;
        else particula_mm = 5.0;

        porcion = 0.02;
        alimento_dia = cantidad * porcion;
        gasto_alimento = alimento_dia * 60;
      }
    }

    // ❌ Ninguno seleccionado
    if (!fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
      return res
        .status(400)
        .json({ error: "Debe seleccionar una pileta, reproductor o engorda." });
    }

    // 💾 Insertar registro
    const insert = await pool.query(
      `
      INSERT INTO alimentos (
        fi_reproductor_id,
        fi_pileta_id,
        fi_engorda_id,
        particula_mm,
        alimento_dia,
        porcion,
        gasto_alimento,
        fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        fi_reproductor_id ? parseInt(fi_reproductor_id) : null,
        fi_pileta_id ? parseInt(fi_pileta_id) : null,
        fi_engorda_id ? parseInt(fi_engorda_id) : null,
        particula_mm,
        alimento_dia,
        porcion,
        gasto_alimento,
        fi_usuario_id ? parseInt(fi_usuario_id) : null,
      ]
    );

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error("❌ Error al registrar alimento:", error);
    res.status(500).json({ error: "Error al registrar alimento" });
  }
});

/* =========================================================
   ✅ OBTENER REGISTROS (POR USUARIO O ADMIN)
   ========================================================= */
router.get("/:usuario_id", async (req, res) => {
  try {
    const { usuario_id } = req.params;

    // 1️⃣ Consultar rol del usuario
    const rolRes = await pool.query(
      `
      SELECT r.fc_nombre AS rol
      FROM usuarios u
      LEFT JOIN roles r ON u.fi_rol_id = r.fi_rol_id
      WHERE u.fi_usuario_id = $1
      `,
      [usuario_id]
    );

    const rol = rolRes.rows[0]?.rol || "";

    // 2️⃣ Si es administrador, ve todo
    let result;
    if (rol.toLowerCase() === "administrador") {
      result = await pool.query(`
        SELECT 
          a.fi_alimento_id,
          a.fi_reproductor_id,
          a.fi_pileta_id,
          a.fi_engorda_id,
          a.particula_mm,
          a.alimento_dia,
          a.porcion,
          a.gasto_alimento,
          r.fc_instalacion AS reproductor_instalacion,
          p.nombre_instalacion AS pileta_nombre,
          e.instalacion AS engorda_instalacion,
          u.fc_nombre AS usuario_nombre
        FROM alimentos a
        LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
        LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
        LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
        LEFT JOIN usuarios u ON u.fi_usuario_id = a.fi_usuario_id
        ORDER BY a.fi_alimento_id DESC
      `);
    } else {
      // 3️⃣ Si es usuario normal, solo sus registros
      result = await pool.query(
        `
        SELECT 
          a.fi_alimento_id,
          a.fi_reproductor_id,
          a.fi_pileta_id,
          a.fi_engorda_id,
          a.particula_mm,
          a.alimento_dia,
          a.porcion,
          a.gasto_alimento,
          r.fc_instalacion AS reproductor_instalacion,
          p.nombre_instalacion AS pileta_nombre,
          e.instalacion AS engorda_instalacion
        FROM alimentos a
        LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
        LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
        LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
        WHERE a.fi_usuario_id = $1
        ORDER BY a.fi_alimento_id DESC
        `,
        [usuario_id]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener alimentos:", error);
    res.status(500).json({ error: "Error al obtener alimentos" });
  }
});

/* =========================================================
   ❌ ELIMINAR REGISTRO
   ========================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM alimentos WHERE fi_alimento_id = $1`, [id]);
    res.json({ message: "Registro eliminado correctamente ✅" });
  } catch (error) {
    console.error("❌ Error al eliminar alimento:", error);
    res.status(500).json({ error: "Error al eliminar alimento" });
  }
});

export default router;

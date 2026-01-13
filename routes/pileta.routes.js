import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   ✅ GET - Piletas por usuario (o todas si es administrador)
   ========================================================= */
router.get("/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // 1️⃣ Verificar rol del usuario
    const rolRes = await pool.query(
      `SELECT r.fc_nombre AS rol
       FROM usuarios u
       LEFT JOIN roles r ON u.fi_rol_id = r.fi_rol_id
       WHERE u.fi_usuario_id = $1`,
      [usuario_id]
    );

    const rol = rolRes.rows[0]?.rol || "";

    // 2️⃣ Consultar según el rol
    let result;
    if (rol.toLowerCase() === "administrador") {
      // 🔸 Administrador ve todas las piletas
      result = await pool.query(`
        SELECT 
          fi_pileta_id,
          nombre_instalacion,
          cantidad,
          talla_gr,
          no_lote,
          observacion,
          fecha_siembra,
          fecha_ultima_biometria,
          CURRENT_DATE - fecha_siembra AS dias_en_pila,
          CURRENT_DATE - fecha_ultima_biometria AS dias_transcurridos,
          fi_usuario_id
        FROM piletas
        ORDER BY fi_pileta_id DESC;
      `);
    } else {
      // 🔹 Jefe solo ve las piletas de su usuario
      result = await pool.query(`
        SELECT 
          fi_pileta_id,
          nombre_instalacion,
          cantidad,
          talla_gr,
          no_lote,
          observacion,
          fecha_siembra,
          fecha_ultima_biometria,
          CURRENT_DATE - fecha_siembra AS dias_en_pila,
          CURRENT_DATE - fecha_ultima_biometria AS dias_transcurridos,
          fi_usuario_id
        FROM piletas
        WHERE fi_usuario_id = $1
        ORDER BY fi_pileta_id DESC;
      `, [usuario_id]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener piletas:", err);
    res.status(500).send("Error del servidor al obtener piletas");
  }
});

/* =========================================================
   ✅ POST - Registrar pileta (guarda fi_usuario_id)
   ========================================================= */
router.post("/", async (req, res) => {
  const {
    nombre_instalacion,
    cantidad,
    talla_gr,
    no_lote,
    observacion,
    fecha_siembra,
    fecha_ultima_biometria,
    fi_usuario_id,
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO piletas (
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id,
        fecha_registro,
        fd_fecha_modificacion
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE
      ) 
      RETURNING *`, 
      [
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        fi_usuario_id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar la pileta:", err);
    res.status(500).send("Error del servidor al registrar la pileta");
  }
});

/* =========================================================
   🔄 PUT - Actualizar pileta
   ========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre_instalacion,
    cantidad,
    talla_gr,
    no_lote,
    observacion,
    fecha_siembra,
    fecha_ultima_biometria,
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE piletas
      SET nombre_instalacion = $1, cantidad = $2, talla_gr = $3, no_lote = $4,
          observacion = $5, fecha_siembra = $6, fecha_ultima_biometria = $7
      WHERE fi_pileta_id = $8
      RETURNING *`, 
      [
        nombre_instalacion,
        cantidad,
        talla_gr,
        no_lote,
        observacion,
        fecha_siembra,
        fecha_ultima_biometria,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar pileta:", err);
    res.status(500).send("Error del servidor al actualizar la pileta");
  }
});

/* =========================================================
   ❌ DELETE - Eliminar pileta
   ========================================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM piletas WHERE fi_pileta_id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error al eliminar pileta:", err);
    res.status(500).send("Error del servidor al eliminar la pileta");
  }
});

export default router;

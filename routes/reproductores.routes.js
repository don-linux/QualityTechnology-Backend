import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
   🧮 GET - Inventario general (colocado primero para evitar conflicto)
   ========================================================= */
router.get("/inventario", async (req, res) => {
  try {
    const query = `
      SELECT
        fi_reproductor_id AS id,
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        fi_usuario_id,
        (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
        (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos
      FROM reproductores
      ORDER BY fi_reproductor_id ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener inventario de reproductores:", err);
    res.status(500).send("Error del servidor al obtener inventario");
  }
});

/* =========================================================
   ✅ GET - Reproductores por usuario o todos (según rol)
   ========================================================= */
router.get("/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // 1️⃣ Consultar el rol del usuario
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
          fi_reproductor_id,
          fc_instalacion,
          fn_cantidad,
          fn_talla,
          fn_no_lote,
          fc_observacion,
          fd_fecha_siembra,
          fd_fecha_biometria,
          (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
          (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos,
          fi_usuario_id
        FROM reproductores
        ORDER BY fi_reproductor_id DESC;
      `);
    } else {
      // 🔹 Usuario normal ve solo los suyos
      result = await pool.query(
        `
        SELECT 
          fi_reproductor_id,
          fc_instalacion,
          fn_cantidad,
          fn_talla,
          fn_no_lote,
          fc_observacion,
          fd_fecha_siembra,
          fd_fecha_biometria,
          (CURRENT_DATE - fd_fecha_siembra) AS dias_en_pila,
          (CURRENT_DATE - fd_fecha_biometria) AS dias_transcurridos,
          fi_usuario_id
        FROM reproductores
        WHERE fi_usuario_id = $1
        ORDER BY fi_reproductor_id DESC;
        `,
        [usuario_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener reproductores:", err);
    res.status(500).send("Error del servidor al obtener los reproductores");
  }
});

/* =========================================================
   ✅ POST - Registrar reproductor (guarda fi_usuario_id)
   ========================================================= */
router.post("/", async (req, res) => {
  const {
    fc_instalacion,
    fn_cantidad,
    fn_talla,
    fn_no_lote,
    fc_observacion,
    fd_fecha_siembra,
    fd_fecha_biometria,
    fi_usuario_id,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO reproductores (
        fc_instalacion, fn_cantidad, fn_talla, fn_no_lote,
        fc_observacion, fd_fecha_siembra, fd_fecha_biometria, fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        fi_usuario_id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar reproductor:", err);
    res.status(500).send("Error del servidor al registrar reproductor");
  }
});

/* =========================================================
   🔄 PUT - Actualizar reproductor
   ========================================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fc_instalacion,
    fn_cantidad,
    fn_talla,
    fn_no_lote,
    fc_observacion,
    fd_fecha_siembra,
    fd_fecha_biometria,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reproductores
       SET fc_instalacion=$1, fn_cantidad=$2, fn_talla=$3, fn_no_lote=$4,
           fc_observacion=$5, fd_fecha_siembra=$6, fd_fecha_biometria=$7
       WHERE fi_reproductor_id=$8
       RETURNING *`,
      [
        fc_instalacion,
        fn_cantidad,
        fn_talla,
        fn_no_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_biometria,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al actualizar reproductor:", err);
    res.status(500).send("Error del servidor al actualizar el registro");
  }
});

/* =========================================================
   ❌ DELETE - Eliminar registro
   ========================================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM reproductores WHERE fi_reproductor_id=$1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ Error al eliminar reproductor:", err);
    res.status(500).send("Error del servidor al eliminar el registro");
  }
});

export default router;

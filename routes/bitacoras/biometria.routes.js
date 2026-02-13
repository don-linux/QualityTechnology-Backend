import express from "express";
import pool from "../../db.js";

const router = express.Router();

/* --------------------------------------------------------
   🔹 Normalizar nombre de la granja
-------------------------------------------------------- */
function normalizarGranja(g) {
  if (!g) return null;

  g = g.toLowerCase().trim();

  if (g.includes("med")) return "Granja Acuícola Medellín";
  if (g.includes("ceiba")) return "Granja Acuícola La Ceiba";

  return null;
}

/* --------------------------------------------------------
   🔹 Actualizar fecha de biometría según el módulo real
-------------------------------------------------------- */
async function actualizarFechaBiometria(instalacionId, fecha) {
  try {
    // Obtener tipo desde instalaciones
    const inst = await pool.query(
      `SELECT tipo_instalacion FROM instalaciones WHERE fi_instalacion_id = $1`,
      [instalacionId]
    );

    if (inst.rowCount === 0) return;

    const tipo = inst.rows[0].tipo_instalacion;
    let tabla = "";
    let campoFecha = "";

    // Alevinaje → tabla: piletas, campo: fecha_ultima_biometria
    if (tipo === "Alevinaje") {
      tabla = "piletas";
      campoFecha = "fecha_ultima_biometria";
    }

    // Engorda → tabla: engorda, campo: fecha_biometria
    if (tipo === "Engorda") {
      tabla = "engorda";
      campoFecha = "fecha_biometria";
    }

    // Reproductores → tabla: reproductores, campo: fd_fecha_biometria
    if (tipo === "Reproductores") {
      tabla = "reproductores";
      campoFecha = "fd_fecha_biometria";
    }

    if (!tabla || !campoFecha) return;

    await pool.query(
      `UPDATE ${tabla}
       SET ${campoFecha} = $1
       WHERE fi_instalacion_id = $2`,
      [fecha, instalacionId]
    );

  } catch (err) {
    console.error("❌ Error al actualizar fecha biometría:", err);
  }
}

/* --------------------------------------------------------
   🔹 GET – Obtener biometrías por granja
-------------------------------------------------------- */
router.get("/:granja", async (req, res) => {
  try {
    const granja = normalizarGranja(req.params.granja);

    if (!granja)
      return res.status(400).json({ error: "Granja inválida" });

    const result = await pool.query(
      `
      SELECT 
        b.*,
        i.nombre_instalacion AS instalacion_nombre,
        l.no_lote
      FROM biometrias b
      LEFT JOIN instalaciones i ON b.fi_instalacion_id = i.fi_instalacion_id
      LEFT JOIN lotes l ON b.fi_lote_id = l.fi_lote_id
      WHERE b.fc_granja = $1
      ORDER BY b.fd_fecha DESC;
      `,
      [granja]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("❌ GET /biometrias Error:", err);
    res.status(500).json({ error: "Error obteniendo biometrías" });
  }
});

/* --------------------------------------------------------
   🔹 POST – Crear biometría
-------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fc_observaciones,
      fc_encargado,
      fi_instalacion_id,
      fi_lote_id,
      tipo,
      fi_usuario_id,
      fc_granja
    } = req.body;

    const granjaFinal = normalizarGranja(fc_granja);
    if (!granjaFinal)
      return res.status(400).json({ error: "Granja inválida" });

    const pesoProm =
      fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
        ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
        : 0;

    const result = await pool.query(
      `
      INSERT INTO biometrias (
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fn_peso_promedio,
        fc_observaciones,
        fc_encargado,
        fi_instalacion_id,
        fi_lote_id,
        tipo,
        fi_usuario_id,
        fc_granja,
        fd_fecha_registro
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP
      )
      RETURNING fi_id;
      `,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        pesoProm,
        fc_observaciones,
        fc_encargado,
        fi_instalacion_id || null,
        fi_lote_id || null,
        tipo || null,
        fi_usuario_id,
        granjaFinal
      ]
    );

    // ACTUALIZAR FECHA EN EL MÓDULO REAL
    await actualizarFechaBiometria(fi_instalacion_id, fd_fecha);

    res.json({ message: "Biometría registrada", id: result.rows[0].fi_id });

  } catch (err) {
    console.error("❌ POST /biometrias Error:", err);
    res.status(500).json({ error: "Error creando biometría" });
  }
});

/* --------------------------------------------------------
   🔹 PUT – Actualizar biometría
-------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const {
      fd_fecha,
      fn_peso_total_gramos,
      fn_organismos_muestreados,
      fc_observaciones,
      fc_encargado,
      fi_instalacion_id,
      fi_lote_id,
      tipo,
      fi_usuario_id
    } = req.body;

    const pesoProm =
      fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
        ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
        : 0;

    await pool.query(
      `
      UPDATE biometrias SET
        fd_fecha = $1,
        fn_peso_total_gramos = $2,
        fn_organismos_muestreados = $3,
        fn_peso_promedio = $4,
        fc_observaciones = $5,
        fc_encargado = $6,
        fi_instalacion_id = $7,
        fi_lote_id = $8,
        tipo = $9,
        fi_usuario_id = $10,
        fd_fecha_modificacion = CURRENT_TIMESTAMP
      WHERE fi_id = $11
      `,
      [
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        pesoProm,
        fc_observaciones,
        fc_encargado,
        fi_instalacion_id || null,
        fi_lote_id || null,
        tipo,
        fi_usuario_id,
        req.params.id
      ]
    );

    // Actualizar módulo real
    await actualizarFechaBiometria(fi_instalacion_id, fd_fecha);

    res.json({ message: "Biometría actualizada" });

  } catch (err) {
    console.error("❌ PUT /biometrias Error:", err);
    res.status(500).json({ error: "Error actualizando biometría" });
  }
});

/* --------------------------------------------------------
   GET – Autorrellenado por instalación
-------------------------------------------------------- */
router.get("/info/:granja/:instalacion", async (req, res) => {
  try {
    const { granja, instalacion } = req.params;
    const granjaFinal = normalizarGranja(granja);

    if (!granjaFinal)
      return res.status(400).json({ error: "Granja inválida" });

    // 1️⃣ Obtener tipo de instalación
    const inst = await pool.query(
      `SELECT tipo_instalacion FROM instalaciones WHERE fi_instalacion_id = $1`,
      [instalacion]
    );

    if (inst.rowCount === 0)
      return res.json({ tipo: null });

    const tipo = inst.rows[0].tipo_instalacion;
    let tabla = "";
    let campoFecha = "";

    // Detectar tabla correcta
    if (tipo === "Alevinaje") {
      tabla = "piletas";
      campoFecha = "fecha_ultima_biometria";
    }

    if (tipo === "Engorda") {
      tabla = "engorda";
      campoFecha = "fecha_biometria";
    }

    if (tipo === "Reproductores") {
      tabla = "reproductores";
      campoFecha = "fd_fecha_biometria";
    }

    if (!tabla || !campoFecha) return res.json({ tipo: null });

    // 2️⃣ Obtener datos del módulo + lote
    const q = await pool.query(
      `
      SELECT 
        m.fi_lote_id,
        l.no_lote,
        m.cantidad,
        m.talla_gr,
        m.fecha_siembra,
        m.${campoFecha} AS fecha_biometria
      FROM ${tabla} m
      LEFT JOIN lotes l ON m.fi_lote_id = l.fi_lote_id
      WHERE m.fi_instalacion_id = $1
      LIMIT 1
      `,
      [instalacion]
    );

    if (q.rowCount === 0)
      return res.json({ tipo, fi_lote_id: null });

    const row = q.rows[0];

    res.json({
      tipo,
      fi_lote_id: row.fi_lote_id,
      no_lote: row.no_lote,
      cantidad: row.cantidad,
      talla: row.talla_gr,
      fecha_siembra: row.fecha_siembra,
      fecha_biometria: row.fecha_biometria
    });

  } catch (err) {
    console.error("❌ Error en /info biometrías:", err);
    res.status(500).json({ error: "Error obteniendo información automática" });
  }
});

export default router;

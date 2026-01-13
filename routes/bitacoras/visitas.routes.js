import express from "express";
import pool from "../../db.js";
import multer from "multer";
import path from "path";

// Configuración de Multer (almacenamiento de imágenes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // La carpeta donde guardamos las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Asignamos un nombre único a la imagen
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Obtener todos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM visitas ORDER BY fi_id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: "Error obteniendo visitas" });
  }
});

// Crear
router.post("/", upload.single('fc_foto_identificacion'), async (req, res) => {
  try {
    const {
      fd_fecha,
      fc_nombre_completo,
      fc_origen,
      fc_motivo,
      fc_observaciones,
      fd_entrada,
      fd_salida,
      fi_usuario_id,
      ubicacion
    } = req.body;

    const fc_foto_identificacion = req.file ? req.file.path : null; // Ruta de la imagen si fue subida

    await pool.query(
      `
      INSERT INTO visitas
      (fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones, fc_foto_identificacion, fd_entrada, fd_salida, fi_usuario_id, ubicacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        fd_fecha,
        fc_nombre_completo,
        fc_origen,
        fc_motivo,
        fc_observaciones,
        fc_foto_identificacion,
        fd_entrada,
        fd_salida,
        fi_usuario_id || 1,
        ubicacion || "medellin", // Default ubicacion
      ]
    );
    res.json({ message: "Registro creado" });
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ error: "Error creando registro" });
  }
});

// Actualizar
router.put("/:id", upload.single('fc_foto_identificacion'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fd_fecha,
      fc_nombre_completo,
      fc_origen,
      fc_motivo,
      fc_observaciones,
      fd_entrada,
      fd_salida,
      fi_usuario_id,
      ubicacion
    } = req.body;

    const fc_foto_identificacion = req.file ? req.file.path : null; // Ruta de la imagen si fue subida

    await pool.query(
      `
      UPDATE visitas SET
        fd_fecha=$1,
        fc_nombre_completo=$2,
        fc_origen=$3,
        fc_motivo=$4,
        fc_observaciones=$5,
        fc_foto_identificacion=$6,
        fd_entrada=$7,
        fd_salida=$8,
        fi_usuario_id=$9,
        ubicacion=$10
      WHERE fi_id=$11
      `,
      [
        fd_fecha,
        fc_nombre_completo,
        fc_origen,
        fc_motivo,
        fc_observaciones,
        fc_foto_identificacion,
        fd_entrada,
        fd_salida,
        fi_usuario_id,
        ubicacion || "medellin", // Default ubicacion
        id,
      ]
    );

    res.json({ message: "Registro actualizado" });
  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(500).json({ error: "Error actualizando registro" });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM visitas WHERE fi_id=$1`, [req.params.id]);
    res.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: "Error eliminando registro" });
  }
});

// Eliminar todos
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM visitas");
    res.json({ message: "Todos los registros fueron eliminados." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

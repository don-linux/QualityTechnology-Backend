import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ======================================================
   🔹 OBTENER TODOS LOS USUARIOS
   ====================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

/* ======================================================
   🔹 CREAR NUEVO USUARIO (guarda contraseña con hash)
   ====================================================== */
router.post("/", async (req, res) => {
  const { nombre, contraseña, rol_id } = req.body;

  if (!nombre || !contraseña || !rol_id) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await pool.query(
      `INSERT INTO usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
       VALUES ($1, $2, $3)`,
      [nombre, hashedPassword, rol_id]
    );
    res.status(201).json({ mensaje: "Usuario creado exitosamente" });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

/* ======================================================
   🔹 ACTUALIZAR USUARIO
   ====================================================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, contraseña, rol_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await pool.query(
      `UPDATE usuarios
       SET fc_nombre = $1, "fc_contraseña" = $2, fi_rol_id = $3
       WHERE fi_usuario_id = $4`,
      [nombre, hashedPassword, rol_id, id]
    );
    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

/* ======================================================
   🔹 ELIMINAR USUARIO
   ====================================================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE fi_usuario_id = $1", [id]);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

/* ======================================================
   🔹 LOGIN (versión corregida sin empresas)
   ====================================================== */
router.post("/login", async (req, res) => {
  const nombre = req.body.nombre;
  const contraseña = req.body.contraseña || req.body.contrasena;

  if (!nombre || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        u.fi_usuario_id AS usuario_id,
        u.fc_nombre AS nombre,
        u."fc_contraseña" AS contrasena,
        u.fi_rol_id AS rol_id,
        r.fc_nombre AS rol_nombre
      FROM usuarios u
      JOIN roles r ON u.fi_rol_id = r.fi_rol_id
      WHERE u.fc_nombre = $1
      `,
      [nombre]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    // 🔐 Verificar contraseña
    let passwordMatch = false;
    if (usuario.contrasena && usuario.contrasena.trim().startsWith("$2b$")) {
      passwordMatch = await bcrypt.compare(contraseña, usuario.contrasena.trim());
    } else {
      passwordMatch = contraseña.trim() === (usuario.contrasena || "").trim();
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 🪪 Generar token JWT
    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        rol_id: usuario.rol_id,
        rol: usuario.rol_nombre,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET || "clave_secreta_dev",
      { expiresIn: "8h" }
    );

    delete usuario.contrasena;

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        rol: usuario.rol_nombre,
      },
    });
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(500).json({ error: "Error del servidor", detalle: err.message });
  }
});

export default router;

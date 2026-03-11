import jwt from "jsonwebtoken";
import usuarioModel from "../models/usuarioModel.js";
import pool from "./../db.js";

class UsuarioController {
    static async getAll(req, res) {
        try {
            const usuarios = await usuarioModel.getAll();
            res.json(usuarios);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    static async create(req, res) {
        const { nombre, contraseña, rol_id } = req.body;
        if (!nombre || !contraseña || !rol_id) {
            return res.status(400).json({ error: "Faltan datos obligatorios (nombre, contraseña, rol_id)" });
        }
        try {
            await usuarioModel.create({ nombre, contraseña, rol_id });
            res.status(201).json({ mensaje: "Usuario creado exitosamente" });
        } catch (err) {
            console.error("Error al crear usuario:", err);
            res.status(500).json({ error: "Error al crear usuario" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nombre, contraseña, rol_id } = req.body;
        try {
            await usuarioModel.update(id, { nombre, contraseña, rol_id });
            res.json({ mensaje: "Usuario actualizado correctamente" });
        } catch (err) {
            console.error("Error al actualizar usuario:", err);
            res.status(500).json({ error: "Error al actualizar usuario" });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;
        try {
            await usuarioModel.delete(id);
            res.json({ mensaje: "Usuario eliminado correctamente" });
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            res.status(500).json({ error: "Error al eliminar usuario" });
        }
    }

    static async login(req, res) {
        const nombre = req.body.nombre;
        const contraseña = req.body.contraseña || req.body.contrasena;

        if (!nombre || !contraseña) {
            return res.status(400).json({ error: "Faltan datos obligatorios (nombre, contraseña)" });
        }

        try {
            const usuario = await usuarioModel.getByNombre(nombre);
            if (!usuario) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            const passwordMatch = await usuarioModel.verifyPassword(
                contraseña, 
                usuario.contrasena
            );

            if (!passwordMatch) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            // Obtener módulos del rol
            const modulosResult = await pool.query(
                `SELECT m.fi_modulo_id, m.fc_nombre
                FROM seguridad.roles_modulos rm
                JOIN seguridad.modulos m 
                ON m.fi_modulo_id = rm.fi_modulo_id
                WHERE rm.fi_rol_id = $1`,
                [usuario.rol_id]
            );

            const modulos = modulosResult.rows;
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

            res.json({
                mensaje: "Inicio de sesión exitoso",
                token,
                usuario: {
                    id: usuario.usuario_id,
                    nombre: usuario.nombre,
                    rol: usuario.rol_nombre,
                },
                modulos //se manda al frontend
            });

        } catch (err) {
            console.error("Error en login:", err.message);
            res.status(500).json({ error: "Error del servidor", detalle: err.message });
        }
    }
}

export default UsuarioController;

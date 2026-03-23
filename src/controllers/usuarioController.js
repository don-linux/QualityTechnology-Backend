import jwt from "jsonwebtoken";
import usuarioModel from "../models/usuarioModel.js";
import RolesModulosModel from "../models/RolesModulosModel.js";
import RefreshTokenModel from "../models/refreshTokenModel.js";

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
                console.warn(`[LOGIN] Usuario no encontrado: "${nombre}" — IP: ${req.ip}`);
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            const passwordMatch = await usuarioModel.verifyPassword(
                contraseña, 
                usuario.contrasena
            );

            if (!passwordMatch) {
                console.warn(`[LOGIN] Contraseña incorrecta para: "${nombre}" — IP: ${req.ip}`);
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            const modulos = await RolesModulosModel.getModulosByRol(usuario.rol_id);

            const token = jwt.sign(
                {
                    usuario_id: usuario.usuario_id,
                    rol_id: usuario.rol_id,
                    rol: usuario.rol_nombre,
                    nombre: usuario.nombre,
                },
                process.env.JWT_SECRET,
                { expiresIn: "8h" }
            );

            const refreshToken = await RefreshTokenModel.create(usuario.usuario_id);

            res.json({
                mensaje: "Inicio de sesión exitoso",
                token,
                refreshToken,
                usuario: {
                    id: usuario.usuario_id,
                    nombre: usuario.nombre,
                    rol: usuario.rol_nombre,
                },
                modulos,
            });

        } catch (err) {
            console.error("Error en login:", err.message);
            res.status(500).json({ error: "Error del servidor", detalle: err.message });
        }
    }

    static async refresh(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Se requiere el refreshToken." });
        }

        try {
            const tokenData = await RefreshTokenModel.findValid(refreshToken);
            if (!tokenData) {
                return res.status(401).json({ error: "Refresh token inválido o expirado." });
            }

            // Revocar el token usado (rotación)
            await RefreshTokenModel.revoke(refreshToken);

            const modulos = await RolesModulosModel.getModulosByRol(tokenData.rol_id);

            const newAccessToken = jwt.sign(
                {
                    usuario_id: tokenData.fi_usuario_id,
                    rol_id: tokenData.rol_id,
                    rol: tokenData.rol_nombre,
                    nombre: tokenData.nombre,
                },
                process.env.JWT_SECRET,
                { expiresIn: "8h" }
            );

            const newRefreshToken = await RefreshTokenModel.create(tokenData.fi_usuario_id);

            res.json({
                mensaje: "Token renovado exitosamente",
                token: newAccessToken,
                refreshToken: newRefreshToken,
                modulos,
            });
        } catch (err) {
            console.error("Error en refresh:", err.message);
            res.status(500).json({ error: "Error al renovar token." });
        }
    }

    static async logout(req, res) {
        const { refreshToken } = req.body;

        try {
            if (refreshToken) {
                await RefreshTokenModel.revoke(refreshToken);
            }
            res.json({ mensaje: "Sesión cerrada correctamente." });
        } catch (err) {
            console.error("Error en logout:", err.message);
            res.status(500).json({ error: "Error al cerrar sesión." });
        }
    }
}

export default UsuarioController;

import jwt from "jsonwebtoken";
import usuarioModel from "../models/usuarioModel.js";
import RolesModulosModel from "../models/RolesModulosModel.js";
import RefreshTokenModel from "../models/refreshTokenModel.js";
import pool from "../db.js";
import bcrypt from "bcryptjs";

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
        const {
            nombre, contraseña, rol_id,
            fc_nombre_empleado, fc_apellido_paterno, fc_apellido_materno,
            fi_departamento_id, fi_puesto_id, fi_unidad_negocio_id
        } = req.body;

        if (!nombre || !contraseña || !rol_id) {
            return res.status(400).json({ error: "Faltan datos obligatorios (nombre, contraseña, rol_id)" });
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const hashedPassword = await bcrypt.hash(contraseña, 10);
            const userResult = await client.query(
                `INSERT INTO usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
                 VALUES ($1, $2, $3) RETURNING *`,
                [nombre, hashedPassword, rol_id]
            );
            const nuevoUsuario = userResult.rows[0];

            const rolResult = await client.query(
                `SELECT fb_es_root FROM roles WHERE fi_rol_id = $1`,
                [rol_id]
            );
            const esRoot = rolResult.rows[0]?.fb_es_root;

            if (!esRoot) {
                if (!fc_nombre_empleado || !fc_apellido_paterno || !fc_apellido_materno || !fi_departamento_id) {
                    await client.query("ROLLBACK");
                    return res.status(400).json({
                        error: "Para roles no-root se requiere: fc_nombre_empleado, fc_apellido_paterno, fc_apellido_materno, fi_departamento_id"
                    });
                }

                await client.query(
                    `INSERT INTO rrhh.empleados
                        (fi_usuario_id, fc_nombre, fc_apellido_paterno, fc_apellido_materno, fi_departamento_id, fi_puesto_id, fi_unidad_negocio_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        nuevoUsuario.fi_usuario_id,
                        fc_nombre_empleado,
                        fc_apellido_paterno,
                        fc_apellido_materno,
                        fi_departamento_id,
                        fi_puesto_id || null,
                        fi_unidad_negocio_id || null
                    ]
                );
            }

            await client.query("COMMIT");
            res.status(201).json({ mensaje: "Usuario creado exitosamente" });
        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Error al crear usuario:", err);
            res.status(500).json({ error: "Error al crear usuario" });
        } finally {
            client.release();
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

    static async deactivate(req, res) {
        const { id } = req.params;
        try {
            const usuario = await usuarioModel.deactivate(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await RefreshTokenModel.revokeAllByUser(id);
            res.json({ mensaje: "Usuario desactivado correctamente", usuario });
        } catch (err) {
            console.error("Error al desactivar usuario:", err);
            res.status(500).json({ error: "Error al desactivar usuario" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;
        try {
            const usuario = await usuarioModel.activate(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json({ mensaje: "Usuario activado correctamente", usuario });
        } catch (err) {
            console.error("Error al activar usuario:", err);
            res.status(500).json({ error: "Error al activar usuario" });
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

            if (!usuario.fb_activo) {
                console.warn(`[LOGIN] Cuenta deshabilitada: "${nombre}" — IP: ${req.ip}`);
                return res.status(403).json({ error: "Cuenta deshabilitada. Contacte al administrador." });
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
            const tokenData = await RefreshTokenModel.findValidAndRevoke(refreshToken);
            if (!tokenData) {
                return res.status(401).json({ error: "Refresh token inválido o expirado." });
            }

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

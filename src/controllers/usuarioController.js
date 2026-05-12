import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { serializeUsuario, serializeModulo } from "../utils/serializers.js";
import {
  createRefreshToken,
  findValidAndRevoke,
  revokeRefreshToken,
  revokeAllByUser,
} from "../services/refreshTokenService.js";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "8h";

async function getModulosForRol(rolId) {
  const rol = await prisma.rol.findUnique({ where: { id: Number(rolId) } });
  if (!rol) return [];

  if (rol.esRoot) {
    const modulos = await prisma.modulo.findMany({
      where: { esta_activo: true },
      orderBy: { nombre: "asc" },
    });
    return modulos.map(serializeModulo);
  }

  const relaciones = await prisma.rolModulo.findMany({
    where: { rolId: Number(rolId) },
    include: { modulo: true },
    orderBy: { modulo: { nombre: "asc" } },
  });
  return relaciones.map((r) => serializeModulo(r.modulo));
}

class UsuarioController {
  static async getAll(req, res) {
    try {
      const usuarios = await prisma.usuario.findMany({
        orderBy: { nombre: "asc" },
      });
      res.json(usuarios.map(serializeUsuario));
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }

  static async create(req, res) {
    const {
      nombre,
      contraseña,
      contrasena,
      rol_id,
      departamento_id,
      puesto_id,
      unidad_negocio_id,
      nombre_empleado,
      apellido_paterno,
      apellido_materno,
    } = req.body;

    const password = contraseña || contrasena;

    if (!nombre || !password || !rol_id) {
      return res.status(400).json({
        error: "Faltan datos obligatorios (nombre, contraseña, rol_id)",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const rol = await prisma.rol.findUnique({ where: { id: Number(rol_id) } });
      if (!rol) {
        return res.status(400).json({ error: "Rol no encontrado" });
      }

      const nuevoUsuario = await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            nombre,
            password: hashedPassword,
            rolId: Number(rol_id),
          },
        });

        if (!rol.esRoot) {
          if (!nombre_empleado || !apellido_paterno || !departamento_id) {
            throw Object.assign(
              new Error(
                "Para roles no-root se requiere: nombre_empleado, apellido_paterno, departamento_id"
              ),
              { status: 400 }
            );
          }

          // unidad_negocio_id ya no existe en el modelo Empleado del schema actual
          // y se ignora si llega en el body.
          await tx.empleado.create({
            data: {
              usuarioId: usuario.id,
              nombre: nombre_empleado,
              apellidoPaterno: apellido_paterno,
              apellidoMaterno: apellido_materno ?? null,
              departamentoId: Number(departamento_id),
              puestoId: puesto_id ? Number(puesto_id) : null,
            },
          });
        }

        return usuario;
      });

      res.status(201).json({
        mensaje: "Usuario creado exitosamente",
        usuario: serializeUsuario(nuevoUsuario),
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un usuario con ese nombre" });
      }
      console.error("Error al crear usuario:", err);
      res.status(500).json({ error: "Error al crear usuario" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { nombre, contraseña, contrasena, rol_id } = req.body;
    const password = contraseña || contrasena;

    try {
      const data = {};
      if (nombre !== undefined) data.nombre = nombre;
      if (rol_id !== undefined) data.rolId = Number(rol_id);
      if (password) data.password = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const usuario = await prisma.usuario.update({
        where: { id: Number(id) },
        data,
      });

      res.json({
        mensaje: "Usuario actualizado correctamente",
        usuario: serializeUsuario(usuario),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un usuario con ese nombre" });
      }
      console.error("Error al actualizar usuario:", err);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const usuario = await prisma.usuario.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      await revokeAllByUser(id);
      res.json({ mensaje: "Usuario desactivado correctamente", usuario: serializeUsuario(usuario) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      console.error("Error al desactivar usuario:", err);
      res.status(500).json({ error: "Error al desactivar usuario" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const usuario = await prisma.usuario.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({ mensaje: "Usuario activado correctamente", usuario: serializeUsuario(usuario) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      console.error("Error al activar usuario:", err);
      res.status(500).json({ error: "Error al activar usuario" });
    }
  }

  static async login(req, res) {
    const nombre = req.body.nombre;
    const password = req.body.contraseña || req.body.contrasena;

    if (!nombre || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios (nombre, contraseña)" });
    }

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { nombre },
        include: { rol: true },
      });

      if (!usuario) {
        console.warn(`[LOGIN] Usuario no encontrado: "${nombre}" — IP: ${req.ip}`);
        return res.status(401).json({ error: "Credenciales invalidas" });
      }

      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (!passwordMatch) {
        console.warn(`[LOGIN] Contraseña incorrecta para: "${nombre}" — IP: ${req.ip}`);
        return res.status(401).json({ error: "Credenciales invalidas" });
      }

      if (!usuario.esta_activo) {
        console.warn(`[LOGIN] Cuenta deshabilitada: "${nombre}" — IP: ${req.ip}`);
        return res.status(403).json({ error: "Cuenta deshabilitada. Contacte al administrador." });
      }

      const modulos = await getModulosForRol(usuario.rolId);

      const token = jwt.sign(
        {
          usuario_id: usuario.id,
          rol_id: usuario.rolId,
          rol: usuario.rol.nombre,
          nombre: usuario.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = await createRefreshToken(usuario.id);

      res.json({
        mensaje: "Inicio de sesion exitoso",
        token,
        refreshToken,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          rol: usuario.rol.nombre,
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
      const tokenData = await findValidAndRevoke(refreshToken);
      if (!tokenData) {
        return res.status(401).json({ error: "Refresh token invalido o expirado." });
      }

      const modulos = await getModulosForRol(tokenData.rolId);

      const newAccessToken = jwt.sign(
        {
          usuario_id: tokenData.id,
          rol_id: tokenData.rolId,
          rol: tokenData.rolNombre,
          nombre: tokenData.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const newRefreshToken = await createRefreshToken(tokenData.id);

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
      if (refreshToken) await revokeRefreshToken(refreshToken);
      res.json({ mensaje: "Sesion cerrada correctamente." });
    } catch (err) {
      console.error("Error en logout:", err.message);
      res.status(500).json({ error: "Error al cerrar sesion." });
    }
  }
}

export default UsuarioController;

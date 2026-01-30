import bcrypt from "bcrypt";
import { usuariosModel } from "../models/usuarios.model.js";
import { authService } from "../services/auth.service.js";

/**
 * Controlador de Usuarios
 * Maneja las peticiones HTTP relacionadas con usuarios
 */
export const usuariosController = {
  /**
   * Obtener todos los usuarios
   */
  getAll: async (req, res, next) => {
    try {
      const usuarios = await usuariosModel.findAll();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener usuario por ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await usuariosModel.findById(id);

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo usuario
   */
  create: async (req, res, next) => {
    try {
      const { nombre, contraseña, rol_id } = req.body;

      if (!nombre || !contraseña || !rol_id) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const usuario = await usuariosModel.create(
        nombre,
        hashedPassword,
        rol_id
      );

      res.status(201).json({
        mensaje: "Usuario creado exitosamente",
        usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar usuario
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre, contraseña, rol_id } = req.body;

      if (!nombre || !contraseña || !rol_id) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10);
      const usuario = await usuariosModel.update(
        id,
        nombre,
        hashedPassword,
        rol_id
      );

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        mensaje: "Usuario actualizado correctamente",
        usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar usuario
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await usuariosModel.delete(id);
      res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login de usuario
   */
  login: async (req, res, next) => {
    try {
      const nombre = req.body.nombre;
      const contraseña = req.body.contraseña || req.body.contrasena;

      if (!nombre || !contraseña) {
        return res
          .status(400)
          .json({ error: "Faltan datos obligatorios (nombre y contraseña)" });
      }

      const result = await authService.login(nombre, contraseña);

      res.json({
        mensaje: "Inicio de sesión exitoso",
        token: result.token,
        usuario: result.usuario,
      });
    } catch (error) {
      if (error.message === "Credenciales inválidas") {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  },
};

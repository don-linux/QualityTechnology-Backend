import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Servicio de Autenticación
 * Maneja la lógica de negocio relacionada con autenticación
 */
export const authService = {
  /**
   * Autenticar usuario y generar token JWT
   */
  login: async (nombre, contraseña) => {
    // Buscar usuario
    const usuario = await usuariosModel.findByNombre(nombre);

    if (!usuario) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    let passwordMatch = false;
    if (usuario.contrasena && usuario.contrasena.trim().startsWith("$2b$")) {
      passwordMatch = await bcrypt.compare(
        contraseña,
        usuario.contrasena.trim()
      );
    } else {
      // Compatibilidad con contraseñas en texto plano (legacy)
      passwordMatch =
        contraseña.trim() === (usuario.contrasena || "").trim();
    }

    if (!passwordMatch) {
      throw new Error("Credenciales inválidas");
    }

    // Generar token JWT
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

    // Preparar respuesta (sin contraseña)
    const usuarioResponse = {
      id: usuario.usuario_id,
      nombre: usuario.nombre,
      rol: usuario.rol_nombre,
    };

    return {
      token,
      usuario: usuarioResponse,
    };
  },
};

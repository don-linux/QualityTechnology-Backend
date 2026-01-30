import { alimentosModel } from "../models/alimentos.model.js";
import { alimentosService } from "../services/alimentos.service.js";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Controlador de Alimentos
 */
export const alimentosController = {
  /**
   * Obtener registros (por usuario o todos si es administrador)
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;

      const rol = await usuariosModel.getRolById(usuario_id);

      let registros;
      if (rol?.toLowerCase() === "administrador") {
        registros = await alimentosModel.findAll();
      } else {
        registros = await alimentosModel.findByUsuarioId(usuario_id);
      }

      res.json(registros);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo registro
   */
  create: async (req, res, next) => {
    try {
      const {
        fi_reproductor_id,
        fi_pileta_id,
        fi_engorda_id,
        fi_usuario_id,
      } = req.body;

      // Validar que se seleccione al menos uno
      if (!fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
        return res
          .status(400)
          .json({ error: "Debe seleccionar una pileta, reproductor o engorda." });
      }

      // Calcular parámetros usando el servicio
      const parametros = await alimentosService.calcularParametros(
        fi_pileta_id,
        fi_reproductor_id,
        fi_engorda_id
      );

      // Crear registro con los parámetros calculados
      const data = {
        fi_reproductor_id,
        fi_pileta_id,
        fi_engorda_id,
        ...parametros,
        fi_usuario_id,
      };

      const registro = await alimentosModel.create(data);
      res.status(201).json(registro);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar registro
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await alimentosModel.delete(id);
      res.json({ message: "Registro eliminado correctamente ✅" });
    } catch (error) {
      next(error);
    }
  },
};

import reproductorModel from "../models/reproductorModel.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const REGEX_ENTERO = /^\d+$/;
const REGEX_DECIMAL = /^\d+(\.\d+)?$/;

function validarCamposReproductor({ fn_machos, fn_hembras, fn_talla, fc_observacion }) {
  if (fn_machos !== undefined && fn_machos !== null && fn_machos !== "") {
    const valor = String(fn_machos);
    if (valor.length > MAX_NUMERICO) {
      return `La cantidad de machos no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_ENTERO.test(valor)) {
      return "La cantidad de machos debe ser un número entero.";
    }
  }

  if (fn_hembras !== undefined && fn_hembras !== null && fn_hembras !== "") {
    const valor = String(fn_hembras);
    if (valor.length > MAX_NUMERICO) {
      return `La cantidad de hembras no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_ENTERO.test(valor)) {
      return "La cantidad de hembras debe ser un número entero.";
    }
  }

  if (fn_talla !== undefined && fn_talla !== null && fn_talla !== "") {
    const valor = String(fn_talla);
    if (valor.length > MAX_NUMERICO) {
      return `La talla no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_DECIMAL.test(valor)) {
      return "La talla debe ser un número (puede incluir decimales).";
    }
  }

  if (fc_observacion && fc_observacion.length > MAX_OBSERVACION) {
    return `La observación no puede superar los ${MAX_OBSERVACION} caracteres.`;
  }

  return null;
}

class ReproductorController {
  static async getMovimientos(req, res) {
    try {
      const movimientos = await reproductorModel.getMovimientos(req.params.granja);
      res.json(movimientos);
    } catch (err) {
      console.error("Error trazabilidad:", err);
      res.status(500).json({ error: "Error al obtener trazabilidad" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const reproductores = await reproductorModel.getByGranja(req.params.granja);
      res.json(reproductores);
    } catch (err) {
      console.error("Error reproductores:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async getInstalaciones(req, res) {
    try {
      const instalaciones = await reproductorModel.getInstalaciones(req.params.granja);
      res.json(instalaciones);
    } catch (err) {
      console.error("Error instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones" });
    }
  }

  static async create(req, res) {
    try {
      const { origen_texto } = req.body;
      if (!origen_texto || origen_texto.trim() === "") {
        return res.status(400).json({
          error: "Debe especificar el origen del reproductor",
        });
      }

      const errorValidacion = validarCamposReproductor(req.body);
      if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
      }

      await reproductorModel.create(req.body);
      res.json({
        success: true,
        mensaje: "Reproductor y trazabilidad registrados correctamente",
      });
    } catch (err) {
      console.error("Error registrar reproductor:", err);
      res.status(500).json({ error: "Error al registrar reproductor" });
    }
  }

  static async update(req, res) {
    try {
      const errorValidacion = validarCamposReproductor(req.body);
      if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
      }

      await reproductorModel.update(req.params.id, req.body);
      res.json({
        success: true,
        mensaje: "Reproductor actualizado y trazabilidad registrada",
      });
    } catch (err) {
      console.error("Error actualizar reproductor:", err);
      res.status(500).json({ error: "Error al actualizar reproductor" });
    }
  }

  static async delete(req, res) {
    try {
      await reproductorModel.delete(req.params.id);
      res.json({ success: true, mensaje: "Reproductor eliminado" });
    } catch (err) {
      console.error("Error eliminar:", err);
      res.status(500).json({ error: "Error al eliminar reproductor" });
    }
  }
}

export default ReproductorController;

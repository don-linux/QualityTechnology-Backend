import listaEsperaModel from "../models/listaEsperaModel.js";

class ListaEsperaController {
  static async getAll(req, res) {
    try {
      const lista = await listaEsperaModel.getAll();
      res.json(lista);
    } catch (err) {
      console.error("Error al obtener lista de espera:", err);
      res.status(500).json({ error: "Error al obtener lista de espera" });
    }
  }

  static async create(req, res) {
    try {
      const registro = await listaEsperaModel.create(req.body);
      res.json(registro);
    } catch (err) {
      console.error("Error al registrar lista de espera:", err);
      res.status(500).json({ error: "Error al registrar en lista de espera" });
    }
  }

  static async update(req, res) {
    try {
      await listaEsperaModel.update(req.params.id, req.body);
      res.sendStatus(200);
    } catch (err) {
      console.error("Error en PUT:", err);
      res.status(500).json({ error: "Error al actualizar" });
    }
  }

  static async delete(req, res) {
    try {
      await listaEsperaModel.delete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error en DELETE:", err);
      res.status(500).json({ error: "Error al eliminar" });
    }
  }

  static async convertir(req, res) {
    try {
      const usuarioId = req.headers["usuario_id"] || 1;
      const venta = await listaEsperaModel.convertirAVenta(req.params.id, usuarioId);

      if (!venta) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      res.json({
        mensaje: "Convertido en venta real correctamente",
        venta_id: venta.fi_venta_id,
      });
    } catch (err) {
      console.error("Error al convertir:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ListaEsperaController;

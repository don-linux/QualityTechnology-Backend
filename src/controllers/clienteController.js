import clienteModel from "../models/clienteModel.js";

class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await clienteModel.getAll();
      res.json(clientes);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  static async create(req, res) {
    try {
      const { fi_usuario_id, ...payload } = req.body;
      const cliente = await clienteModel.create({ ...payload, fi_usuario_id: req.user.usuario_id });
      res.json(cliente);
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      res.status(500).json({ error: "Error al registrar cliente" });
    }
  }

  static async update(req, res) {
    try {
      const cliente = await clienteModel.update(req.params.id, req.body);
      res.json(cliente);
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      res.status(500).json({ error: "Error al actualizar cliente" });
    }
  }

  static async delete(req, res) {
    try {
      await clienteModel.delete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      res.status(500).json({ error: "Error al eliminar cliente" });
    }
  }
}

export default ClienteController;

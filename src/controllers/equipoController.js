import equipoModel from "../models/equipoModel.js";

class EquipoController {
  static async getEmpleados(req, res) {
    try {
      const empleados = await equipoModel.getEmpleadosActivos();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getByUsuario(req, res) {
    try {
      const equipos = await equipoModel.getByUsuario(req.params.usuario_id);
      res.json(equipos);
    } catch (err) {
      console.error("Error al obtener equipos:", err);
      res.status(500).json({ error: "Error al obtener equipos" });
    }
  }

  static async create(req, res) {
    try {
      const { fi_usuario_id, ...payload } = req.body;
      const equipo = await equipoModel.create({ ...payload, fi_usuario_id: req.user.usuario_id });
      res.json(equipo);
    } catch (err) {
      console.error("Error al registrar equipo:", err);
      res.status(500).json({ error: "Error al registrar equipo" });
    }
  }

  static async update(req, res) {
    try {
      const equipo = await equipoModel.update(req.params.id, req.body);
      res.json(equipo);
    } catch (err) {
      console.error("Error al actualizar equipo:", err);
      res.status(500).json({ error: "Error al actualizar equipo" });
    }
  }

  static async delete(req, res) {
    try {
      await equipoModel.delete(req.params.id);
      res.json({ mensaje: "Equipo eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar equipo:", err);
      res.status(500).json({ error: "Error al eliminar equipo" });
    }
  }

  /* =========================================================
     MANTENIMIENTOS
  ========================================================= */
  static async getMantenimientos(req, res) {
    try {
      const mantenimientos = await equipoModel.getMantenimientos(req.params.equipo_id);
      res.json(mantenimientos);
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
  }

  static async createMantenimiento(req, res) {
    try {
      const mantenimiento = await equipoModel.createMantenimiento(
        req.params.equipo_id, req.body
      );
      res.json(mantenimiento);
    } catch (err) {
      console.error("Error al registrar mantenimiento:", err);
      res.status(500).json({ error: "Error al registrar mantenimiento" });
    }
  }

  static async updateMantenimiento(req, res) {
    try {
      const mantenimiento = await equipoModel.updateMantenimiento(
        req.params.mantenimiento_id, req.body
      );
      res.json(mantenimiento);
    } catch (err) {
      console.error("Error al actualizar mantenimiento:", err);
      res.status(500).json({ error: "Error al actualizar mantenimiento" });
    }
  }

  static async deleteMantenimiento(req, res) {
    try {
      await equipoModel.deleteMantenimiento(req.params.mantenimiento_id);
      res.json({ mensaje: "Mantenimiento eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar mantenimiento:", err);
      res.status(500).json({ error: "Error al eliminar mantenimiento" });
    }
  }
}

export default EquipoController;

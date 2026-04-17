import DepartamentoModel from "../models/departamentoModel.js";

class DepartamentoController {

    static async getAll(req, res) {
        try {
            const departamentos = await DepartamentoModel.getAll();
            res.json(departamentos);
        } catch (err) {
            console.error("Error al obtener departamentos:", err);
            res.status(500).json({ error: "Error al obtener departamentos" });
        }
    }

    static async getActivos(req, res) {
        try {
            const departamentos = await DepartamentoModel.getActivos();
            res.json(departamentos);
        } catch (err) {
            console.error("Error al obtener departamentos activos:", err);
            res.status(500).json({ error: "Error al obtener departamentos" });
        }
    }

    static async create(req, res) {
        const { fc_nombre } = req.body;

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        try {
            const departamento = await DepartamentoModel.create({ fc_nombre });
            res.status(201).json({ mensaje: "Departamento creado correctamente", departamento });
        } catch (err) {
            console.error("Error al crear departamento:", err);
            res.status(500).json({ error: "Error al crear departamento" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_nombre } = req.body;

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        try {
            const departamento = await DepartamentoModel.update(id, { fc_nombre });
            if (!departamento) {
                return res.status(404).json({ error: "Departamento no encontrado" });
            }
            res.json({ mensaje: "Departamento actualizado correctamente", departamento });
        } catch (err) {
            console.error("Error al actualizar departamento:", err);
            res.status(500).json({ error: "Error al actualizar departamento" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;

        try {
            const departamento = await DepartamentoModel.activate(id);
            if (!departamento) {
                return res.status(404).json({ error: "Departamento no encontrado" });
            }
            res.json({ mensaje: "Departamento activado correctamente", departamento });
        } catch (err) {
            console.error("Error al activar departamento:", err);
            res.status(500).json({ error: "Error al activar departamento" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;

        try {
            const departamento = await DepartamentoModel.deactivate(id);
            if (!departamento) {
                return res.status(404).json({ error: "Departamento no encontrado" });
            }
            res.json({ mensaje: "Departamento desactivado correctamente", departamento });
        } catch (err) {
            console.error("Error al desactivar departamento:", err);
            res.status(500).json({ error: "Error al desactivar departamento" });
        }
    }
}

export default DepartamentoController;
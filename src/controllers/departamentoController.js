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

            res.status(201).json({
                mensaje: "Departamento creado correctamente",
                departamento
            });
        } catch (err) {
            console.error("Error al crear departamento:", err);
            res.status(500).json({ error: "Error al crear departamento" });
        }
    }
}

export default DepartamentoController;
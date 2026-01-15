import { insumosModel } from "../../models/bitacoras/insumos.model.js";

export const insumosController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await insumosModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await insumosModel.findById(id);
            if (!registro) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }
            res.json(registro);
        } catch (error) {
            next(error);
        }
    },

    create: async (req, res, next) => {
        try {
            const nuevoRegistro = await insumosModel.create(req.body);
            res.status(201).json({
                message: "Registro añadido exitosamente",
                data: nuevoRegistro,
            });
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registroActualizado = await insumosModel.update(id, req.body);
            if (!registroActualizado) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }
            res.json({
                message: "Registro actualizado exitosamente",
                data: registroActualizado,
            });
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await insumosModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await insumosModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

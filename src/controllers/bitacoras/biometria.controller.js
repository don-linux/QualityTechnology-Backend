import { biometriaModel } from "../../models/bitacoras/biometria.model.js";

export const biometriaController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await biometriaModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await biometriaModel.findById(id);
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
            const nuevoRegistro = await biometriaModel.create(req.body);
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
            const registroActualizado = await biometriaModel.update(id, req.body);
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
            await biometriaModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await biometriaModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

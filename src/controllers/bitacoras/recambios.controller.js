import { recambiosModel } from "../../models/bitacoras/recambios.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const recambiosController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await recambiosModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await recambiosModel.findById(id);
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
            const data = req.body;

            // Procesar datos numéricos
            const processedData = {
                ...data,
                fn_num_instalacion: parseNum(data.fn_num_instalacion),
                fi_usuario_id: parseNum(data.fi_usuario_id) || 1, // Default to 1 if not provided, mimicking legacy behavior
            };

            const nuevoRegistro = await recambiosModel.create(processedData);
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
            const data = req.body;

            // Procesar datos numéricos
            const processedData = {
                ...data,
                fn_num_instalacion: parseNum(data.fn_num_instalacion),
            };

            const registroActualizado = await recambiosModel.update(id, processedData);
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
            await recambiosModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await recambiosModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

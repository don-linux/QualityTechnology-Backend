import { plagasModel } from "../../models/bitacoras/plagas.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const plagasController = {
    getAll: async (req, res, next) => {
        try {
            const { ubicacion } = req.query;
            const registros = await plagasModel.findAll(ubicacion);
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await plagasModel.findById(id);
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
                fn_num_trampa: parseNum(data.fn_num_trampa),
                fi_usuario_id: parseNum(data.fi_usuario_id) || 1,
            };

            const nuevoRegistro = await plagasModel.create(processedData);
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
                fn_num_trampa: parseNum(data.fn_num_trampa),
            };

            const registroActualizado = await plagasModel.update(id, processedData);
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
            await plagasModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            const { ubicacion } = req.query;
            await plagasModel.deleteAll(ubicacion);
            if (ubicacion) {
                res.json({ message: `Todos los registros de ${ubicacion} eliminados.` });
            } else {
                res.json({ message: "Todos los registros eliminados (todas las ubicaciones)." });
            }
        } catch (error) {
            next(error);
        }
    },
};

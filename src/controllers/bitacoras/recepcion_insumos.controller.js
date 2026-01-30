import { recepcionInsumosModel } from "../../models/bitacoras/recepcion_insumos.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const recepcionInsumosController = {
    getAll: async (req, res, next) => {
        try {
            const { ubicacion } = req.query;
            const registros = await recepcionInsumosModel.findAll(ubicacion);
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await recepcionInsumosModel.findById(id);
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
                fn_cantidad: parseNum(data.fn_cantidad),
                fi_usuario_id: parseNum(data.fi_usuario_id) || 1,
            };

            const nuevoRegistro = await recepcionInsumosModel.create(processedData);
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
                fn_cantidad: parseNum(data.fn_cantidad),
            };

            const registroActualizado = await recepcionInsumosModel.update(
                id,
                processedData
            );
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
            await recepcionInsumosModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            const { ubicacion } = req.query;
            await recepcionInsumosModel.deleteAll(ubicacion);
            if (ubicacion) {
                res.json({
                    message: `Todos los registros de ${ubicacion} eliminados.`,
                });
            } else {
                res.json({
                    message: "Todos los registros eliminados (todas las ubicaciones).",
                });
            }
        } catch (error) {
            next(error);
        }
    },
};

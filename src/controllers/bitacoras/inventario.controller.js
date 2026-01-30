import { inventarioModel } from "../../models/bitacoras/inventario.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const inventarioController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await inventarioModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await inventarioModel.findById(id);
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
                fn_cantidad: parseNum(data.fn_cantidad),
                fn_talla: parseNum(data.fn_talla),
                fi_usuario_id: parseNum(data.fi_usuario_id),
            };

            const nuevoRegistro = await inventarioModel.create(processedData);
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
                fn_cantidad: parseNum(data.fn_cantidad),
                fn_talla: parseNum(data.fn_talla),
            };

            const registroActualizado = await inventarioModel.update(id, processedData);
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
            await inventarioModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await inventarioModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

import { medicamentosModel } from "../../models/bitacoras/medicamentos.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const medicamentosController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await medicamentosModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await medicamentosModel.findById(id);
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

            // Validaciones obligatorias
            if (!data.fd_fecha_hora) {
                return res.status(400).json({ error: "La fecha (fd_fecha_hora) es obligatoria" });
            }
            if (!data.fn_num_estanque) {
                return res.status(400).json({ error: "El número de estanque es obligatorio" });
            }

            // Procesar datos numéricos
            const processedData = {
                ...data,
                fn_num_estanque: parseNum(data.fn_num_estanque),
                fi_usuario_id: parseNum(data.fi_usuario_id),
            };

            const nuevoRegistro = await medicamentosModel.create(processedData);
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
                fn_num_estanque: parseNum(data.fn_num_estanque),
            };

            const registroActualizado = await medicamentosModel.update(id, processedData);
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
            await medicamentosModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await medicamentosModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

import { parametrosModel } from "../../models/bitacoras/parametros.model.js";

// Helper para convertir a número si es necesario (manteniendo lógica original)
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const parametrosController = {
    getAll: async (req, res, next) => {
        try {
            const registros = await parametrosModel.findAll();
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await parametrosModel.findById(id);
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

            // Validación básica (similar a la original)
            if (!data.fd_fecha) {
                return res.status(400).json({ error: "La fecha (fd_fecha) es obligatoria" });
            }
            if (!data.fn_num_estanque) {
                return res.status(400).json({ error: "El número de estanque es obligatorio" });
            }

            // Procesar datos numéricos
            const processedData = {
                ...data,
                fn_num_estanque: parseNum(data.fn_num_estanque),
                fn_oxigeno: parseNum(data.fn_oxigeno),
                fn_temperatura: parseNum(data.fn_temperatura),
                fn_ph: parseNum(data.fn_ph),
                fn_amonio: parseNum(data.fn_amonio),
                fn_nitritos: parseNum(data.fn_nitritos),
                fn_nitratos: parseNum(data.fn_nitratos),
                fi_usuario_id: parseNum(data.fi_usuario_id),
            };

            const nuevoRegistro = await parametrosModel.create(processedData);
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
                fn_oxigeno: parseNum(data.fn_oxigeno),
                fn_temperatura: parseNum(data.fn_temperatura),
                fn_ph: parseNum(data.fn_ph),
                fn_amonio: parseNum(data.fn_amonio),
                fn_nitritos: parseNum(data.fn_nitritos),
                fn_nitratos: parseNum(data.fn_nitratos),
            };

            const registroActualizado = await parametrosModel.update(id, processedData);
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
            await parametrosModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await parametrosModel.deleteAll();
            res.json({ message: "Todos los registros han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

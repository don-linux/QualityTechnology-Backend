import { visitasModel } from "../../models/bitacoras/visitas.model.js";

// Helper para convertir a número si es necesario
const parseNum = (v) => (v === "" || v == null ? null : Number(v));

export const visitasController = {
    getAll: async (req, res, next) => {
        try {
            // El endpoint original no soportaba filtrado por ubicación, pero lo agregamos por consistencia
            const { ubicacion } = req.query;
            const registros = await visitasModel.findAll(ubicacion);
            res.json(registros);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const registro = await visitasModel.findById(id);
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
            // req.body contiene los campos de texto
            // req.file contiene la imagen si se subió
            const data = req.body;
            const file = req.file;

            const processedData = {
                ...data,
                fi_usuario_id: parseNum(data.fi_usuario_id) || 1,
                // Si hay archivo, guardar la ruta. Si no, usar null.
                fc_foto_identificacion: file ? file.path : null,
            };

            const nuevoRegistro = await visitasModel.create(processedData);
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
            const file = req.file;

            const processedData = {
                ...data,
                fi_usuario_id: parseNum(data.fi_usuario_id),
            };

            // Si se subió una nueva imagen, actualizar el campo.
            // Si no, podríamos mantener el anterior (depende de la lógica de negocio).
            // Aquí, si file existe, lo actualizamos.
            if (file) {
                processedData.fc_foto_identificacion = file.path;
            }

            const registroActualizado = await visitasModel.update(id, processedData);
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
            await visitasModel.delete(id);
            res.json({ message: "Registro eliminado exitosamente" });
        } catch (error) {
            next(error);
        }
    },

    deleteAll: async (req, res, next) => {
        try {
            await visitasModel.deleteAll();
            res.json({ message: "Todos los registros de visitas han sido eliminados" });
        } catch (error) {
            next(error);
        }
    },
};

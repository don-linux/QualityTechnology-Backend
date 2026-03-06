import EmpleadoModel from "../models/empleadoModel.js";

class EmpleadoController {

    // Obtener todos
    static async getAll(req, res) {
        try {
            const empleados = await EmpleadoModel.getAll();
            res.json(empleados);
        } catch (err) {
            console.error("Error al obtener empleados:", err);
            res.status(500).json({ error: "Error al obtener empleados" });
        }
    }

    // Obtener por ID
    static async getById(req, res) {
        const { id } = req.params;

        try {
            const empleado = await EmpleadoModel.getById(id);

            if (!empleado) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            res.json(empleado);
        } catch (err) {
            console.error("Error al obtener empleado:", err);
            res.status(500).json({ error: "Error al obtener empleado" });
        }
    }

    // Crear empleado
    static async create(req, res) {
        const {
            fi_usuario_id,
            fi_departamento_id,
            fi_estado_id,
            fc_ciudad,
            fc_nombre,
            fc_apellido_paterno,
            fc_apellido_materno,
            fd_fecha_nacimiento,
            fc_calle,
            fc_codigo_postal,
            fc_referencias,
            ft_comentarios_adicionales
        } = req.body;

        // Validación básica
        if (
            !fi_departamento_id ||
            !fi_estado_id ||
            !fc_ciudad ||
            !fc_nombre ||
            !fc_apellido_paterno ||
            !fc_apellido_materno ||
            !fd_fecha_nacimiento ||
            !fc_calle ||
            !fc_codigo_postal
        ) {
            return res.status(400).json({
                error: "Faltan datos obligatorios para crear el empleado"
            });
        }

        try {
            const nuevoEmpleado = await EmpleadoModel.create(req.body);

            res.status(201).json({
                mensaje: "Empleado creado exitosamente",
                empleado: nuevoEmpleado
            });

        } catch (err) {
            console.error("Error al crear empleado:", err);
            res.status(500).json({ error: "Error al crear empleado" });
        }
    }

    // Actualizar empleado
    static async update(req, res) {
        const { id } = req.params;

        try {
            const empleadoExistente = await EmpleadoModel.getById(id);

            if (!empleadoExistente) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            const empleadoActualizado = await EmpleadoModel.update(id, req.body);

            res.json({
                mensaje: "Empleado actualizado correctamente",
                empleado: empleadoActualizado
            });

        } catch (err) {
            console.error("Error al actualizar empleado:", err);
            res.status(500).json({ error: "Error al actualizar empleado" });
        }
    }

    // Eliminar físico
    static async delete(req, res) {
        const { id } = req.params;

        try {
            const empleadoExistente = await EmpleadoModel.getById(id);

            if (!empleadoExistente) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            await EmpleadoModel.delete(id);

            res.json({ mensaje: "Empleado eliminado correctamente" });

        } catch (err) {
            console.error("Error al eliminar empleado:", err);
            res.status(500).json({ error: "Error al eliminar empleado" });
        }
    }

    // Baja lógica
    static async deactivate(req, res) {
        const { id } = req.params;

        try {
            const empleadoExistente = await EmpleadoModel.getById(id);

            if (!empleadoExistente) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            const empleado = await EmpleadoModel.deactivate(id);

            res.json({
                mensaje: "Empleado dado de baja correctamente",
                empleado
            });

        } catch (err) {
            console.error("Error al dar de baja empleado:", err);
            res.status(500).json({ error: "Error al dar de baja empleado" });
        }
    }
}

export default EmpleadoController;
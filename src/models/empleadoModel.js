import pool from "../db.js";

class EmpleadoModel {

    // Obtener todos los empleados
    static async getAll() {
        const result = await pool.query(`
            SELECT 
                e.fi_empleado_id,
                e.fi_usuario_id,
                e.fc_nombre,
                e.fc_apellido_paterno,
                e.fc_apellido_materno,
                e.fc_ciudad,
                e.fd_fecha_nacimiento,
                e.fc_calle,
                e.fc_codigo_postal,
                e.fd_fecha_alta,
                e.fb_activo,
                d.fc_nombre AS departamento,
                es.fc_nombre AS estado
            FROM rrhh.empleados e
            JOIN rrhh.departamentos d 
                ON e.fi_departamento_id = d.fi_departamento_id
            JOIN catalogos.estados es 
                ON e.fi_estado_id = es.fi_estado_id
            ORDER BY e.fi_empleado_id;
        `);

        return result.rows;
    }

    // Obtener por ID
    static async getById(id) {
        const result = await pool.query(`
            SELECT * 
            FROM rrhh.empleados
            WHERE fi_empleado_id = $1
        `, [id]);

        return result.rows[0];
    }

    // Crear empleado
    static async create(data) {
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
        } = data;

        const result = await pool.query(`
            INSERT INTO rrhh.empleados (
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
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *;
        `, [
            fi_usuario_id || null,
            fi_departamento_id,
            fi_estado_id,
            fc_ciudad,
            fc_nombre,
            fc_apellido_paterno,
            fc_apellido_materno,
            fd_fecha_nacimiento,
            fc_calle,
            fc_codigo_postal,
            fc_referencias || null,
            ft_comentarios_adicionales || null
        ]);

        return result.rows[0];
    }

    // Actualizar empleado
    static async update(id, data) {
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
            ft_comentarios_adicionales,
            fb_activo
        } = data;

        const result = await pool.query(`
            UPDATE rrhh.empleados
            SET
                fi_usuario_id = $1,
                fi_departamento_id = $2,
                fi_estado_id = $3,
                fc_ciudad = $4,
                fc_nombre = $5,
                fc_apellido_paterno = $6,
                fc_apellido_materno = $7,
                fd_fecha_nacimiento = $8,
                fc_calle = $9,
                fc_codigo_postal = $10,
                fc_referencias = $11,
                ft_comentarios_adicionales = $12,
                fb_activo = $13
            WHERE fi_empleado_id = $14
            RETURNING *;
        `, [
            fi_usuario_id || null,
            fi_departamento_id,
            fi_estado_id,
            fc_ciudad,
            fc_nombre,
            fc_apellido_paterno,
            fc_apellido_materno,
            fd_fecha_nacimiento,
            fc_calle,
            fc_codigo_postal,
            fc_referencias || null,
            ft_comentarios_adicionales || null,
            fb_activo,
            id
        ]);

        return result.rows[0];
    }

    // Eliminar (físico)
    static async delete(id) {
        await pool.query(`
            DELETE FROM rrhh.empleados
            WHERE fi_empleado_id = $1
        `, [id]);

        return true;
    }

    // Baja lógica (más profesional)
    static async deactivate(id) {
        const result = await pool.query(`
            UPDATE rrhh.empleados
            SET fb_activo = false
            WHERE fi_empleado_id = $1
            RETURNING *;
        `, [id]);

        return result.rows[0];
    }
}

export default EmpleadoModel;
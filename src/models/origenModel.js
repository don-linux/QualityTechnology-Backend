import pool from "../db.js";

class OrigenModel {
    static async getOrigen(granja) {
        try {
            const result = await pool.query(
                `
                SELECT 
                    i.fi_instalacion_id,
                    i.nombre_instalacion,
                    l.fi_lote_id,
                    l.no_lote,
                    l.alevines_inicial
                FROM lotes l
                INNER JOIN instalaciones i
                    ON l.fi_instalacion_id = i.fi_instalacion_id
                WHERE LOWER(i.fc_granja) = LOWER($1)
                ORDER BY i.nombre_instalacion ASC
                `,
                [granja]
            );

            return result.rows;

        } catch (err) {
            console.error("Error en OrigenModel.getOrigen:", err);
            throw new Error("Error obteniendo piletas disponibles como origen");
        }
    }

    static async getDestino(granja) {
        try {
            const result = await pool.query(
                `
                SELECT fi_instalacion_id, nombre_instalacion
                FROM instalaciones
                WHERE LOWER(fc_granja) = LOWER($1)
                AND LOWER(estado) = 'vacia'
                ORDER BY nombre_instalacion ASC
                `,
                [granja]
            );

            return result.rows;
        } catch (err) {
            console.error("Error en OrigenModel.getDestino:", err);
            throw new Error("Error obteniendo instalaciones disponibles para destino");
        }
    }
}

export default OrigenModel;

import pool from "../db.js";

class OrigenModel {

    static normalizarGranja(granja) {
        if (!granja) return "Granja Acuícola Medellin";
        const g = granja.toLowerCase();
        if (g.includes("med")) return "Granja Acuícola Medellin";
        if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    static async getOrigen(granja) {
        try {
            const granjaFinal = this.normalizarGranja(granja);

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
                    ON l.fc_instalacion_id::text = i.fi_instalacion_id::text
                WHERE LOWER(i.fc_granja) = LOWER($1)
                AND l.alevines_inicial > 0
                ORDER BY i.nombre_instalacion ASC
                `,
                [granjaFinal]
            );

            return result.rows;

        } catch (err) {
            console.error("❌ Error en OrigenModel.getOrigen:", err);
            throw new Error("Error obteniendo piletas disponibles como origen");
        }
    }

    static async getDestino(granja) {
        try {
            const granjaFinal = this.normalizarGranja(granja);

            const result = await pool.query(
                `
                SELECT fi_instalacion_id, nombre_instalacion
                FROM instalaciones
                WHERE LOWER(fc_granja) = LOWER($1)
                AND LOWER(estado) = 'vacia'
                ORDER BY nombre_instalacion ASC
                `,
                [granjaFinal]
            );

            return result.rows;
        } catch (err) {
            console.error("❌ Error en OrigenModel.getDestino:", err);
            throw new Error("Error obteniendo instalaciones disponibles para destino");
        }
    }
}

export default OrigenModel;
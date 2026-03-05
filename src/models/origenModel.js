import pool from "../db.js";

class OrigenModel {

    static normalizarGranja(granja) {
        if (!granja) return "Granja Acuícola Medellin";
        const g = granja.toLowerCase();
        if (g.includes("med")) return "Granja Acuícola Medellin";
        if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    /* =====================================================
       OBTENER PILETAS DISPONIBLES PARA ORIGEN INTERNO
       (Solo las que tengan cantidad > 0)
    ====================================================== */
    static async getOrigen(granja) {
        const granjaFinal = this.normalizarGranja(granja);

        try {
            const result = await pool.query(
                `
                SELECT 
                    p.fi_pileta_id,
                    p.cantidad,
                    p.fi_lote_id,
                    l.no_lote,
                    COALESCE(i.nombre_instalacion, '-') AS nombre_instalacion
                FROM piletas p
                LEFT JOIN lotes l ON p.fi_lote_id = l.fi_lote_id
                LEFT JOIN instalaciones i ON p.fi_instalacion_id = i.fi_instalacion_id
                WHERE LOWER(TRIM(p.fc_granja)) = LOWER(TRIM($1))
                AND p.cantidad > 0
                ORDER BY p.fi_pileta_id ASC
                `,
                [granjaFinal]
            );

            return result.rows;

        } catch (err) {
            console.error("Error en OrigenModel.getOrigen:", err);
            throw new Error("Error obteniendo piletas disponibles como origen");
        }
    }
}

export default OrigenModel;
import pool from "../db.js";

class OrigenModel {

    // Normalizar la granja igual que en los demás modelos
    static normalizarGranja(granja) {
        if (!granja) return "Granja Acuícola Medellin";
        const g = granja.toLowerCase();
        if (g.includes("med")) return "Granja Acuícola Medellin";
        if (g.includes("ceib")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    /* =====================================================
       OBTENER INSTALACIONES DISPONIBLES PARA ORIGEN
    ====================================================== */
    static async getOrigen(granja) {
        const granjaFinal = this.normalizarGranja(granja);

        try {
            const result = await pool.query(
                `
                SELECT 
                    fi_instalacion_id,
                    nombre_instalacion
                FROM instalaciones
                WHERE LOWER(TRIM(fc_granja)) = LOWER(TRIM($1))
                ORDER BY nombre_instalacion ASC
                `,
                [granjaFinal]
            );

            return result.rows;

        } catch (err) {
            console.error("❌ Error en OrigenModel.getOrigen:", err);
            throw new Error("Error obteniendo instalaciones de origen");
        }
    }
}

export default OrigenModel;
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

    const granjaFinal = this.normalizarGranja(granja);

    const result = await pool.query(
        `
        SELECT 
            l.fi_instalacion_id,
            i.nombre_instalacion,
            l.fi_lote_id,
            l.no_lote,
            l.alevines_inicial
        FROM lotes l
        INNER JOIN instalaciones i
            ON l.fi_instalacion_id = i.fi_instalacion_id
        WHERE LOWER(i.fc_granja) = LOWER($1)
        AND l.alevines_inicial > 0
        ORDER BY i.nombre_instalacion ASC
        `,
        [granjaFinal]
    );

    return result.rows;
}
    static async getDestino(granja) {

    const granjaFinal = this.normalizarGranja(granja);

    const result = await pool.query(
        `
        SELECT 
            fi_instalacion_id,
            nombre_instalacion
        FROM instalaciones
        WHERE LOWER(fc_granja) = LOWER($1)
        AND LOWER(estado) = 'vacia'
        ORDER BY nombre_instalacion ASC
        `,
        [granjaFinal]
    );

    return result.rows;
}
}


export default OrigenModel;
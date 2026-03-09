import pool from "../db.js";

class OrigenModel {

static normalizarGranja(granja){

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

return "Granja Acuícola Medellin"

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

const granjaFinal = this.normalizarGranja(granja)

const result = await pool.query(`
SELECT DISTINCT
i.fi_instalacion_id,
i.nombre_instalacion
FROM instalaciones i
JOIN lotes l
ON i.fi_instalacion_id = l.fc_instalacion_id
WHERE LOWER(i.fc_granja) LIKE LOWER('%' || $1 || '%')
ORDER BY i.nombre_instalacion
`,[granjaFinal])

return result.rows

}

/* DESTINO */

static async getDestino(granja){

const granjaFinal = this.normalizarGranja(granja)

const result = await pool.query(`
SELECT
fi_instalacion_id,
nombre_instalacion
FROM instalaciones
WHERE LOWER(fc_granja) LIKE LOWER('%' || $1 || '%')
AND tipo_instalacion='ALEVINAJE'
AND LOWER(estado) IN ('vacia','vacía')
ORDER BY nombre_instalacion
`,[granjaFinal])

return result.rows

}

}

export default OrigenModel
import pool from "../db.js";

class OrigenModel {

static normalizarGranja(granja){
    if(!granja) return "Granja Acuícola Medellin"

    const g = granja.toLowerCase()

    if(g.includes("med")) return "Granja Acuícola Medellin"
    if(g.includes("ceib")) return "Granja Acuícola La Ceiba"

    return "Granja Acuícola Medellin"
}

/* ======================================
   ORIGEN
====================================== */

static async getOrigen(granja){

try{

const granjaFinal = this.normalizarGranja(granja)

const result = await pool.query(`
SELECT DISTINCT
i.fi_instalacion_id,
i.nombre_instalacion
FROM instalaciones i
JOIN lotes l
ON i.fi_instalacion_id = l.fc_instalacion_id
WHERE LOWER(i.fc_granja) LIKE LOWER('%' || $1 || '%')
AND l.alevines_inicial > 0
ORDER BY i.nombre_instalacion
`,[granjaFinal])

return result.rows

}catch(err){

console.error("Error obteniendo origen:", err)
throw err

}

}

/* ======================================
   DESTINO
====================================== */

static async getDestino(granja){

try{

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

}catch(err){

console.error("Error obteniendo destino:", err)
throw err

}

}

}

export default OrigenModel
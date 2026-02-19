import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
    🔍 FUNCIONES DE APOYO
========================================================= */

// Verifica si un ID pertenece a un lote (para saber de dónde restar)
async function esLote(id) {
    const r = await pool.query(
        "SELECT 1 FROM lotes WHERE fi_lote_id = $1",
        [id]
    );
    return r.rowCount > 0;
}

/* =========================================================
    📋 GET - Listar registros de Engorda por granja
========================================================= */
router.get("/granja/:granja", async (req, res) => {
    const { granja } = req.params;
    try {
        const result = await pool.query(
            `
            SELECT 
                e.fi_engorda_id,
                e.fi_instalacion_id,
                i.nombre_instalacion AS destino_nombre,
                e.fi_lote_id,
                l.no_lote,
                e.cantidad,
                e.talla_gr,
                e.observacion,
                e.fecha_siembra,
                e.fecha_biometria,
                CURRENT_DATE - e.fecha_siembra AS dias_en_pila,
                CURRENT_DATE - e.fecha_biometria AS dias_transcurridos,
                e.fi_usuario_id,
                e.fc_granja
            FROM engorda e
            LEFT JOIN instalaciones i ON i.fi_instalacion_id = e.fi_instalacion_id
            LEFT JOIN lotes l ON l.fi_lote_id = e.fi_lote_id
            WHERE e.fc_granja ILIKE $1
            ORDER BY e.fi_engorda_id DESC;
            `,
            [`%${granja}%`]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error al obtener registros de Engorda:", err);
        res.status(500).send("Error al obtener registros de Engorda");
    }
});

/* =========================================================
    ✅ POST - Registrar Engorda (Siembra/Traslado)
========================================================= */
router.post("/", async (req, res) => {
    const {
        fi_instalacion_id,
        origen_instalacion, // ID de Lote o ID de Engorda previa
        cantidad,
        talla_gr,
        no_lote, // Texto informativo
        observacion,
        fecha_siembra,
        fecha_biometria,
        fi_usuario_id,
        fc_granja,
        fi_engorda_id // Si viene, es actualización
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /* -----------------------------------------------------
            1️⃣ CASO: ACTUALIZACIÓN (UPDATE)
        ----------------------------------------------------- */
        if (fi_engorda_id) {
            await client.query(
                `UPDATE engorda SET 
                    cantidad = $1, talla_gr = $2, observacion = $3, 
                    fecha_siembra = $4, fecha_biometria = $5,
                    fd_fecha_modificacion = CURRENT_DATE
                WHERE fi_engorda_id = $6`,
                [cantidad, talla_gr, observacion, fecha_siembra, fecha_biometria, fi_engorda_id]
            );
            await client.query("COMMIT");
            return res.json({ message: "✅ Registro actualizado correctamente." });
        }

        /* -----------------------------------------------------
            2️⃣ CASO: NUEVO REGISTRO (INSERT + RESTA + TRAZA)
        ----------------------------------------------------- */
        
        // Detectar si el origen es un lote
        const origenEsLote = await esLote(origen_instalacion);
        let loteIdFinal = null;

        if (origenEsLote) {
            loteIdFinal = origen_instalacion;
        } else {
            // Si viene de otra tina de engorda, heredamos el loteID de esa tina
            const resLote = await client.query(
                "SELECT fi_lote_id FROM engorda WHERE fi_engorda_id = $1", 
                [origen_instalacion]
            );
            loteIdFinal = resLote.rows[0]?.fi_lote_id || null;
        }

        // A. Insertar en tabla Engorda
        const insert = await client.query(
            `INSERT INTO engorda (
                fi_instalacion_id, fi_lote_id, origen_instalacion, cantidad, 
                talla_gr, observacion, fecha_siembra, fecha_biometria, 
                fi_usuario_id, fc_granja, fecha_registro
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CURRENT_DATE) 
            RETURNING fi_engorda_id`,
            [fi_instalacion_id, loteIdFinal, origen_instalacion, cantidad, talla_gr, observacion, fecha_siembra, fecha_biometria, fi_usuario_id, fc_granja]
        );

        const destinoId = insert.rows[0].fi_engorda_id;

        // B. Restar del origen y registrar trazabilidad
        if (origenEsLote) {
            // Restar del LOTE
            await client.query(
                "UPDATE lotes SET alevines_inicial = alevines_inicial - $1 WHERE fi_lote_id = $2",
                [cantidad, origen_instalacion]
            );

            // Trazabilidad (Solo destino porque viene de lote externo)
            await client.query(
                `INSERT INTO rastreabilidad_engorda (
                    fi_engorda_destino, cantidad_trasladada, fecha_movimiento, observacion, fi_usuario_id
                ) VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
                [destinoId, cantidad, observacion, fi_usuario_id]
            );
        } else {
            // Restar de otra ENGORDA
            await client.query(
                "UPDATE engorda SET cantidad = cantidad - $1 WHERE fi_engorda_id = $2",
                [cantidad, origen_instalacion]
            );

            // Trazabilidad (Origen y Destino)
            await client.query(
                `INSERT INTO rastreabilidad_engorda (
                    fi_engorda_origen, fi_engorda_destino, cantidad_trasladada, fecha_movimiento, observacion, fi_usuario_id
                ) VALUES ($1,$2,$3,CURRENT_DATE,$4,$5)`,
                [origen_instalacion, destinoId, cantidad, observacion, fi_usuario_id]
            );
        }

        // C. Marcar instalación como OCUPADA
        await client.query(
            "UPDATE instalaciones SET estado = 'Ocupada' WHERE fi_instalacion_id = $1",
            [fi_instalacion_id]
        );

        await client.query("COMMIT");
        res.json({ message: "✅ Movimiento de engorda registrado con éxito" });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error:", err.message);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

/* =========================================================
    🗑️ DELETE - Eliminar registro y limpiar traza
========================================================= */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Eliminar trazabilidad asociada primero
        await pool.query(
            "DELETE FROM rastreabilidad_engorda WHERE fi_engorda_origen = $1 OR fi_engorda_destino = $1",
            [id]
        );

        // Eliminar el registro de engorda
        const result = await pool.query(
            `DELETE FROM engorda WHERE fi_engorda_id = $1 RETURNING *`,
            [id]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ message: "❌ Registro no encontrado." });

        res.json({ message: "🗑️ Registro y trazabilidad eliminados correctamente." });
    } catch (err) {
        console.error("❌ Error al eliminar Engorda:", err);
        res.status(500).send("Error al eliminar Engorda");
    }
});

export default router;
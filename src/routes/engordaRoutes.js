import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================================
    🔍 FUNCIONES DE APOYO
========================================================= */

// Verifica si un ID pertenece a un lote
async function esLote(id) {
    const r = await pool.query(
        "SELECT 1 FROM lotes WHERE fi_lote_id = $1",
        [id]
    );
    return r.rowCount > 0;
}

/* =========================================================
    📋 GET - Inventario Engorda
========================================================= */
router.get("/granja/:granja", async (req, res) => {
    try {
        const granja = req.params.granja;

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
            WHERE LOWER(e.fc_granja) = LOWER($1)
            ORDER BY e.fi_engorda_id DESC
            `,
            [granja]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).send("Error al obtener inventario de Engorda");
    }
});

/* =========================================================
    🟦 POST - Registrar Engorda (nueva o actualización)
========================================================= */
router.post("/", async (req, res) => {
    const {
        fi_engorda_id,
        fi_instalacion_id,
        origen_instalacion,   // ID origen lote o engorda
        cantidad,
        talla_gr,
        observacion,
        fecha_siembra,
        fecha_biometria,
        fi_usuario_id,
        fc_granja
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /* =============== UPDATE ===================== */
        if (fi_engorda_id) {
            await client.query(
                `
                UPDATE engorda SET
                    cantidad = $1,
                    talla_gr = $2,
                    observacion = $3,
                    fecha_siembra = $4,
                    fecha_biometria = $5,
                    fd_fecha_modificacion = CURRENT_DATE
                WHERE fi_engorda_id = $6
                `,
                [
                    cantidad,
                    talla_gr,
                    observacion,
                    fecha_siembra,
                    fecha_biometria,
                    fi_engorda_id
                ]
            );

            await client.query("COMMIT");
            return res.json({ message: "📝 Engorda actualizada correctamente." });
        }

        /* =============== INSERT ===================== */

        // Determinar lote final según el origen
        const origenEsLote = await esLote(origen_instalacion);
        let loteFinal;

        if (origenEsLote) {
            loteFinal = origen_instalacion;
        } else {
            const r = await client.query(
                "SELECT fi_lote_id FROM engorda WHERE fi_engorda_id = $1",
                [origen_instalacion]
            );
            loteFinal = r.rows[0]?.fi_lote_id || null;
        }

        // Insertar engorda (NO incluye origen_instalacion porque NO existe esa columna)
        const insert = await client.query(
            `
            INSERT INTO engorda (
                fi_instalacion_id,
                fi_lote_id,
                cantidad,
                talla_gr,
                observacion,
                fecha_siembra,
                fecha_biometria,
                fi_usuario_id,
                fc_granja,
                fecha_registro
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE)
            RETURNING fi_engorda_id
            `,
            [
                fi_instalacion_id,
                loteFinal,
                cantidad,
                talla_gr,
                observacion,
                fecha_siembra,
                fecha_biometria,
                fi_usuario_id,
                fc_granja
            ]
        );

        const destinoId = insert.rows[0].fi_engorda_id;

        /* ================= RESTAR ORIGEN ==================== */

        if (origenEsLote) {
            await client.query(
                "UPDATE lotes SET alevines_inicial = alevines_inicial - $1 WHERE fi_lote_id = $2",
                [cantidad, origen_instalacion]
            );
        } else {
            await client.query(
                "UPDATE engorda SET cantidad = cantidad - $1 WHERE fi_engorda_id = $2",
                [cantidad, origen_instalacion]
            );
        }

    /* ================= TRAZABILIDAD ==================== */

        if (origenEsLote) {
            await client.query(
                `
                INSERT INTO trazabilidad_engorda (
                    fi_engorda_destino,
                    cantidad_trasladada,
                    fecha_movimiento,
                    observacion,
                    fi_usuario_id
                )
                VALUES ($1, $2, CURRENT_DATE, $3, $4)
                `,
                [destinoId, cantidad, observacion, fi_usuario_id]
            );
        } else {
        
            await client.query(
                `
                INSERT INTO trazabilidad_engorda (
                    fi_engorda_origen,
                    fi_engorda_destino,
                    cantidad_trasladada,
                    fecha_movimiento,
                    observacion,
                    fi_usuario_id
                )
                VALUES ($1,$2,$3,CURRENT_DATE,$4,$5)
                `,
                [origen_instalacion, destinoId, cantidad, observacion, fi_usuario_id]
            );
        }

        await client.query("COMMIT");

        res.json({ message: "🐟 Engorda registrada con éxito" });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error:", err);
        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

/* =========================================================
    🗑 DELETE - Eliminar Engorda (sin restaurar inventario)
========================================================= */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM trazabilidad_engorda WHERE fi_engorda_origen = $1 OR fi_engorda_destino = $1",
            [id]
        );

        const result = await pool.query(
            "DELETE FROM engorda WHERE fi_engorda_id = $1 RETURNING *",
            [id]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ message: "❌ Registro no encontrado." });

        res.json({ message: "🗑️ Registro eliminado correctamente." });

    } catch (err) {
        console.error("❌ Error al eliminar:", err);
        res.status(500).send("Error eliminando registro de Engorda");
    }
});

export default router;
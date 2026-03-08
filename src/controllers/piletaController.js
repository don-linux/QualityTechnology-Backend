import piletaModel from "../models/piletaModel.js";
import origenModel from "../models/origenModel.js";

class PiletaController {

    /* =====================================================
       ORIGEN
    ===================================================== */
    static async getOrigen(req, res) {
        try {

            const granja = piletaModel.normalizarGranja(req.params.granja);

            const origenes = await origenModel.getOrigen(granja);

            res.json(origenes);

        } catch (err) {

            console.error("Error origen instalaciones:", err);

            res.status(500).json({
                error: "Error obteniendo instalaciones de origen"
            });

        }
    }

    /* =====================================================
       DESTINO
    ===================================================== */
    static async getDestino(req, res) {
        try {

            const granja = piletaModel.normalizarGranja(req.params.granja);

            const destino = await origenModel.getDestino(granja);

            res.json(destino);

        } catch (err) {

            console.error("Error destino instalaciones:", err);

            res.status(500).json({
                error: "Error obteniendo destino"
            });

        }
    }

    /* =====================================================
       LOTES
    ===================================================== */
    static async getLotes(req, res) {
        try {

            const granja = piletaModel.normalizarGranja(req.params.granja);

            const lotes = await piletaModel.getLotesByGranja(granja);

            res.json(lotes);

        } catch (err) {

            console.error("Error cargando lotes:");
            console.error(err);
            console.error(err.message);
            console.error(err.stack);

            res.status(500).json({
                error: err.message
            });

        }
    }

    /* =====================================================
       INVENTARIO
    ===================================================== */
    static async getInventario(req, res) {
        try {

            const granja = piletaModel.normalizarGranja(req.params.granja);

            const inventario = await piletaModel.getInventario(granja);

            res.json(inventario);

        } catch (err) {

            console.error("Error inventario:", err);

            res.status(500).json({
                error: "Error cargando inventario"
            });

        }
    }

    /* =====================================================
       LOTE POR INSTALACION
    ===================================================== */
    static async getLotePorInst(req, res) {
        try {

            const granja = piletaModel.normalizarGranja(req.params.granja);

            const lote = await piletaModel.getLotePorInstalacion(
                req.params.inst
            );

            res.json(lote);

        } catch (err) {

            console.error("Error lote según instalación:", err);

            res.status(500).json({
                error: "Error obteniendo lote"
            });

        }
    }

    /* =====================================================
       SIEMBRA
    ===================================================== */
    static async siembra(req, res) {
        try {

            const data = req.body;

            if (data.fi_pileta_id) {

                await piletaModel.updateSiembra(data.fi_pileta_id, data);

                return res.json({
                    success: true,
                    message: "Siembra actualizada correctamente"
                });

            }

            await piletaModel.createSiembra(data);

            await piletaModel.ocuparInstalacion(data.fi_instalacion_id);

            res.json({
                success: true,
                message: "Siembra registrada correctamente"
            });

        } catch (err) {

            console.error("Error siembra:", err);

            res.status(500).json({
                error: "Error registrando siembra"
            });

        }
    }

    /* =====================================================
       ELIMINAR PILETA
    ===================================================== */
    static async delete(req, res) {
        try {

            const { id } = req.params;

            const prev = await piletaModel.getCantidadYlote(id);

            if (!prev) {
                return res.status(404).json({
                    error: "La pileta no existe"
                });
            }

            const { cantidad, fi_lote_id } = prev;

            await piletaModel.devolverAlevinesAlLote(fi_lote_id, cantidad);

            await piletaModel.delete(id);

            await piletaModel.verificarInstalacionVacia(prev.fi_instalacion_id);

            res.json({
                success: true,
                message: "Pileta eliminada correctamente"
            });

        } catch (err) {

            console.error("Error eliminando pileta:", err);

            res.status(500).json({
                error: "Error eliminando pileta"
            });

        }
    }

    /* =====================================================
       REGISTRAR MOVIMIENTO
    ===================================================== */
    static async registrarMovimiento(req, res) {
        try {

            const data = req.body;

            const movimientoId = await piletaModel.createMovimiento(data);

            res.json({
                success: true,
                movimiento_id: movimientoId,
                message: "Movimiento registrado correctamente"
            });

        } catch (err) {

            console.error("Error registrando movimiento:", err);

            res.status(400).json({
                error: err.message
            });

        }
    }

    /* =====================================================
       OBTENER MOVIMIENTOS
    ===================================================== */
    static async getMovimientos(req, res) {
        try {

            const movimientos = await piletaModel.getMovimientos(
                req.params.usuario,
                req.params.granja
            );

            res.json(movimientos);

        } catch (err) {

            console.error("Error obteniendo movimientos:", err);

            res.status(500).json({
                error: "Error obteniendo movimientos"
            });

        }
    }

    /* =====================================================
   FILTRAR MOVIMIENTOS
===================================================== */
static async getMovimientosFiltro(req, res) {

    try {

        const { usuario, granja } = req.params;
        const { buscar = "", fecha_inicio = "", fecha_fin = "" } = req.query;

        const movimientos = await piletaModel.getMovimientosFiltro(
            usuario,
            granja,
            buscar,
            fecha_inicio,
            fecha_fin
        );

        res.json(movimientos);

    } catch (err) {

        console.error("Error filtrando movimientos:", err);

        res.status(500).json({
            error: "Error en filtrado"
        });

    }

}

    /* =====================================================
       ELIMINAR MOVIMIENTOS
    ===================================================== */
    static async eliminarMovimientos(req, res) {
        try {

            const { movimiento_id, eliminar_todos, granja } = req.body;

            if (eliminar_todos && granja) {

                await piletaModel.deleteAllMovimientos(granja);

                return res.json({ success: true });

            }

            if (movimiento_id) {

                await piletaModel.deleteMovimiento(movimiento_id);

                return res.json({ success: true });

            }

            res.status(400).json({
                error: "Solicitud inválida"
            });

        } catch (err) {

            console.error("Error eliminando movimiento:", err);

            res.status(500).json({
                error: "Error eliminando movimiento"
            });

        }
    }

}

export default PiletaController;
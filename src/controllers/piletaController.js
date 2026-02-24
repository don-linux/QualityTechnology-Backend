import piletaModel from "../models/piletaModel.js";
import origenModel from "../models/origenModel.js";

class PiletaController {
    static async getOrigen(req, res) {
        try {
            const granja = piletaModel.normalizarGranja(req.params.granja);
            const orígenes = await origenModel.getOrigen(granja);
            res.json(orígenes);
        } catch (err) {
            console.error("Error origen instalaciones:", err);
            res.status(500).json({ error: "Error obteniendo instalaciones" });
        }
    }

    static async getLotes(req, res) {
        try {
            const granja = piletaModel.normalizarGranja(req.params.granja);
            const lotes = await piletaModel.getLotesByGranja(granja);
            res.json(lotes);
        } catch (err) {
            console.error("Error lotes:", err);
            res.status(500).json({ error: "Error cargando lotes" });
        }
    }

    static async getInventario(req, res) {
        try {
            const granja = piletaModel.normalizarGranja(req.params.granja);
            const inventario = await piletaModel.getInventario(granja);
            res.json(inventario);
        } catch (err) {
            console.error("Error inventario:", err);
            res.status(500).json({ error: "Error cargando inventario" });
        }
    }

    static async getLotePorInst(req, res) {
        try {
            const granja = piletaModel.normalizarGranja(req.params.granja);
            const lote = await piletaModel.getLotePorInstalacion(req.params.inst, granja);
            res.json(lote);
        } catch (err) {
            console.error("Error lote según instalación:", err);
            res.status(500).json({ error: "Error obteniendo lote" });
        }
    }

    static async siembra(req, res) {
        try {
            const {
                fi_pileta_id, fi_instalacion_id, origen_instalacion,
                fi_lote_id, cantidad, talla_gr, observacion,
                fecha_siembra, fecha_ultima_biometria, fi_usuario_id, fc_granja
            } = req.body;

            if (fi_pileta_id) {
                const prev = await piletaModel.getCantidadYlote(fi_pileta_id);
                const cantidad_anterior = prev?.cantidad || 0;

                await piletaModel.updateSiembra(fi_pileta_id, {
                    fi_instalacion_id, origen_instalacion, fi_lote_id,
                    cantidad, talla_gr, observacion, fecha_siembra,
                    fecha_ultima_biometria, fi_usuario_id
                });

                await piletaModel.updateAlevinesLote(fi_lote_id, cantidad - cantidad_anterior);
                return res.json({ success: true, message: "Actualizado correctamente" });
            }

            await piletaModel.createSiembra({
                fi_instalacion_id, origen_instalacion, fi_lote_id,
                cantidad, talla_gr, observacion, fecha_siembra,
                fecha_ultima_biometria, fi_usuario_id, fc_granja
            });

            await piletaModel.updateAlevinesLote(fi_lote_id, cantidad);
            res.json({ success: true, message: "Registrado correctamente" });

        } catch (err) {
            console.error("Error siembra:", err);
            res.status(500).json({ error: "Error registrando siembra" });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const prev = await piletaModel.getCantidadYlote(id);
            if (!prev) return res.status(404).json({ error: "No existe la pileta" });

            await piletaModel.delete(id);
            await piletaModel.updateAlevinesLote(prev.fi_lote_id, -prev.cantidad);
            res.json({ success: true });
        } catch (err) {
            console.error("Error eliminando pileta:", err);
            res.status(500).json({ error: "Error eliminando pileta" });
        }
    }

    static async getMovimientos(req, res) {
        try {
            const movimientos = await piletaModel.getMovimientos(req.params.usuario, req.params.granja);
            res.json(movimientos);
        } catch (err) {
            console.error("Error obteniendo movimientos:", err);
            res.status(500).json({ error: "Error obteniendo movimientos" });
        }
    }

    static async getMovimientosFiltro(req, res) {
        const { usuario, granja } = req.params;
        const { buscar = "", fecha_inicio = "", fecha_fin = "" } = req.query;
        try {
            const movimientos = await piletaModel.getMovimientosFiltro(usuario, granja, buscar, fecha_inicio, fecha_fin);
            res.json(movimientos);
        } catch (err) {
            console.error("Error filtrando movimientos:", err);
            res.status(500).json({ error: "Error en filtrado" });
        }
    }

    static async registrarMovimiento(req, res) {
        try {
            const movId = await piletaModel.createMovimiento(req.body);
            res.json({ success: true, movimiento_id: movId });
        } catch (err) {
            console.error("Error registrando movimiento:", err);
            res.status(500).json({ error: "Error guardando movimiento" });
        }
    }

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
            res.status(400).json({ error: "Solicitud inválida" });
        } catch (err) {
            console.error("Error eliminando movimiento:", err);
            res.status(500).json({ error: "Error eliminando movimiento" });
        }
    }
}

export default PiletaController;

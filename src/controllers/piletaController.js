import piletaModel from "../models/piletaModel.js";
import origenModel from "../models/origenModel.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;

// Regresa un mensaje de error si algun campo de alevinaje es invalido.
// Devuelve null cuando todo esta ok.
const validarCamposAlevinaje = ({ cantidad, talla_gr, observacion } = {}) => {
    if (cantidad !== undefined && cantidad !== null && cantidad !== "") {
        const str = String(cantidad);
        if (str.length > MAX_NUMERICO) {
            return `La cantidad no puede superar los ${MAX_NUMERICO} caracteres.`;
        }
        if (!/^\d+$/.test(str)) {
            return "La cantidad debe ser un numero entero sin decimales.";
        }
    }

    if (talla_gr !== undefined && talla_gr !== null && talla_gr !== "") {
        const str = String(talla_gr);
        if (str.length > MAX_NUMERICO) {
            return `La talla no puede superar los ${MAX_NUMERICO} caracteres.`;
        }
        if (!/^\d+(\.\d+)?$/.test(str)) {
            return "La talla debe ser un numero valido (permite decimales).";
        }
    }

    if (observacion && String(observacion).length > MAX_OBSERVACION) {
        return `La observacion no puede superar los ${MAX_OBSERVACION} caracteres.`;
    }

    return null;
};

class PiletaController {

    static async getOrigen(req, res) {
        try {
            const granja = piletaModel.normalizarGranja(req.params.granja);
            const origenes = await origenModel.getOrigen(granja);
            res.json(origenes);
        } catch (err) {
            console.error("Error origen instalaciones:", err);
            res.status(500).json({ error: "Error obteniendo instalaciones" });
        }
    }
    
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
            const lote = await piletaModel.getLotePorInstalacion(
                req.params.inst,
                granja
            );
            res.json(lote);
        } catch (err) {
            console.error("Error lote según instalación:", err);
            res.status(500).json({ error: "Error obteniendo lote" });
        }
    }

    static async siembra(req, res) {
        try {
            const { fi_usuario_id, ...rest } = req.body;
            const data = { ...rest, fi_usuario_id: req.user.usuario_id };

            const errorCampos = validarCamposAlevinaje(data);
            if (errorCampos) {
                return res.status(400).json({ error: errorCampos });
            }

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
            res.status(500).json({ error: "Error registrando siembra" });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const prev = await piletaModel.getCantidadYlote(id);
            if (!prev)
                return res.status(404).json({ error: "La pileta no existe" });

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
            res.status(500).json({ error: "Error eliminando pileta" });
        }
    }

    static async registrarMovimiento(req, res) {
        try {
            const errorCampos = validarCamposAlevinaje(req.body);
            if (errorCampos) {
                return res.status(400).json({ error: errorCampos });
            }

            const { fi_usuario_id, ...movPayload } = req.body;
            const id = await piletaModel.createMovimiento({ ...movPayload, fi_usuario_id: req.user.usuario_id });

            res.json({
                success: true,
                movimiento_id: id,
                message: "Movimiento registrado correctamente"
            });

        } catch (err) {
            console.error("Error registrando movimiento:", err);
            res.status(400).json({ error: err.message });
        }
    }

    static async getMovimientos(req, res) {
        try {
            const movimientos = await piletaModel.getMovimientos(
                req.params.usuario,
                req.params.granja
            );
            res.json(movimientos);
        } catch (err) {
            console.error("Error obteniendo movimientos:", err);
            res.status(500).json({ error: "Error obteniendo movimientos" });
        }
    }

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
            res.status(500).json({ error: "Error en filtrado" });
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
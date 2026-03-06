import alimentoModel from "../models/alimentoModel.js";

class AlimentoController {
    static async create(req, res) {
        try {
            const { fi_reproductor_id, fi_pileta_id, fi_engorda_id } = req.body;
            const fi_usuario_id = req.user.usuario_id; // Obtenido del token

            let particula_mm = 0;
            let alimento_dia = 0;
            let porcion = 0;
            let gasto_alimento = 0;

            // Caso 1: PILETA (Alevinaje)
            if (fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
                const p = await alimentoModel.getContextData("pileta", fi_pileta_id);
                if (p) {
                    const cantidad = Number(p.cantidad) || 0;
                    const talla = Number(p.talla_gr) || 0;

                    if (talla < 5) particula_mm = 1.0;
                    else if (talla < 20) particula_mm = 2.0;
                    else if (talla < 50) particula_mm = 3.0;
                    else particula_mm = 4.0;

                    porcion = 0.03;
                    alimento_dia = cantidad * porcion;
                    gasto_alimento = alimento_dia * 60;
                }
            }

            // Caso 2: REPRODUCTOR
            else if (fi_reproductor_id && !fi_pileta_id && !fi_engorda_id) {
                const r = await alimentoModel.getContextData("reproductor", fi_reproductor_id);
                if (r) {
                    const cantidad = Number(r.fn_cantidad) || 0;
                    alimento_dia = cantidad * 0.03;
                    porcion = 0.03;
                    particula_mm = 3.0;
                    gasto_alimento = alimento_dia * 60;
                }
            }

            // Caso 3: ENGORDA
            else if (fi_engorda_id && !fi_pileta_id && !fi_reproductor_id) {
                const e = await alimentoModel.getContextData("engorda", fi_engorda_id);
                if (e) {
                    const cantidad = Number(e.cantidad) || 0;
                    const talla = Number(e.talla_gr) || 0;

                    if (talla < 100) particula_mm = 3.0;
                    else if (talla < 400) particula_mm = 4.0;
                    else particula_mm = 5.0;

                    porcion = 0.02;
                    alimento_dia = cantidad * porcion;
                    gasto_alimento = alimento_dia * 60;
                }
            }

            if (!fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
                return res.status(400).json({ error: "Debe seleccionar una pileta, reproductor o engorda." });
            }

            const nuevoAlimento = await alimentoModel.create({
                fi_reproductor_id, fi_pileta_id, fi_engorda_id,
                particula_mm, alimento_dia, porcion, gasto_alimento, fi_usuario_id
            });

            res.status(201).json(nuevoAlimento);
        } catch (err) {
            console.error("Error al registrar alimento:", err);
            res.status(500).json({ error: "Error al registrar alimento" });
        }
    }

    static async getAll(req, res) {
        try {
            const usuarioId = req.user.usuario_id;
            const rol = req.user.rol || "";
            const isAdmin = rol.toLowerCase() === "administrador";

            const alimentos = await alimentoModel.getAll(isAdmin, usuarioId);
            res.json(alimentos);
        } catch (err) {
            console.error("Error al obtener alimentos:", err);
            res.status(500).json({ error: "Error al obtener alimentos" });
        }
    }

    static async delete(req, res) {
        try {
            await alimentoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error al eliminar alimento:", err);
            res.status(500).json({ error: "Error al eliminar alimento" });
        }
    }
}

export default AlimentoController;

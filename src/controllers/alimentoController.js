import prisma from "../prisma.js";
import { serializeAlimento } from "../utils/serializers.js";

// El schema actual de Alimento renombra: particulaMm -> milimetros_particula,
// alimentoDia -> cantidad_dia, gastoAlimento -> costo_total. El concepto de
// "cantidad" y "talla" ya no vive en Pileta (es solo contenedor fisico), asi
// que el calculo automatico desde la pileta no aplica directamente. Para
// reproductor usamos `cantidad_total`. Para engorda usamos `cantidad_total` y peso (kg).
// La relacion a Instalacion ya no existe: Pileta/Engorda/Reproductor llevan
// a `ubicacion` via Pileta.

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

async function calcularReproductor(reproductorId) {
  const r = await prisma.reproductor.findUnique({
    where: { id: reproductorId },
    select: { cantidad_total: true, machos: true, hembras: true },
  });
  if (!r) return null;
  const cantidad = Number(r.cantidad_total ?? (r.machos || 0) + (r.hembras || 0));
  const porcion = 0.03;
  const cantidadDia = cantidad * porcion;
  return {
    milimetros_particula: 3.0,
    cantidad_dia: cantidadDia,
    porcion,
    costo_total: cantidadDia * 60,
  };
}

async function calcularEngorda(engordaId) {
  const e = await prisma.engorda.findUnique({
    where: { id: engordaId },
    select: {
      cantidad_total: true,
      historial_peso: { select: { peso: true } },
    },
  });
  if (!e) return null;
  const cantidad = Number(e.cantidad_total) || 0;
  const pesoKg = Number(e.historial_peso?.peso) || 0;
  let particula = 5.0;
  if (pesoKg > 0 && pesoKg < 0.1) particula = 3.0;
  else if (pesoKg > 0 && pesoKg < 0.4) particula = 4.0;
  const porcion = 0.02;
  const cantidadDia = cantidad * porcion;
  return {
    milimetros_particula: particula,
    cantidad_dia: cantidadDia,
    porcion,
    costo_total: cantidadDia * 60,
  };
}

const alimentoInclude = {
  pileta: { include: { ubicacion: true } },
  engorda: { include: { piletas: { include: { ubicacion: true } } } },
  reproductor: { include: { piletas: { include: { ubicacion: true } } } },
  usuario: true,
};

class AlimentoController {
  static async create(req, res) {
    try {
      const reproductorId = toInt(req.body.fi_reproductor_id ?? req.body.reproductor_id);
      const piletaId = toInt(req.body.fi_pileta_id ?? req.body.pileta_id);
      const engordaId = toInt(req.body.fi_engorda_id ?? req.body.engorda_id);
      const usuarioId = req.user.usuario_id;

      const seleccionados = [reproductorId, piletaId, engordaId].filter((v) => v !== null).length;
      if (seleccionados === 0) {
        return res.status(400).json({
          error: "Debe seleccionar una pileta, reproductor o engorda.",
        });
      }
      if (seleccionados > 1) {
        return res.status(400).json({
          error: "Solo puede seleccionar uno: pileta, reproductor o engorda.",
        });
      }

      let calc = null;
      if (reproductorId) calc = await calcularReproductor(reproductorId);
      else if (engordaId) calc = await calcularEngorda(engordaId);
      else if (piletaId) {
        // La pileta ya no almacena inventario; el caller debe enviar los
        // valores explicitos para registros asociados a piletas directas.
        calc = {
          milimetros_particula: Number(req.body.milimetros_particula ?? req.body.particula_mm) || 0,
          cantidad_dia: Number(req.body.cantidad_dia ?? req.body.alimento_dia) || 0,
          porcion: Number(req.body.porcion) || 0,
          costo_total: Number(req.body.costo_total ?? req.body.gasto_alimento) || 0,
        };
      }

      if (!calc) {
        return res.status(404).json({ error: "No se encontro el origen para calcular alimento" });
      }

      const creado = await prisma.alimento.create({
        data: {
          piletaId,
          engordaId,
          reproductorId,
          milimetros_particula: calc.milimetros_particula,
          cantidad_dia: calc.cantidad_dia,
          porcion: calc.porcion,
          costo_total: calc.costo_total,
          usuarioId,
        },
        include: alimentoInclude,
      });

      res.status(201).json(serializeAlimento(creado));
    } catch (err) {
      console.error("Error al registrar alimento:", err);
      res.status(500).json({ error: "Error al registrar alimento" });
    }
  }

  static async getAll(req, res) {
    try {
      const usuarioId = req.user.usuario_id;
      const rolNombre = (req.user.rol || "").toLowerCase();
      const isAdmin = rolNombre === "administrador" || rolNombre === "admin" || rolNombre === "root";

      const where = isAdmin ? {} : { usuarioId };
      const alimentos = await prisma.alimento.findMany({
        where,
        include: alimentoInclude,
        orderBy: { id: "desc" },
      });
      res.json(alimentos.map(serializeAlimento));
    } catch (err) {
      console.error("Error al obtener alimentos:", err);
      res.status(500).json({ error: "Error al obtener alimentos" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      await prisma.alimento.delete({ where: { id } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Alimento no encontrado" });
      console.error("Error al eliminar alimento:", err);
      res.status(500).json({ error: "Error al eliminar alimento" });
    }
  }
}

export default AlimentoController;

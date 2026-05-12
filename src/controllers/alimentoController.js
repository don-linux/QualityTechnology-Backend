import prisma from "../prisma.js";
import { serializeAlimento } from "../utils/serializers.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

async function calcularPileta(piletaId) {
  const p = await prisma.pileta.findUnique({
    where: { piletaId },
    select: { cantidad: true, tallaGr: true },
  });
  if (!p) return null;
  const cantidad = Number(p.cantidad) || 0;
  const talla = Number(p.tallaGr) || 0;
  let particula = 4.0;
  if (talla < 5) particula = 1.0;
  else if (talla < 20) particula = 2.0;
  else if (talla < 50) particula = 3.0;
  const porcion = 0.03;
  const alimentoDia = cantidad * porcion;
  return {
    particulaMm: particula,
    alimentoDia,
    porcion,
    gastoAlimento: alimentoDia * 60,
  };
}

async function calcularReproductor(reproductorId) {
  const r = await prisma.reproductor.findUnique({
    where: { reproductorId },
    select: { cantidad: true, machos: true, hembras: true },
  });
  if (!r) return null;
  const cantidad = Number(r.cantidad ?? (r.machos || 0) + (r.hembras || 0));
  const porcion = 0.03;
  const alimentoDia = cantidad * porcion;
  return {
    particulaMm: 3.0,
    alimentoDia,
    porcion,
    gastoAlimento: alimentoDia * 60,
  };
}

async function calcularEngorda(engordaId) {
  const e = await prisma.engorda.findUnique({
    where: { engordaId },
    select: { cantidad: true, tallaGr: true },
  });
  if (!e) return null;
  const cantidad = Number(e.cantidad) || 0;
  const talla = Number(e.tallaGr) || 0;
  let particula = 5.0;
  if (talla < 100) particula = 3.0;
  else if (talla < 400) particula = 4.0;
  const porcion = 0.02;
  const alimentoDia = cantidad * porcion;
  return {
    particulaMm: particula,
    alimentoDia,
    porcion,
    gastoAlimento: alimentoDia * 60,
  };
}

class AlimentoController {
  static async create(req, res) {
    try {
      const reproductorId = toInt(req.body.fi_reproductor_id);
      const piletaId = toInt(req.body.fi_pileta_id);
      const engordaId = toInt(req.body.fi_engorda_id);
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
      if (piletaId) calc = await calcularPileta(piletaId);
      else if (reproductorId) calc = await calcularReproductor(reproductorId);
      else if (engordaId) calc = await calcularEngorda(engordaId);

      if (!calc) {
        return res.status(404).json({ error: "No se encontro el origen para calcular alimento" });
      }

      const creado = await prisma.alimento.create({
        data: {
          piletaId,
          engordaId,
          reproductorId,
          particulaMm: calc.particulaMm,
          alimentoDia: calc.alimentoDia,
          porcion: calc.porcion,
          gastoAlimento: calc.gastoAlimento,
          usuarioId,
        },
        include: {
          pileta: { include: { instalacion: true } },
          engorda: { include: { instalacion: true } },
          reproductor: { include: { instalacion: true } },
          usuario: true,
        },
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
        include: {
          pileta: { include: { instalacion: true } },
          engorda: { include: { instalacion: true } },
          reproductor: { include: { instalacion: true } },
          usuario: isAdmin,
        },
        orderBy: { alimentoId: "desc" },
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
      await prisma.alimento.delete({ where: { alimentoId: id } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Alimento no encontrado" });
      console.error("Error al eliminar alimento:", err);
      res.status(500).json({ error: "Error al eliminar alimento" });
    }
  }
}

export default AlimentoController;

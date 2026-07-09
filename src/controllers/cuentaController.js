import prisma from "../prisma.js";
import { serializeCuenta } from "../utils/serializers.js";

const TIPOS_PERMITIDOS = ["Cheques", "Efectivo", "Inversion", "Ahorro"];
const BANCO_MAX_LENGTH = 150;

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function validarPayload(body) {
  const { unidad_negocio, nombre, tipo_cuenta, banco } = body;

  if (!unidad_negocio) return "La UdN es obligatoria";
  if (!nombre) return "El nombre es obligatorio";
  if (!tipo_cuenta || !TIPOS_PERMITIDOS.includes(tipo_cuenta)) {
    return "El tipo de cuenta es obligatorio y debe ser Cheques, Efectivo, Inversion o Ahorro";
  }
  const bancoTrim = typeof banco === "string" ? banco.trim() : "";
  if (bancoTrim.length > BANCO_MAX_LENGTH) {
    return `El nombre del banco no puede exceder ${BANCO_MAX_LENGTH} caracteres`;
  }
  return null;
}

async function unidadActivaPorNombre(nombre) {
  return prisma.unidadNegocio.findFirst({
    where: { nombre: String(nombre), esta_activo: true },
  });
}

class CuentaController {
  static async getAll(req, res) {
    try {
      const cuentas = await prisma.cuenta.findMany({
        orderBy: { id: "desc" },
      });
      res.json(cuentas.map(serializeCuenta));
    } catch (err) {
      console.error("Error al obtener cuentas:", err);
      res.status(500).json({ error: "Error al obtener cuentas" });
    }
  }

  static async getActivos(req, res) {
    try {
      const cuentas = await prisma.cuenta.findMany({
        where: { esta_activa: true },
        orderBy: { nombre: "asc" },
      });
      res.json(cuentas.map(serializeCuenta));
    } catch (err) {
      console.error("Error al obtener cuentas activas:", err);
      res.status(500).json({ error: "Error al obtener cuentas" });
    }
  }

  static async create(req, res) {
    const error = validarPayload(req.body);
    if (error) return res.status(400).json({ error });

    const { unidad_negocio, nombre, numero_cuenta, banco, tipo_cuenta } = req.body;
    const bancoTrim = typeof banco === "string" ? banco.trim() : "";

    try {
      const udn = await unidadActivaPorNombre(unidad_negocio);
      if (!udn) {
        return res.status(400).json({
          error: "La UdN debe existir en el catalogo de unidades de negocio y estar activa",
        });
      }

      const cuenta = await prisma.cuenta.create({
        data: {
          unidad_negocio: String(unidad_negocio),
          nombre: String(nombre),
          numeroCuenta: numero_cuenta ?? null,
          banco: bancoTrim || null,
          tipo_cuenta: String(tipo_cuenta),
        },
      });
      res.status(201).json({
        mensaje: "Cuenta creada correctamente",
        cuenta: serializeCuenta(cuenta),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una cuenta con ese nombre y UdN" });
      }
      console.error("Error al crear cuenta:", err);
      res.status(500).json({ error: "Error al crear cuenta" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    const error = validarPayload(req.body);
    if (error) return res.status(400).json({ error });

    const { unidad_negocio, nombre, numero_cuenta, banco, tipo_cuenta } = req.body;
    const bancoTrim = typeof banco === "string" ? banco.trim() : "";

    try {
      const udn = await unidadActivaPorNombre(unidad_negocio);
      if (!udn) {
        return res.status(400).json({
          error: "La UdN debe existir en el catalogo de unidades de negocio y estar activa",
        });
      }

      const cuenta = await prisma.cuenta.update({
        where: { id },
        data: {
          unidad_negocio: String(unidad_negocio),
          nombre: String(nombre),
          numeroCuenta: numero_cuenta ?? null,
          banco: bancoTrim || null,
          tipo_cuenta: String(tipo_cuenta),
        },
      });
      res.json({
        mensaje: "Cuenta actualizada correctamente",
        cuenta: serializeCuenta(cuenta),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cuenta no encontrada" });
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una cuenta con ese nombre y UdN" });
      }
      console.error("Error al actualizar cuenta:", err);
      res.status(500).json({ error: "Error al actualizar cuenta" });
    }
  }

  static async activate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const cuenta = await prisma.cuenta.update({
        where: { id },
        data: { esta_activa: true },
      });
      res.json({
        mensaje: "Cuenta activada correctamente",
        cuenta: serializeCuenta(cuenta),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cuenta no encontrada" });
      console.error("Error al activar cuenta:", err);
      res.status(500).json({ error: "Error al activar cuenta" });
    }
  }

  static async deactivate(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const cuenta = await prisma.cuenta.update({
        where: { id },
        data: { esta_activa: false },
      });
      res.json({
        mensaje: "Cuenta desactivada correctamente",
        cuenta: serializeCuenta(cuenta),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cuenta no encontrada" });
      console.error("Error al desactivar cuenta:", err);
      res.status(500).json({ error: "Error al desactivar cuenta" });
    }
  }
}

export default CuentaController;

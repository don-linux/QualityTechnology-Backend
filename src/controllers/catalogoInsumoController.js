import prisma from "../prisma.js";
import { serializeCatalogoInsumo } from "../utils/serializers.js";
import { generarCodigoCatalogoInsumo } from "../utils/catalogoInsumoCodigo.js";

const UNIDADES_MEDIDA = ["ml", "l", "mg", "g", "kg"];

const catalogoInsumoInclude = {
  cliente: {
    select: {
      id: true,
      nombre: true,
    },
  },
};

function normalizeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function parseRequiredId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function calcularPrecioUnitario(precioBulto, presentacion) {
  const raw = precioBulto / presentacion;
  return Math.round(raw * 10000) / 10000;
}

function buildCatalogoInsumoPayload(body) {
  const nombre = normalizeText(pick(body, "nombre"));
  const marcaRaw = pick(body, "marca");
  const marca = marcaRaw !== undefined ? normalizeText(marcaRaw) || null : null;
  const unidadMedida = normalizeText(pick(body, "unidad_medida", "unidadMedida")).toLowerCase();
  const clienteId = parseRequiredId(pick(body, "cliente_id", "clienteId"));
  const presentacion = parseDecimal(pick(body, "presentacion"));
  const precioBulto = parseDecimal(pick(body, "precio_bulto", "precioBulto"));
  const stockMinimo = parseDecimal(pick(body, "stock_minimo", "stockMinimo"));

  if (!nombre) {
    return { error: "Campo obligatorio: nombre" };
  }
  if (!unidadMedida) {
    return { error: "Campo obligatorio: unidad de medida" };
  }
  if (!UNIDADES_MEDIDA.includes(unidadMedida)) {
    return { error: `Unidad de medida inválida. Valores permitidos: ${UNIDADES_MEDIDA.join(", ")}` };
  }
  if (!clienteId) {
    return { error: "Campo obligatorio: razón social (cliente)" };
  }
  if (presentacion === null || presentacion <= 0) {
    return { error: "La presentación debe ser un número mayor a 0" };
  }
  if (precioBulto === null || precioBulto < 0) {
    return { error: "El precio bulto debe ser un número mayor o igual a 0" };
  }
  if (stockMinimo === null || stockMinimo < 0) {
    return { error: "El stock mínimo debe ser un número mayor o igual a 0" };
  }

  const precioUnitario = calcularPrecioUnitario(precioBulto, presentacion);

  return {
    payload: {
      nombre,
      marca,
      unidadMedida,
      clienteId,
      presentacion,
      precioBulto,
      precioUnitario,
      stockMinimo,
    },
  };
}

async function assertClienteValido(clienteId) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, esta_activo: true },
  });
  if (!cliente) {
    const err = new Error("Cliente no encontrado");
    err.code = "CLIENTE_NOT_FOUND";
    throw err;
  }
  if (!cliente.esta_activo) {
    const err = new Error("El cliente seleccionado no está activo");
    err.code = "CLIENTE_INACTIVO";
    throw err;
  }
}

class CatalogoInsumoController {
  static async getAll(req, res) {
    try {
      const items = await prisma.catalogoInsumo.findMany({
        include: catalogoInsumoInclude,
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeCatalogoInsumo));
    } catch (err) {
      console.error("Error al obtener insumos:", err);
      res.status(500).json({ error: "Error al obtener insumos" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.catalogoInsumo.findMany({
        where: { esta_activo: true },
        include: catalogoInsumoInclude,
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeCatalogoInsumo));
    } catch (err) {
      console.error("Error al obtener insumos activos:", err);
      res.status(500).json({ error: "Error al obtener insumos activos" });
    }
  }

  static async create(req, res) {
    try {
      const { error, payload } = buildCatalogoInsumoPayload(req.body);
      if (error) return res.status(400).json({ error });

      await assertClienteValido(payload.clienteId);

      const item = await prisma.$transaction(async (tx) => {
        const codigo = await generarCodigoCatalogoInsumo(tx);
        return tx.catalogoInsumo.create({
          data: { codigo, ...payload },
          include: catalogoInsumoInclude,
        });
      });

      res.status(201).json({
        mensaje: "Insumo creado correctamente",
        insumo: serializeCatalogoInsumo(item),
      });
    } catch (err) {
      if (err.code === "CLIENTE_NOT_FOUND" || err.code === "CLIENTE_INACTIVO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Referencia inválida (cliente)" });
      }
      console.error("Error al crear insumo:", err);
      res.status(500).json({ error: "Error al crear insumo" });
    }
  }

  static async update(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const { error, payload } = buildCatalogoInsumoPayload(req.body);
      if (error) return res.status(400).json({ error });

      await assertClienteValido(payload.clienteId);

      const item = await prisma.catalogoInsumo.update({
        where: { id },
        data: payload,
        include: catalogoInsumoInclude,
      });

      res.json({
        mensaje: "Insumo actualizado correctamente",
        insumo: serializeCatalogoInsumo(item),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Insumo no encontrado" });
      if (err.code === "CLIENTE_NOT_FOUND" || err.code === "CLIENTE_INACTIVO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Referencia inválida (cliente)" });
      }
      console.error("Error al actualizar insumo:", err);
      res.status(500).json({ error: "Error al actualizar insumo" });
    }
  }

  static async activate(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const item = await prisma.catalogoInsumo.update({
        where: { id },
        data: { esta_activo: true },
        include: catalogoInsumoInclude,
      });
      res.json({
        mensaje: "Insumo activado correctamente",
        insumo: serializeCatalogoInsumo(item),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Insumo no encontrado" });
      console.error("Error al activar insumo:", err);
      res.status(500).json({ error: "Error al activar insumo" });
    }
  }

  static async deactivate(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const item = await prisma.catalogoInsumo.update({
        where: { id },
        data: { esta_activo: false },
        include: catalogoInsumoInclude,
      });
      res.json({
        mensaje: "Insumo desactivado correctamente",
        insumo: serializeCatalogoInsumo(item),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Insumo no encontrado" });
      console.error("Error al desactivar insumo:", err);
      res.status(500).json({ error: "Error al desactivar insumo" });
    }
  }
}

export default CatalogoInsumoController;

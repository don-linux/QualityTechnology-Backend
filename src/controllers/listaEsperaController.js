import prisma from "../prisma.js";
import { serializeListaEspera, serializeVenta } from "../utils/serializers.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inferirEmpresa(granjaNombre) {
  const g = String(granjaNombre || "").toLowerCase();
  if (g.includes("ceiba")) return "CEIBA";
  if (g.includes("med")) return "MEDELLIN";
  return "QUALITY";
}

async function buildPayloadFromBody(body) {
  const cantidad = toDecimal(body.fn_cantidad);
  if (cantidad === null) {
    throw new Error("fn_cantidad es obligatorio");
  }
  const fechaEntrega = toDateOrNull(body.fd_fecha_entrega);
  if (!fechaEntrega) {
    throw new Error("fd_fecha_entrega es obligatorio");
  }

  let ubicacionId = null;
  const granjaInput = pick(body, "fc_granja_asignada", "granja", "ubicacion_id", "ubicacionId");
  if (granjaInput !== undefined) {
    const u = await resolverOCrearUbicacion(granjaInput);
    if (u) ubicacionId = u.ubicacionId;
  }

  return {
    fechaEntrega,
    talla: pick(body, "fc_talla", "talla") ?? null,
    cantidad,
    precioVenta: toDecimal(pick(body, "fn_precio_venta", "precio_venta")),
    cliente: pick(body, "fc_cliente", "cliente") ?? null,
    lugarEntrega: pick(body, "fc_lugar_entrega", "lugar_entrega") ?? null,
    encargadoVenta: pick(body, "fc_encargado_venta", "encargado_venta") ?? null,
    unidadProduccion: pick(body, "fc_unidad_produccion", "unidad_produccion") ?? null,
    uapAsignada: pick(body, "fc_uap_asignada", "uap_asignada") ?? null,
    ubicacionId,
    horaEmbolsado: pick(body, "fc_hora_embolsado", "hora_embolsado") ?? null,
    horaEntrega: pick(body, "fc_hora_entrega", "hora_entrega") ?? null,
  };
}

class ListaEsperaController {
  static async getAll(req, res) {
    try {
      const lista = await prisma.listaEspera.findMany({
        include: { ubicacion: true },
        orderBy: { listaId: "desc" },
      });
      res.json(lista.map(serializeListaEspera));
    } catch (err) {
      console.error("Error al obtener lista de espera:", err);
      res.status(500).json({ error: "Error al obtener lista de espera" });
    }
  }

  static async create(req, res) {
    try {
      const data = await buildPayloadFromBody(req.body);
      const creado = await prisma.listaEspera.create({
        data,
        include: { ubicacion: true },
      });
      res.status(201).json(serializeListaEspera(creado));
    } catch (err) {
      console.error("Error al registrar lista de espera:", err);
      res.status(400).json({ error: err.message || "Error al registrar en lista de espera" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const data = await buildPayloadFromBody(req.body);
      await prisma.listaEspera.update({
        where: { listaId: id },
        data,
      });
      res.sendStatus(200);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("Error en PUT:", err);
      res.status(400).json({ error: err.message || "Error al actualizar" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      await prisma.listaEspera.delete({ where: { listaId: id } });
      res.sendStatus(204);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("Error en DELETE:", err);
      res.status(500).json({ error: "Error al eliminar" });
    }
  }

  static async convertir(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const venta = await prisma.$transaction(async (tx) => {
        const lista = await tx.listaEspera.findUnique({
          where: { listaId: id },
          include: { ubicacion: true },
        });
        if (!lista) return null;

        const cantidad = Math.trunc(Number(lista.cantidad) || 0);
        const precio = Number(lista.precioVenta) || 0;
        const total = cantidad * precio;
        const granjaNombre = lista.ubicacion?.nombre ?? "";
        const empresa = inferirEmpresa(granjaNombre);
        const tipoVenta = lista.uapAsignada === "ALEVIN" ? "ALEVINES" : (lista.uapAsignada ?? "");

        const ventaNueva = await tx.venta.create({
          data: {
            folio: `LE-${id}`,
            fechaVenta: lista.fechaEntrega,
            cliente: lista.cliente ?? "",
            tipoVenta,
            cantidadVendida: cantidad,
            precioVenta: precio,
            montoTotal: total,
            abonado: 0,
            adeudo: total,
            estadoPago: "ADEUDO",
            empresa,
            encargadoVenta: lista.encargadoVenta ?? null,
          },
        });

        await tx.listaEspera.delete({ where: { listaId: id } });
        return ventaNueva;
      });

      if (!venta) return res.status(404).json({ error: "Registro no encontrado" });

      res.json({
        mensaje: "Convertido en venta real correctamente",
        venta_id: venta.ventaId,
        data: serializeVenta(venta),
      });
    } catch (err) {
      console.error("Error al convertir:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ListaEsperaController;

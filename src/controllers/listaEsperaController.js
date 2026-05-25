import prisma from "../prisma.js";
import { serializeListaEspera, serializeVenta } from "../utils/serializers.js";
import {
  etapaRequeridaParaTipoVenta,
  registrarVentaTrazabilidad,
  ventaRequiereTrazabilidad,
} from "../utils/trazabilidadInventario.js";

// ListaEspera persiste datos del formulario Próximas Ventas incluyendo pileta_origen_id
// para trazabilidad al convertir a venta real.

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizarTipoVenta(raw) {
  const t = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (t === "ALEVIN" || t === "ALEVINES") return "ALEVINES";
  if (t === "KG" || t === "MOJARRA_KG" || t === "MOJARRA") return "MOJARRA_KG";
  return t || null;
}

function parseFechaEntrega(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error("fecha_entrega invalida");
  }
  return d;
}

function buildPayloadFromBody(body) {
  const clienteNombre = pick(body, "cliente_nombre", "fc_cliente", "cliente");
  if (!clienteNombre) {
    throw new Error("cliente_nombre es obligatorio");
  }

  const fechaEntrega = parseFechaEntrega(pick(body, "fecha_entrega", "fd_fecha_entrega"));
  if (!fechaEntrega) {
    throw new Error("fecha_entrega es obligatoria");
  }

  const tipoRaw = pick(body, "tipo_venta", "fc_uap_asignada", "fc_tipo_venta");
  const tipoVenta = normalizarTipoVenta(tipoRaw);
  const piletaOrigenId = toInt(
    pick(body, "pileta_origen_id", "origen_pileta_id", "fi_pileta_origen_id"),
  );

  if (ventaRequiereTrazabilidad(tipoVenta) && !piletaOrigenId) {
    throw new Error("pileta_origen_id es obligatorio para ventas de alevines o mojarra");
  }

  const lugar = pick(body, "lugar_entrega", "fc_lugar_entrega");
  if (!lugar) {
    throw new Error("lugar_entrega es obligatorio");
  }

  const unidadProduccion = pick(body, "unidad_produccion", "fc_unidad_produccion");
  if (!unidadProduccion) {
    throw new Error("unidad_produccion es obligatoria");
  }

  const horaEmbolsado = pick(body, "hora_embolsado", "fc_hora_embolsado");
  if (!horaEmbolsado) {
    throw new Error("hora_embolsado es obligatoria");
  }

  const horaEntrega = pick(body, "hora_entrega", "fc_hora_entrega");
  if (!horaEntrega) {
    throw new Error("hora_entrega es obligatoria");
  }

  const cantidad = toInt(pick(body, "cantidad_peces", "fn_cantidad", "cantidad"));
  if (!cantidad || cantidad <= 0) {
    throw new Error("cantidad es obligatoria y debe ser mayor a cero");
  }

  const precio = toDecimal(pick(body, "precio_unitario", "fn_precio_venta", "precio_venta"));
  if (precio == null || precio < 0) {
    throw new Error("precio_unitario es obligatorio");
  }

  const granja = pick(body, "granja", "fc_granja_asignada", "fc_granja");
  if (!granja) {
    throw new Error("granja es obligatoria");
  }

  if (!tipoVenta) {
    throw new Error("tipo_venta es obligatorio");
  }

  return {
    cliente_id: toInt(pick(body, "cliente_id", "fi_cliente_id")),
    cliente_nombre: String(clienteNombre),
    cantidad_peces: cantidad,
    precio_unitario: precio,
    tipo_venta: tipoVenta,
    granja: String(granja),
    fecha_entrega: fechaEntrega,
    lugar_entrega: String(lugar),
    unidad_produccion: String(unidadProduccion),
    hora_embolsado: String(horaEmbolsado),
    hora_entrega: String(horaEntrega),
    encargado_venta: pick(body, "encargado_venta", "fc_encargado_venta") ?? null,
    pileta_origen_id: piletaOrigenId,
    notas: pick(body, "notas", "fc_notas", "fc_observaciones") ?? null,
    estatus: pick(body, "estatus", "fc_estatus") ?? "PENDIENTE",
  };
}

class ListaEsperaController {
  static async getAll(req, res) {
    try {
      const lista = await prisma.listaEspera.findMany({
        include: { clientes: true, pileta_origen: true },
        orderBy: { id: "desc" },
      });
      res.json(lista.map(serializeListaEspera));
    } catch (err) {
      console.error("Error al obtener lista de espera:", err);
      res.status(500).json({ error: "Error al obtener lista de espera" });
    }
  }

  static async create(req, res) {
    try {
      const data = buildPayloadFromBody(req.body);
      const creado = await prisma.listaEspera.create({
        data,
        include: { clientes: true, pileta_origen: true },
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
      const data = buildPayloadFromBody(req.body);
      await prisma.listaEspera.update({
        where: { id },
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
      await prisma.listaEspera.delete({ where: { id } });
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

    const piletaOrigenIdBody = toInt(
      pick(req.body, "pileta_origen_id", "origen_pileta_id", "fi_pileta_origen_id"),
    );

    try {
      const venta = await prisma.$transaction(async (tx) => {
        const lista = await tx.listaEspera.findUnique({ where: { id } });
        if (!lista) return null;

        const cantidad = Math.trunc(Number(lista.cantidad_peces) || 0);
        const precio = Number(lista.precio_unitario) || 0;
        const total = cantidad * precio;
        const tipoVenta = normalizarTipoVenta(lista.tipo_venta) ?? "ALEVINES";
        const piletaOrigenId = piletaOrigenIdBody ?? lista.pileta_origen_id ?? null;

        if (ventaRequiereTrazabilidad(tipoVenta)) {
          if (!piletaOrigenId) {
            const err = new Error(
              "pileta_origen_id es obligatorio para convertir ventas de alevines o mojarra",
            );
            err.code = "VALIDACION";
            throw err;
          }
          const etapa = etapaRequeridaParaTipoVenta(tipoVenta);
          const pil = await tx.pileta.findUnique({
            where: { id: piletaOrigenId },
            select: { id: true, tipo: true, nombre: true },
          });
          if (!pil) {
            const err = new Error("Pileta de origen no existe");
            err.code = "PILETA_NOT_FOUND";
            throw err;
          }
          if (pil.tipo !== etapa) {
            const err = new Error(
              `La pileta '${pil.nombre}' debe ser tipo ${etapa} para este tipo de venta`,
            );
            err.code = "PILETA_TIPO_INVALIDO";
            throw err;
          }
        }

        const ventaNueva = await tx.venta.create({
          data: {
            folio: `LE-${id}`,
            fecha: new Date(),
            cliente_nombre: lista.cliente_nombre,
            tipoVenta,
            cantidad,
            precio_unitario: precio,
            montoTotal: total,
            monto_abonado: 0,
            estadoPago: "ADEUDO",
            empresa: lista.granja ?? "QUALITY",
            vendedor_nombre: null,
            usuario_id: req.user.usuario_id,
          },
        });

        if (ventaRequiereTrazabilidad(tipoVenta)) {
          await registrarVentaTrazabilidad(tx, {
            piletaOrigenId,
            cantidad,
            ventaId: ventaNueva.id,
            usuarioId: req.user.usuario_id,
            tipoVenta,
            observacion: lista.notas,
            fechaMovimiento: ventaNueva.fecha,
          });
        }

        await tx.listaEspera.delete({ where: { id } });
        return ventaNueva;
      });

      if (!venta) return res.status(404).json({ error: "Registro no encontrado" });

      res.json({
        mensaje: "Convertido en venta real correctamente",
        venta_id: venta.id,
        data: serializeVenta(venta),
      });
    } catch (err) {
      if (
        err.code === "VALIDACION" ||
        err.code === "PILETA_TIPO_INVALIDO" ||
        err.code === "PILETA_NOT_FOUND"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "ALEV_CANTIDAD_INSUFICIENTE" || err.code === "ENGORDA_CANTIDAD_INSUFICIENTE") {
        return res.status(400).json({ error: err.message });
      }
      console.error("Error al convertir:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ListaEsperaController;

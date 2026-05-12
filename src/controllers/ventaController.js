import prisma from "../prisma.js";
import { serializeVenta } from "../utils/serializers.js";

function sanitize(value) {
  if (!value) return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calcularEstado(total, abonado) {
  if (abonado <= 0) return "ADEUDO";
  if (abonado < total) return "PARCIAL";
  return "PAGADO";
}

async function crearObservacionSiHay(tx, texto, usuarioId) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const obs = await tx.observacion.create({
    data: {
      observacion: String(texto).slice(0, 500),
      usuarioId: usuarioId ?? null,
    },
  });
  return obs.observacionId;
}

class VentaController {
  static async getClientes(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        select: { clienteId: true, razonSocial: true },
        orderBy: { razonSocial: "asc" },
      });
      res.json(clientes.map((c) => ({ id: c.clienteId, nombre: c.razonSocial })));
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getEncargados(req, res) {
    try {
      const { empresa } = req.params;
      const empresaNorm = String(empresa || "").toUpperCase();
      if (!["MEDELLIN", "CEIBA"].includes(empresaNorm)) {
        return res.json([]);
      }

      const empleados = await prisma.empleado.findMany({
        where: { activo: true },
        select: {
          empleadoId: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      const result = empleados
        .map((e) => ({
          id: e.empleadoId,
          nombre: [e.nombre, e.apellidoPaterno, e.apellidoMaterno]
            .filter(Boolean)
            .join(" "),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      res.json(result);
    } catch (err) {
      console.error("Error al obtener encargados:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const ventas = await prisma.venta.findMany({
        include: { observacion: true },
        orderBy: [{ fechaVenta: "desc" }, { ventaId: "desc" }],
      });
      res.json(ventas.map(serializeVenta));
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        fc_folio,
        fd_fecha_venta,
        fc_cliente,
        fc_tipo_venta,
        fc_encargado_venta,
        fc_observaciones,
        fc_empresa,
      } = req.body;

      const cantidadVendida = sanitize(req.body.fn_cantidad_vendida);
      const precioVenta = sanitize(req.body.fn_precio_venta);
      const abonado = sanitize(req.body.fn_abonado);

      if (!fc_cliente) return res.status(400).json({ error: "Cliente obligatorio" });
      if (!fc_encargado_venta) return res.status(400).json({ error: "Encargado obligatorio" });
      if (cantidadVendida <= 0 || precioVenta <= 0) {
        return res.status(400).json({ error: "Cantidad o precio invalidos" });
      }

      const fechaVenta = toDateOrNull(fd_fecha_venta) ?? new Date();
      const montoTotal = cantidadVendida * precioVenta;
      const estadoPago = calcularEstado(montoTotal, abonado);
      const adeudo = Math.max(montoTotal - abonado, 0);

      const venta = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, fc_observaciones, req.user.usuario_id);
        return tx.venta.create({
          data: {
            folio: fc_folio ?? null,
            fechaVenta,
            cliente: String(fc_cliente),
            tipoVenta: String(fc_tipo_venta ?? ""),
            cantidadVendida,
            precioVenta,
            montoTotal,
            abonado,
            adeudo,
            estadoPago,
            empresa: String(fc_empresa ?? ""),
            encargadoVenta: fc_encargado_venta ?? null,
            observacionId: obsId,
          },
          include: { observacion: true },
        });
      });

      res.status(201).json({
        mensaje: "Venta registrada correctamente",
        data: serializeVenta(venta),
      });
    } catch (err) {
      console.error("Error al registrar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const {
        fc_folio,
        fd_fecha_venta,
        fc_cliente,
        fc_tipo_venta,
        fc_encargado_venta,
        fc_observaciones,
        fc_empresa,
      } = req.body;

      const cantidadVendida = sanitize(req.body.fn_cantidad_vendida);
      const precioVenta = sanitize(req.body.fn_precio_venta);
      const abonado = sanitize(req.body.fn_abonado);

      const montoTotal = cantidadVendida * precioVenta;
      const estadoPago = calcularEstado(montoTotal, abonado);
      const adeudo = Math.max(montoTotal - abonado, 0);

      const venta = await prisma.$transaction(async (tx) => {
        const updateData = {
          folio: fc_folio ?? null,
          fechaVenta: toDateOrNull(fd_fecha_venta) ?? undefined,
          cliente: fc_cliente ?? undefined,
          tipoVenta: fc_tipo_venta ?? undefined,
          cantidadVendida,
          precioVenta,
          montoTotal,
          abonado,
          adeudo,
          estadoPago,
          empresa: fc_empresa ?? undefined,
          encargadoVenta: fc_encargado_venta ?? null,
        };
        if (fc_observaciones !== undefined) {
          const obsId = await crearObservacionSiHay(tx, fc_observaciones, req.user.usuario_id);
          if (obsId) updateData.observacionId = obsId;
        }
        return tx.venta.update({
          where: { ventaId: id },
          data: updateData,
          include: { observacion: true },
        });
      });

      res.json({ mensaje: "Venta actualizada correctamente", data: serializeVenta(venta) });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Venta no encontrada" });
      console.error("Error al actualizar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.venta.delete({ where: { ventaId: id } });
      res.json({ mensaje: "Venta eliminada" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Venta no encontrada" });
      console.error("Error al eliminar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default VentaController;

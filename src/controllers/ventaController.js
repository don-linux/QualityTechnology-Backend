import prisma from "../prisma.js";
import { serializeVenta } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";

// Venta en el schema actual renombra varios campos: cliente -> cliente_nombre,
// cantidadVendida -> cantidad, precioVenta -> precio_unitario, abonado ->
// monto_abonado, encargadoVenta -> vendedor_nombre, fechaVenta -> fecha,
// usuarioId -> usuario_id (campo JS directo, sin @map). monto_adeudo se
// calcula en la DB. Aceptamos los aliases fc_/fn_/fd_ por compatibilidad.

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

class VentaController {
  static async getClientes(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      });
      res.json(clientes.map((c) => ({ id: c.id, nombre: c.nombre })));
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
        where: { esta_activo: true },
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      const result = empleados
        .map((e) => ({
          id: e.id,
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
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
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

      const clienteNombre = req.body.cliente_nombre ?? fc_cliente;
      const empresa = req.body.empresa ?? fc_empresa;
      const tipoVenta = req.body.tipo_venta ?? fc_tipo_venta;
      const vendedor = req.body.vendedor_nombre ?? fc_encargado_venta;
      const folio = req.body.folio ?? fc_folio;
      const fechaIn = req.body.fecha ?? fd_fecha_venta;
      const observaciones = req.body.observaciones ?? fc_observaciones;

      const cantidad = sanitize(req.body.cantidad ?? req.body.fn_cantidad_vendida);
      const precioUnitario = sanitize(req.body.precio_unitario ?? req.body.fn_precio_venta);
      const montoAbonado = sanitize(req.body.monto_abonado ?? req.body.fn_abonado);

      if (!clienteNombre) return res.status(400).json({ error: "cliente_nombre obligatorio" });
      if (!empresa) return res.status(400).json({ error: "empresa obligatoria" });
      if (cantidad <= 0 || precioUnitario <= 0) {
        return res.status(400).json({ error: "cantidad o precio_unitario invalidos" });
      }

      const fecha = toDateOrNull(fechaIn) ?? new Date();
      const montoTotal = cantidad * precioUnitario;
      const estadoPago = calcularEstado(montoTotal, montoAbonado);

      const venta = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, observaciones, req.user.usuario_id);
        return tx.venta.create({
          data: {
            folio: folio ?? null,
            fecha,
            cliente_nombre: String(clienteNombre),
            tipoVenta: String(tipoVenta ?? ""),
            cantidad,
            precio_unitario: precioUnitario,
            montoTotal,
            monto_abonado: montoAbonado,
            estadoPago,
            empresa: String(empresa),
            vendedor_nombre: vendedor ?? null,
            observacionId: obsId,
            usuario_id: req.user.usuario_id,
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
      const cantidad = sanitize(req.body.cantidad ?? req.body.fn_cantidad_vendida);
      const precioUnitario = sanitize(req.body.precio_unitario ?? req.body.fn_precio_venta);
      const montoAbonado = sanitize(req.body.monto_abonado ?? req.body.fn_abonado);
      const montoTotal = cantidad * precioUnitario;
      const estadoPago = calcularEstado(montoTotal, montoAbonado);

      const folio = req.body.folio ?? req.body.fc_folio;
      const fechaIn = req.body.fecha ?? req.body.fd_fecha_venta;
      const clienteNombre = req.body.cliente_nombre ?? req.body.fc_cliente;
      const tipoVenta = req.body.tipo_venta ?? req.body.fc_tipo_venta;
      const vendedor = req.body.vendedor_nombre ?? req.body.fc_encargado_venta;
      const empresa = req.body.empresa ?? req.body.fc_empresa;
      const observaciones = req.body.observaciones ?? req.body.fc_observaciones;

      const venta = await prisma.$transaction(async (tx) => {
        const updateData = {
          folio: folio ?? null,
          fecha: toDateOrNull(fechaIn) ?? undefined,
          cliente_nombre: clienteNombre ?? undefined,
          tipoVenta: tipoVenta ?? undefined,
          cantidad,
          precio_unitario: precioUnitario,
          montoTotal,
          monto_abonado: montoAbonado,
          estadoPago,
          empresa: empresa ?? undefined,
          vendedor_nombre: vendedor ?? null,
        };
        if (observaciones !== undefined) {
          const obsId = await crearObservacionSiHay(tx, observaciones, req.user.usuario_id);
          if (obsId) updateData.observacionId = obsId;
        }
        return tx.venta.update({
          where: { id },
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
      await prisma.venta.delete({ where: { id } });
      res.json({ mensaje: "Venta eliminada" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Venta no encontrada" });
      console.error("Error al eliminar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default VentaController;

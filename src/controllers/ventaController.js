import prisma from "../prisma.js";
import { serializeFlujoCaja, serializeVenta } from "../utils/serializers.js";

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

function calcularMes(value) {
  if (!value) return null;
  const s = String(value);
  return s.length >= 7 ? s.slice(0, 7) : null;
}

function redondearMonto(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function calcularEstadoPago(montoTotal, montoAbonado) {
  const total = redondearMonto(montoTotal);
  const abonado = redondearMonto(montoAbonado);
  if (abonado <= 0) return "ADEUDO";
  if (abonado >= total) return "LIQUIDADO";
  return "PARCIAL";
}

function descripcionPago(venta, nota) {
  const folio = venta.folio ? `Folio ${venta.folio}` : `Venta #${venta.id}`;
  const base = `Pago de venta — ${folio}`;
  const extra = nota?.trim?.() ? String(nota).trim() : "";
  return extra ? `${base} — ${extra}` : base;
}

class VentaController {
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

  static async getPagos(req, res) {
    const ventaId = toInt(req.params.id);
    if (!ventaId) return res.status(400).json({ error: "id invalido" });

    try {
      const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

      const pagos = await prisma.flujoCaja.findMany({
        where: { venta_id: ventaId },
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
      });
      res.json(pagos.map(serializeFlujoCaja));
    } catch (err) {
      console.error("Error al obtener pagos de venta:", err);
      res.status(500).json({ error: "Error al obtener pagos de la venta" });
    }
  }

  static async registrarPago(req, res) {
    const ventaId = toInt(req.params.id);
    if (!ventaId) return res.status(400).json({ error: "id invalido" });

    const monto = toDecimal(req.body.fn_monto ?? req.body.monto);
    const cuentaNombre = req.body.fc_cuenta ?? req.body.cuenta_nombre ?? null;
    const fechaParsed = toDateOrNull(req.body.fd_fecha ?? req.body.fecha) ?? new Date();
    const nota = req.body.fc_descripcion ?? req.body.descripcion ?? null;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a cero" });
    }
    if (!cuentaNombre) {
      return res.status(400).json({ error: "La cuenta es obligatoria" });
    }

    try {
      const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

      const adeudo = redondearMonto(venta.monto_adeudo);
      const montoPago = redondearMonto(monto);
      if (montoPago > adeudo) {
        return res.status(400).json({
          error: `El monto excede el adeudo. Adeudo actual: $${adeudo.toFixed(2)}.`,
        });
      }

      const cuenta = await prisma.cuenta.findFirst({
        where: { nombre: String(cuentaNombre), esta_activa: true },
      });
      if (!cuenta) {
        return res.status(400).json({ error: "La cuenta seleccionada no existe o no esta activa." });
      }

      const nuevoAbonado = redondearMonto(Number(venta.monto_abonado) + montoPago);
      const nuevoEstado = calcularEstadoPago(venta.montoTotal, nuevoAbonado);
      const saldoActual = redondearMonto(Number(cuenta.saldoActual) + montoPago);
      const mes = calcularMes(fechaParsed);

      const resultado = await prisma.$transaction(async (tx) => {
        const movimiento = await tx.flujoCaja.create({
          data: {
            fecha: fechaParsed,
            ingreso: montoPago,
            egreso: 0,
            descripcion: descripcionPago(venta, nota),
            cuenta_nombre: String(cuentaNombre),
            categoria: "VENTAS",
            subcategoria: venta.tipoVenta,
            beneficiario: venta.cliente_nombre,
            estatus: nuevoEstado,
            mes_periodo: mes,
            usuario_id: req.user.usuario_id,
            venta_id: ventaId,
          },
        });

        await tx.cuenta.update({
          where: { id: cuenta.id },
          data: { saldoActual },
        });

        const ventaActualizada = await tx.venta.update({
          where: { id: ventaId },
          data: {
            monto_abonado: nuevoAbonado,
            estadoPago: nuevoEstado,
          },
          include: { observacion: true },
        });

        return { movimiento, ventaActualizada };
      });

      res.status(201).json({
        mensaje: "Pago registrado correctamente",
        venta: serializeVenta(resultado.ventaActualizada),
        movimiento: serializeFlujoCaja(resultado.movimiento),
        nuevoSaldo: saldoActual,
      });
    } catch (err) {
      console.error("Error al registrar pago de venta:", err);
      res.status(500).json({ error: "Error al registrar pago de venta" });
    }
  }

  static async anularPago(req, res) {
    const ventaId = toInt(req.params.id);
    const movId = toInt(req.params.movId);
    if (!ventaId || !movId) return res.status(400).json({ error: "id invalido" });

    try {
      const movimiento = await prisma.flujoCaja.findUnique({ where: { id: movId } });
      if (!movimiento || movimiento.venta_id !== ventaId) {
        return res.status(404).json({ error: "Pago no encontrado para esta venta" });
      }

      const ingreso = redondearMonto(movimiento.ingreso);
      if (ingreso <= 0) {
        return res.status(400).json({ error: "El movimiento no es un pago de ingreso valido" });
      }

      const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
      if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

      const abonadoActual = redondearMonto(venta.monto_abonado);
      if (ingreso > abonadoActual) {
        return res.status(400).json({ error: "No se puede anular: el abono registrado es inconsistente" });
      }

      const cuentaNombre = movimiento.cuenta_nombre;
      if (!cuentaNombre) {
        return res.status(400).json({ error: "El pago no tiene cuenta asociada" });
      }

      const cuenta = await prisma.cuenta.findFirst({
        where: { nombre: String(cuentaNombre), esta_activa: true },
      });
      if (!cuenta) {
        return res.status(400).json({ error: "La cuenta del pago ya no existe o no esta activa" });
      }

      const saldoActual = redondearMonto(Number(cuenta.saldoActual));
      if (ingreso > saldoActual) {
        return res.status(400).json({
          error: `Saldo insuficiente en "${cuentaNombre}" para anular el pago. Disponible: $${saldoActual.toFixed(2)}.`,
        });
      }

      const nuevoAbonado = redondearMonto(abonadoActual - ingreso);
      const nuevoEstado = calcularEstadoPago(venta.montoTotal, nuevoAbonado);
      const nuevoSaldo = redondearMonto(saldoActual - ingreso);

      const ventaActualizada = await prisma.$transaction(async (tx) => {
        await tx.cuenta.update({
          where: { id: cuenta.id },
          data: { saldoActual: nuevoSaldo },
        });

        const actualizada = await tx.venta.update({
          where: { id: ventaId },
          data: {
            monto_abonado: nuevoAbonado,
            estadoPago: nuevoEstado,
          },
          include: { observacion: true },
        });

        await tx.flujoCaja.delete({ where: { id: movId } });
        return actualizada;
      });

      res.json({
        mensaje: "Pago anulado correctamente",
        venta: serializeVenta(ventaActualizada),
        nuevoSaldo,
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Pago no encontrado" });
      console.error("Error al anular pago de venta:", err);
      res.status(500).json({ error: "Error al anular pago de venta" });
    }
  }
}

export default VentaController;

import prisma from "../prisma.js";
import { serializeFlujoCaja } from "../utils/serializers.js";
import { resolverUbicacion } from "../utils/ubicacion.js";

// FlujoCaja en el schema actual renombra `cuenta` -> `cuenta_nombre` y `mes`
// -> `mes_periodo`. Los campos `noproyecto` y `factura` ya no existen y se
// ignoran. El flujo de caja ya no se separa por ubicacion: `ubicacion_id` es
// opcional y `getAll` lista todos los movimientos.

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

function calcularMes(value) {
  if (!value) return null;
  const s = String(value);
  return s.length >= 7 ? s.slice(0, 7) : null;
}

class FlujoCajaController {
  static async getClientes(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        select: { nombre: true },
        orderBy: { nombre: "asc" },
      });
      res.json(clientes.map((c) => ({ nombre: c.nombre })));
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  static async getProveedores(req, res) {
    try {
      const proveedores = await prisma.proveedor.findMany({
        select: { nombre: true },
        orderBy: { nombre: "asc" },
      });
      res.json(proveedores.map((p) => ({ nombre: p.nombre })));
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  }

  static async getAll(req, res) {
    try {
      const movimientos = await prisma.flujoCaja.findMany({
        include: { ubicacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(movimientos.map(serializeFlujoCaja));
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);

      const movimientos = await prisma.flujoCaja.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { ubicacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(movimientos.map(serializeFlujoCaja));
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  static async create(req, res) {
    try {
      const {
        fd_fecha,
        fc_observaciones,
        fc_cuenta,
        fc_categoria,
        fc_subcategoria,
        fc_beneficiario,
        fc_estatus,
      } = req.body;

      const fechaParsed = toDateOrNull(fd_fecha);
      if (!fechaParsed) return res.status(400).json({ error: "fd_fecha invalida" });

      if (fc_observaciones != null && String(fc_observaciones).length > 500) {
        return res.status(400).json({ error: "Las observaciones no pueden exceder 500 caracteres" });
      }

      const ingreso = Math.max(toDecimal(req.body.fn_ingreso) ?? 0, 0);
      const egreso = Math.max(toDecimal(req.body.fn_egreso) ?? 0, 0);

      const cuenta = await prisma.cuenta.findFirst({
        where: { nombre: String(fc_cuenta ?? ""), esta_activa: true },
      });
      if (!cuenta) {
        return res.status(400).json({ error: "La cuenta seleccionada no existe." });
      }

      let saldoActual = Number(cuenta.saldoActual);
      if (egreso > 0) {
        if (egreso > saldoActual) {
          return res.status(400).json({
            error: `Saldo insuficiente en "${fc_cuenta}". Disponible: $${saldoActual.toFixed(2)}.`,
          });
        }
        saldoActual -= egreso;
      }
      if (ingreso > 0) {
        saldoActual += ingreso;
      }

      const mes = calcularMes(fd_fecha);

      const movimiento = await prisma.$transaction(async (tx) => {
        const creado = await tx.flujoCaja.create({
          data: {
            fecha: fechaParsed,
            ingreso,
            egreso,
            observaciones: fc_observaciones ?? null,
            cuenta_nombre: fc_cuenta ?? null,
            categoria: fc_categoria ?? null,
            subcategoria: fc_subcategoria ?? null,
            beneficiario: fc_beneficiario ?? null,
            estatus: fc_estatus ?? null,
            mes_periodo: mes,
            usuario_id: req.user.usuario_id,
          },
          include: { ubicacion: true },
        });
        await tx.cuenta.update({
          where: { id: cuenta.id },
          data: { saldoActual },
        });
        return creado;
      });

      res.status(201).json({
        mensaje: "Movimiento registrado correctamente",
        movimiento: serializeFlujoCaja(movimiento),
        nuevoSaldo: saldoActual,
      });
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      res.status(500).json({ error: "Error al registrar movimiento" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const existente = await prisma.flujoCaja.findUnique({
        where: { id },
        select: { venta_id: true },
      });
      if (!existente) return res.status(404).json({ error: "Movimiento no encontrado" });
      if (existente.venta_id != null) {
        return res.status(400).json({
          error: "Este movimiento es un pago de venta; gestionalo desde Control de Ventas",
        });
      }

      const {
        fd_fecha,
        fc_observaciones,
        fc_cuenta,
        fc_categoria,
        fc_subcategoria,
        fc_beneficiario,
        fc_estatus,
      } = req.body;

      if (fc_observaciones != null && String(fc_observaciones).length > 500) {
        return res.status(400).json({ error: "Las observaciones no pueden exceder 500 caracteres" });
      }

      const updateData = {};
      const fechaParsed = toDateOrNull(fd_fecha);
      if (fechaParsed) {
        updateData.fecha = fechaParsed;
        updateData.mes_periodo = calcularMes(fd_fecha);
      }
      if (req.body.fn_ingreso !== undefined) {
        updateData.ingreso = Math.max(toDecimal(req.body.fn_ingreso) ?? 0, 0);
      }
      if (req.body.fn_egreso !== undefined) {
        updateData.egreso = Math.max(toDecimal(req.body.fn_egreso) ?? 0, 0);
      }
      if (fc_observaciones !== undefined) updateData.observaciones = fc_observaciones ?? null;
      if (fc_cuenta !== undefined) updateData.cuenta_nombre = fc_cuenta ?? null;
      if (fc_categoria !== undefined) updateData.categoria = fc_categoria ?? null;
      if (fc_subcategoria !== undefined) updateData.subcategoria = fc_subcategoria ?? null;
      if (fc_beneficiario !== undefined) updateData.beneficiario = fc_beneficiario ?? null;
      if (fc_estatus !== undefined) updateData.estatus = fc_estatus ?? null;

      const movimiento = await prisma.flujoCaja.update({
        where: { id },
        data: updateData,
        include: { ubicacion: true },
      });
      res.json(serializeFlujoCaja(movimiento));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Movimiento no encontrado" });
      console.error("Error al actualizar movimiento:", err);
      res.status(500).json({ error: "Error al actualizar movimiento" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const existente = await prisma.flujoCaja.findUnique({
        where: { id },
        select: { venta_id: true },
      });
      if (!existente) return res.status(404).json({ error: "Movimiento no encontrado" });
      if (existente.venta_id != null) {
        return res.status(400).json({
          error: "Este movimiento es un pago de venta; gestionalo desde Control de Ventas",
        });
      }

      await prisma.flujoCaja.delete({ where: { id } });
      res.sendStatus(204);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Movimiento no encontrado" });
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  }
}

export default FlujoCajaController;

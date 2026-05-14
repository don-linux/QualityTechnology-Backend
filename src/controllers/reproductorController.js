import prisma from "../prisma.js";
import { serializeReproductor } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";

// El schema actual reemplaza la relacion Reproductor->Instalacion (con
// ubicacion) por una relacion 1-1 Reproductor<->Pileta (la pileta tiene
// ubicacionId). Tampoco existe `trazaReproductor` ni fechas de siembra y
// biometria en el modelo: se reemplazaron por FKs siembra_id y biometria_id.
// Trazabilidad de movimientos se expone vía registros `siembra`; el endpoint
// de instalaciones heredado sigue en 501 hasta rediseño.

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calcularRatio(machos, hembras) {
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    return `1:${Math.round(r * 100) / 100}`;
  }
  return null;
}

/** Sincroniza `Pileta.estado` en el módulo de piletas físicas (vacía / ocupada). */
async function aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal) {
  const id = toInt(piletaId);
  if (!id) return;
  const estado = cantidadTotal > 0 ? "ocupada" : "vacia";
  await tx.pileta.update({
    where: { id },
    data: { estado },
  });
}

/** Ingreso/traslado hacia pileta destino repro (tabla movimientos = `siembra`). Origen opcional (= externo si null). */
async function crearSiembraMovimientoReproductor(tx, { piletaOrigenId, piletaDestinoId, cantidadEntera, usuarioId }) {
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidadEntera) || 0);
  if (!dest || cant <= 0) return null;

  let origen = piletaOrigenId !== undefined && piletaOrigenId !== null && piletaOrigenId !== "" ? toInt(piletaOrigenId) : null;
  if (origen !== null && origen === dest) origen = null;

  const s = await tx.siembra.create({
    data: {
      pileta_origen: origen,
      pileta_destino: dest,
      cantidad: BigInt(cant),
      mortalidad: 0,
      usuario_id: usuarioId,
    },
  });
  return s.id;
}

/** Descuenta organismo en pileta interna que alimentó el destino (traslado). Si todo sale → borra repro y pileta vacía. */
async function consumirInventarioOrigenPorTraslado(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidadMovida, excludeReproductorId },
) {
  const ori = toInt(piletaOrigenId);
  const dest = toInt(piletaDestinoId);
  const mov = Math.floor(Number(cantidadMovida) || 0);
  if (!ori || !dest || ori === dest || mov <= 0) return;

  const repOrig = await tx.reproductor.findUnique({
    where: { pileta_id: ori },
    select: { id: true, machos: true, hembras: true, cantidad_total: true },
  });
  if (!repOrig) return;
  if (excludeReproductorId != null && repOrig.id === excludeReproductorId) return;

  const m0 = repOrig.machos;
  const h0 = repOrig.hembras;
  if (m0 + h0 <= 0) return;

  const sacar = Math.min(mov, m0 + h0);

  let m = m0;
  let h = h0;

  if (sacar >= m + h) {
    await tx.reproductor.delete({ where: { id: repOrig.id } });
    await aplicarEstadoPiletaPorCantidad(tx, ori, 0);
    return;
  }

  let rest = sacar;
  while (rest > 0 && m + h > 0) {
    if (m >= h && m > 0) {
      m -= 1;
      rest -= 1;
      continue;
    }
    if (h > 0) {
      h -= 1;
      rest -= 1;
      continue;
    }
    break;
  }
  const cantidadActual = m + h;
  await tx.reproductor.update({
    where: { id: repOrig.id },
    data: {
      machos: m,
      hembras: h,
      cantidad_total: cantidadActual,
      ratio: calcularRatio(m, h),
    },
  });
  await aplicarEstadoPiletaPorCantidad(tx, ori, cantidadActual);
}

const reproductorInclude = {
  piletas: {
    include: {
      ubicacion: true,
      observaciones: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { comentario: true, proceso: true, created_at: true },
      },
    },
  },
  observacion: true,
};

class ReproductorController {
  static async getAll(req, res) {
    try {
      const reproductores = await prisma.reproductor.findMany({
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });
      res.json(reproductores.map(serializeReproductor));
    } catch (err) {
      console.error("Error reproductores:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);
      const reproductores = await prisma.reproductor.findMany({
        where: {
          piletas: ubicClause,
        },
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });
      res.json(reproductores.map(serializeReproductor));
    } catch (err) {
      console.error("Error reproductores por granja:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio" });
      }

      const machos = toInt(pick(req.body, "machos", "fn_machos"), 0) ?? 0;
      const hembras = toInt(pick(req.body, "hembras", "fn_hembras"), 0) ?? 0;
      const cantidadTotal = machos + hembras;
      const ratio = calcularRatio(machos, hembras);
      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion");

      const creado = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "reproductor",
        });

        const origenPiletaId = toInt(
          pick(req.body, "origen_pileta_id", "origenPiletaId", "fi_origen_pileta_id"),
        );
        let siembraId = null;
        if (cantidadTotal > 0) {
          siembraId = await crearSiembraMovimientoReproductor(tx, {
            piletaOrigenId: origenPiletaId,
            piletaDestinoId: piletaId,
            cantidadEntera: cantidadTotal,
            usuarioId,
          });
        }

        const repro = await tx.reproductor.create({
          data: {
            pileta_id: piletaId,
            machos,
            hembras,
            cantidad_total: cantidadTotal,
            talla: toDecimal(pick(req.body, "talla", "fn_talla")),
            ratio,
            linea: pick(req.body, "linea", "fc_linea") ?? null,
            familia: pick(req.body, "familia", "fc_familia") ?? null,
            observacionId: obsId,
            usuarioId,
            ...(siembraId != null ? { siembra_id: siembraId } : {}),
          },
          include: reproductorInclude,
        });
        await aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal);

        await consumirInventarioOrigenPorTraslado(tx, {
          piletaOrigenId: origenPiletaId,
          piletaDestinoId: piletaId,
          cantidadMovida: cantidadTotal,
          excludeReproductorId: repro.id,
        });

        return repro;
      });

      res.status(201).json({
        success: true,
        mensaje: "Reproductor registrado correctamente",
        data: serializeReproductor(creado),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa pileta ya tiene un reproductor asociado" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      console.error("Error registrar reproductor:", err);
      res.status(500).json({ error: "Error al registrar reproductor", detalle: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const antes = await prisma.reproductor.findUnique({
        where: { id },
        select: { pileta_id: true, cantidad_total: true, machos: true, hembras: true },
      });
      if (!antes) return res.status(404).json({ error: "Reproductor no encontrado" });

      const updateData = {};

      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      const machosIn = pick(req.body, "machos", "fn_machos");
      const hembrasIn = pick(req.body, "hembras", "fn_hembras");
      const machos = machosIn !== undefined ? toInt(machosIn, 0) ?? 0 : null;
      const hembras = hembrasIn !== undefined ? toInt(hembrasIn, 0) ?? 0 : null;
      if (machos !== null) updateData.machos = machos;
      if (hembras !== null) updateData.hembras = hembras;

      if (machos !== null || hembras !== null) {
        const finalMachos = machos ?? antes.machos;
        const finalHembras = hembras ?? antes.hembras;
        updateData.cantidad_total = finalMachos + finalHembras;
        updateData.ratio = calcularRatio(finalMachos, finalHembras);
      }

      if (req.body.talla !== undefined || req.body.fn_talla !== undefined) {
        updateData.talla = toDecimal(pick(req.body, "talla", "fn_talla"));
      }
      if (req.body.linea !== undefined || req.body.fc_linea !== undefined) {
        updateData.linea = pick(req.body, "linea", "fc_linea") ?? null;
      }
      if (req.body.familia !== undefined || req.body.fc_familia !== undefined) {
        updateData.familia = pick(req.body, "familia", "fc_familia") ?? null;
      }

      const obsTexto = pick(req.body, "observacion", "fc_observacion");
      const usuarioId = req.user.usuario_id;
      const piletaParaObs = piletaId !== null ? piletaId : null;

      const actualizado = await prisma.$transaction(async (tx) => {
        if (obsTexto !== undefined) {
          const piletaResolver =
            piletaParaObs ??
            (await tx.reproductor.findUnique({
              where: { id },
              select: { pileta_id: true },
            }))?.pileta_id;
          const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
            piletaId: piletaResolver ?? undefined,
            proceso: "reproductor",
          });
          if (obsId) updateData.observacionId = obsId;
        }
        const row = await tx.reproductor.update({
          where: { id },
          data: updateData,
          include: reproductorInclude,
        });

        const piletaActual = row.pileta_id;
        if (antes.pileta_id !== piletaActual) {
          await aplicarEstadoPiletaPorCantidad(tx, antes.pileta_id, 0);
        }
        await aplicarEstadoPiletaPorCantidad(tx, piletaActual, row.cantidad_total);

        const origenPiletaReq = toInt(pick(req.body, "origen_pileta_id", "origenPiletaId", "fi_origen_pileta_id"));
        const mismoDestino = row.pileta_id === antes.pileta_id;
        const cantidadMovimiento = mismoDestino
          ? Math.max(0, row.cantidad_total - antes.cantidad_total)
          : Math.max(0, row.cantidad_total);

        if (cantidadMovimiento > 0) {
          const nuevaSiembraId = await crearSiembraMovimientoReproductor(tx, {
            piletaOrigenId: origenPiletaReq,
            piletaDestinoId: piletaActual,
            cantidadEntera: cantidadMovimiento,
            usuarioId,
          });
          if (nuevaSiembraId != null) {
            await tx.reproductor.update({
              where: { id },
              data: { siembra_id: nuevaSiembraId },
            });
          }

          await consumirInventarioOrigenPorTraslado(tx, {
            piletaOrigenId: origenPiletaReq,
            piletaDestinoId: piletaActual,
            cantidadMovida: cantidadMovimiento,
            excludeReproductorId: id,
          });
        }

        return tx.reproductor.findUnique({
          where: { id },
          include: reproductorInclude,
        });
      });

      res.json({
        success: true,
        mensaje: "Reproductor actualizado correctamente",
        data: serializeReproductor(actualizado),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Reproductor no encontrado" });
      console.error("Error actualizar reproductor:", err);
      res.status(500).json({ error: "Error al actualizar reproductor", detalle: err.message });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const existe = await prisma.reproductor.findUnique({
        where: { id },
        select: { pileta_id: true },
      });
      if (!existe) return res.status(404).json({ error: "Reproductor no encontrado" });

      await prisma.$transaction(async (tx) => {
        await tx.reproductor.delete({ where: { id } });
        await aplicarEstadoPiletaPorCantidad(tx, existe.pileta_id, 0);
      });
      res.json({ success: true, mensaje: "Reproductor eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Reproductor no encontrado" });
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar: el reproductor tiene registros relacionados.",
        });
      }
      console.error("Error eliminar:", err);
      res.status(500).json({ error: "Error al eliminar reproductor" });
    }
  }

  // ---------------------------------------------------------------------------
  // Trazabilidad vía `siembra`: movimientos donde origen o destino es pileta
  // tipo `reproductores` en la ubicación indicada (sustituye `trazaReproductor`).
  // ---------------------------------------------------------------------------
  static async getMovimientos(req, res) {
    try {
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);

      const piletaTipoReprodEnUbic = { ...ubicClause, tipo: "reproductores" };

      const rows = await prisma.siembra.findMany({
        where: {
          OR: [
            { piletas_siembra_pileta_destinoTopiletas: piletaTipoReprodEnUbic },
            { piletas_siembra_pileta_origenTopiletas: piletaTipoReprodEnUbic },
          ],
        },
        include: {
          piletas_siembra_pileta_origenTopiletas: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              ubicacion: { select: { nombre: true } },
            },
          },
          piletas_siembra_pileta_destinoTopiletas: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              ubicacion: { select: { nombre: true } },
            },
          },
          reproductores: {
            orderBy: { updated_at: "desc" },
            take: 1,
            select: {
              observacion: { select: { comentario: true } },
            },
          },
        },
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
        take: 500,
      });

      const payload = rows.map((s) => {
        const pilOr = s.piletas_siembra_pileta_origenTopiletas;
        const pilDest = s.piletas_siembra_pileta_destinoTopiletas;
        const brutas =
          typeof s.cantidad === "bigint" ? Number(s.cantidad) : Number(s.cantidad ?? 0);
        const mortalidad = s.mortalidad ?? 0;
        const netas = Math.max(0, brutas - mortalidad);
        const obsUsuario = s.reproductores?.[0]?.observacion?.comentario?.trim();
        const obsParts = [];
        if (obsUsuario) obsParts.push(obsUsuario);
        if (mortalidad > 0) obsParts.push(`Mortalidad: ${mortalidad}`);

        return {
          fi_movimiento_id: s.id,
          origen: pilOr?.nombre ?? "Externo",
          destino: pilDest?.nombre ?? "—",
          cantidad_trasladada: netas,
          fecha_movimiento: s.fecha,
          observacion: obsParts.length ? obsParts.join(" · ") : null,
          origen_pileta_id: pilOr?.id ?? null,
        };
      });

      res.json(payload);
    } catch (err) {
      console.error("Error movimientos reproductores:", err);
      res.status(500).json({ error: "Error al obtener movimientos de reproductores" });
    }
  }

  static async getInstalaciones(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: Reproductor ya no tiene FK directa a Instalacion.",
    });
  }
}

export default ReproductorController;

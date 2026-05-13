import prisma from "../prisma.js";
import { serializeInstalacion } from "../utils/serializers.js";
import { instalacionWhereFromRequest, resolverUbicacionFlexible } from "../utils/granjaUbicacion.js";

/** instalaciones: nombre, tipo, granja (texto), opcional FK `ubicacion`. */

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function parseUbicacionIdFromBody(body) {
  if (!body || typeof body !== "object") return undefined;
  if ("ubicacion_id" in body) {
    const v = body.ubicacion_id;
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  if ("ubicacionId" in body) {
    const v = body.ubicacionId;
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }
  return undefined;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const incUbicacion = { ubicacion: true };

const ALLOWED_INSTAL_ESTADO = new Set(["vacia", "ocupada"]);

function normalizeInstalEstado(raw) {
  if (raw == null || String(raw).trim() === "") return "vacia";
  const s = String(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return ALLOWED_INSTAL_ESTADO.has(s) ? s : null;
}

class InstalacionController {
  static async getAll(req, res) {
    try {
      const instalaciones = await prisma.instalacion.findMany({
        orderBy: { nombre: "asc" },
        include: incUbicacion,
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granjaPath = req.params.granja ?? "";
      const where = instalacionWhereFromRequest(req, granjaPath);

      if (!where) return res.json([]);

      const instalaciones = await prisma.instalacion.findMany({
        where,
        include: incUbicacion,
        orderBy: { nombre: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por granja:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByTipo(req, res) {
    try {
      const { tipo, granja } = req.params;
      const ubic = instalacionWhereFromRequest(req, granja ?? "");
      const filtros = [];

      if (ubic) filtros.push(ubic);
      if (tipo) {
        filtros.push({ tipo: { contains: String(tipo), mode: "insensitive" } });
      }

      const where = filtros.length === 0 ? {} : filtros.length === 1 ? filtros[0] : { AND: filtros };

      const instalaciones = await prisma.instalacion.findMany({
        where,
        include: incUbicacion,
        orderBy: { nombre: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por tipo:", err);
      res.status(500).json({ error: "Error al obtener instalaciones por tipo" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre", "nombre_instalacion", "nombreInstalacion");
      const tipo = pick(req.body, "tipo", "tipo_instalacion", "tipoInstalacion");
      const capacidadInput = req.body.capacidad;
      const observaciones = pick(req.body, "observaciones");

      const granjaIn = pick(req.body, "granja", "fc_granja");
      let granjaStr = granjaIn !== undefined ? String(granjaIn).trim() : "";

      const ubicParsed = parseUbicacionIdFromBody(req.body);
      let ubicacionId = null;

      if (ubicParsed) {
        const u = await prisma.ubicacion.findUnique({ where: { id: ubicParsed } });
        if (!u) return res.status(400).json({ error: "ubicacion no encontrada" });
        ubicacionId = u.id;
        if (!granjaStr) granjaStr = u.nombre;
      } else if (granjaStr) {
        const flex = await resolverUbicacionFlexible(granjaStr);
        if (flex?.ubicacionId) ubicacionId = flex.ubicacionId;
      }

      if (!nombre || !granjaStr) {
        return res.status(400).json({
          error: "nombre y granja (o ubicacion_id válido) son obligatorios",
        });
      }

      const largo = toDecimal(pick(req.body, "largo"));
      const ancho = toDecimal(pick(req.body, "ancho"));
      const altura = toDecimal(pick(req.body, "altura"));
      if (
        largo === null ||
        ancho === null ||
        altura === null ||
        Number(largo) <= 0 ||
        Number(ancho) <= 0 ||
        Number(altura) <= 0
      ) {
        return res.status(400).json({
          error: "largo, ancho y altura son obligatorios y deben ser mayores que cero",
        });
      }

      const materialRaw = pick(req.body, "material");
      const materialStr =
        materialRaw !== undefined ? String(materialRaw).trim() : "";
      if (!materialStr) {
        return res.status(400).json({ error: "material es obligatorio" });
      }

      const estadoNorm = normalizeInstalEstado(pick(req.body, "estado"));
      if (estadoNorm === null) {
        return res.status(400).json({ error: 'estado debe ser "vacia" u "ocupada"' });
      }

      let usuarioId = undefined;
      const usuarioPick = pick(req.body, "fi_usuario_id", "usuario_id", "usuarioId");
      if (usuarioPick !== undefined && usuarioPick !== null && String(usuarioPick) !== "") {
        const nu = Number(usuarioPick);
        if (!Number.isInteger(nu) || nu <= 0) {
          return res.status(400).json({ error: "usuario_id inválido" });
        }
        const usuarioRow = await prisma.usuario.findUnique({ where: { id: nu } });
        if (!usuarioRow) {
          return res.status(400).json({ error: "usuario no encontrado" });
        }
        usuarioId = nu;
      }

      const capacidad =
        capacidadInput !== undefined && capacidadInput !== null && capacidadInput !== ""
          ? toDecimal(capacidadInput)
          : null;

      const creada = await prisma.instalacion.create({
        data: {
          nombre: String(nombre),
          tipo: tipo ? String(tipo) : null,
          granja: granjaStr,
          largo,
          ancho,
          altura,
          material: materialStr,
          estado: estadoNorm,
          ...(ubicacionId != null ? { ubicacionId } : {}),
          ...(capacidad !== null ? { capacidad } : {}),
          ...(observaciones ? { observaciones: String(observaciones) } : {}),
          ...(usuarioId !== undefined ? { usuarioId } : {}),
        },
        include: incUbicacion,
      });

      res.status(201).json({
        message: "Instalación registrada correctamente.",
        data: serializeInstalacion(creada),
      });
    } catch (err) {
      console.error("Error al registrar instalación:", err);
      if (err.code === "P2003") {
        return res.status(400).json({ error: "No se puede vincular la instalación (referencia inválida)" });
      }
      res.status(500).json({ error: "Error al registrar instalación" });
    }
  }

  static async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const updateData = {};

      const nombre = pick(req.body, "nombre", "nombre_instalacion", "nombreInstalacion");
      if (nombre !== undefined) updateData.nombre = String(nombre);

      const tipo = pick(req.body, "tipo", "tipo_instalacion", "tipoInstalacion");
      if (tipo !== undefined) updateData.tipo = tipo ? String(tipo) : null;

      const ubParsed = parseUbicacionIdFromBody(req.body);
      const granja = pick(req.body, "granja", "fc_granja");

      if (ubParsed !== undefined) {
        if (ubParsed === null) updateData.ubicacionId = null;
        else {
          const u = await prisma.ubicacion.findUnique({ where: { id: ubParsed } });
          if (!u) {
            return res.status(400).json({ error: "ubicacion no encontrada" });
          }
          updateData.ubicacionId = ubParsed;
          if (granja === undefined || !String(granja).trim()) {
            updateData.granja = u.nombre;
          }
        }
      }

      if (granja !== undefined) updateData.granja = String(granja).trim();

      const capacidadIn = req.body.capacidad;
      if (capacidadIn !== undefined) updateData.capacidad = toDecimal(capacidadIn);

      const observaciones = pick(req.body, "observaciones");
      if (observaciones !== undefined) updateData.observaciones = observaciones ? String(observaciones) : null;

      const largoIn = req.body.largo;
      if (largoIn !== undefined) {
        if (largoIn === null || largoIn === "") updateData.largo = null;
        else {
          const d = toDecimal(largoIn);
          if (d === null || Number(d) <= 0) {
            return res.status(400).json({ error: "largo debe ser mayor que cero" });
          }
          updateData.largo = d;
        }
      }

      const anchoIn = req.body.ancho;
      if (anchoIn !== undefined) {
        if (anchoIn === null || anchoIn === "") updateData.ancho = null;
        else {
          const d = toDecimal(anchoIn);
          if (d === null || Number(d) <= 0) {
            return res.status(400).json({ error: "ancho debe ser mayor que cero" });
          }
          updateData.ancho = d;
        }
      }

      const alturaIn = req.body.altura;
      if (alturaIn !== undefined) {
        if (alturaIn === null || alturaIn === "") updateData.altura = null;
        else {
          const d = toDecimal(alturaIn);
          if (d === null || Number(d) <= 0) {
            return res.status(400).json({ error: "altura debe ser mayor que cero" });
          }
          updateData.altura = d;
        }
      }

      const materialUpd = pick(req.body, "material");
      if (materialUpd !== undefined) {
        updateData.material = materialUpd ? String(materialUpd).trim() : null;
      }

      const estadoUpdRaw = pick(req.body, "estado");
      if (estadoUpdRaw !== undefined) {
        const estadoUpd = normalizeInstalEstado(estadoUpdRaw);
        if (estadoUpd === null) {
          return res.status(400).json({ error: 'estado debe ser "vacia" u "ocupada"' });
        }
        updateData.estado = estadoUpd;
      }

      const usuarioUpdPick = pick(req.body, "fi_usuario_id", "usuario_id", "usuarioId");
      if (usuarioUpdPick !== undefined) {
        if (usuarioUpdPick === null || String(usuarioUpdPick) === "") updateData.usuarioId = null;
        else {
          const nu = Number(usuarioUpdPick);
          if (!Number.isInteger(nu) || nu <= 0) {
            return res.status(400).json({ error: "usuario_id inválido" });
          }
          const usuarioRow = await prisma.usuario.findUnique({ where: { id: nu } });
          if (!usuarioRow) return res.status(400).json({ error: "usuario no encontrado" });
          updateData.usuarioId = nu;
        }
      }

      const actualizada = await prisma.instalacion.update({
        where: { id },
        data: updateData,
        include: incUbicacion,
      });

      res.json({
        success: true,
        message: "Instalación actualizada correctamente.",
        data: serializeInstalacion(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      console.error("Error al actualizar instalación:", err);
      res.status(500).json({ error: "Error al actualizar instalación" });
    }
  }

  static async delete(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const lotesAsociados = await prisma.lote.count({ where: { instalacionId: id } });
      if (lotesAsociados > 0) {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene lotes asociados.",
        });
      }

      await prisma.instalacion.delete({ where: { id } });
      res.json({ message: "Instalación eliminada correctamente." });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      if (err.code === "P2003") {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene registros relacionados.",
        });
      }
      console.error("Error al eliminar instalación:", err);
      res.status(500).json({ error: "Error al eliminar instalación" });
    }
  }
}

export default InstalacionController;

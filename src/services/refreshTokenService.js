import crypto from "node:crypto";
import prisma from "../prisma.js";

const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS) || 7;

function generate() {
  return crypto.randomBytes(40).toString("hex");
}

export async function createRefreshToken(usuarioId) {
  const token = generate();
  const fecha_expiracion = new Date();
  fecha_expiracion.setDate(fecha_expiracion.getDate() + REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: { usuarioId, token, fecha_expiracion },
  });
  return token;
}

export async function findValidAndRevoke(token) {
  const stored = await prisma.refreshToken.findFirst({
    where: {
      token,
      es_revocado: false,
      fecha_expiracion: { gt: new Date() },
      usuario: { esta_activo: true },
    },
    include: {
      usuario: { include: { rol: true } },
    },
  });

  if (!stored) return null;

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { es_revocado: true },
  });

  return {
    tokenId: stored.id,
    id: stored.usuario.id,
    nombre: stored.usuario.nombre,
    rolId: stored.usuario.rolId,
    rolNombre: stored.usuario.rol.nombre,
  };
}

export async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { es_revocado: true },
  });
}

export async function revokeAllByUser(usuarioId) {
  await prisma.refreshToken.updateMany({
    where: { usuarioId: Number(usuarioId) },
    data: { es_revocado: true },
  });
}

export async function cleanupExpired() {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [{ fecha_expiracion: { lt: new Date() } }, { es_revocado: true }],
    },
  });
}

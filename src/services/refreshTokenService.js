import crypto from "node:crypto";
import prisma from "../prisma.js";

const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS) || 7;

function generate() {
  return crypto.randomBytes(40).toString("hex");
}

export async function createRefreshToken(usuarioId) {
  const token = generate();
  const expiracion = new Date();
  expiracion.setDate(expiracion.getDate() + REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: { usuarioId, token, expiracion },
  });
  return token;
}

export async function findValidAndRevoke(token) {
  const stored = await prisma.refreshToken.findFirst({
    where: {
      token,
      revocado: false,
      expiracion: { gt: new Date() },
      usuario: { activo: true },
    },
    include: {
      usuario: { include: { rol: true } },
    },
  });

  if (!stored) return null;

  await prisma.refreshToken.update({
    where: { tokenId: stored.tokenId },
    data: { revocado: true },
  });

  return {
    tokenId: stored.tokenId,
    usuarioId: stored.usuario.usuarioId,
    nombre: stored.usuario.nombre,
    rolId: stored.usuario.rolId,
    rolNombre: stored.usuario.rol.nombre,
  };
}

export async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revocado: true },
  });
}

export async function revokeAllByUser(usuarioId) {
  await prisma.refreshToken.updateMany({
    where: { usuarioId: Number(usuarioId) },
    data: { revocado: true },
  });
}

export async function cleanupExpired() {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [{ expiracion: { lt: new Date() } }, { revocado: true }],
    },
  });
}

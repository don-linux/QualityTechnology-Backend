/*
  Warnings:

  - You are about to drop the `reproductores_old` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reproductores_old" DROP CONSTRAINT "reproductores_old_biometria_id_fkey";

-- DropForeignKey
ALTER TABLE "reproductores_old" DROP CONSTRAINT "reproductores_old_observacion_id_fkey";

-- DropForeignKey
ALTER TABLE "reproductores_old" DROP CONSTRAINT "reproductores_old_pileta_id_fkey";

-- DropForeignKey
ALTER TABLE "reproductores_old" DROP CONSTRAINT "reproductores_old_siembra_id_fkey";

-- DropForeignKey
ALTER TABLE "reproductores_old" DROP CONSTRAINT "reproductores_old_usuario_id_fkey";

-- DropTable
DROP TABLE "reproductores_old";

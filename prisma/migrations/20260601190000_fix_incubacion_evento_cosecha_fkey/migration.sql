-- incubacion.evento_cosecha_id debe apuntar a evento_cosecha (modelo Prisma),
-- no a la tabla legacy eventos_cosecha (FK antigua bloqueaba el alta con P2003).
ALTER TABLE "public"."incubacion" DROP CONSTRAINT IF EXISTS "incubacion_evento_cosecha_id_fkey";

ALTER TABLE "public"."incubacion"
  ADD CONSTRAINT "incubacion_evento_cosecha_id_fkey"
  FOREIGN KEY ("evento_cosecha_id") REFERENCES "public"."evento_cosecha"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

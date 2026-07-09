-- Allow lotes linked to piletas (reproductores) instead of legacy instalaciones.
ALTER TABLE "public"."lotes" ALTER COLUMN "instalacion_id" DROP NOT NULL;

ALTER TABLE "public"."lotes" ADD COLUMN "pileta_id" INTEGER;

CREATE INDEX "lotes_pileta_id_idx" ON "public"."lotes"("pileta_id");

ALTER TABLE "public"."lotes" ADD CONSTRAINT "lotes_pileta_id_fkey"
  FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

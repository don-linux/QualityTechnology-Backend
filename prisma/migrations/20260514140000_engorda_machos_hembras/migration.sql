-- Desglose sexual en engorda (cantidad = machos + hembras).
ALTER TABLE "public"."engorda" ADD COLUMN "machos" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "public"."engorda" ADD COLUMN "hembras" INTEGER NOT NULL DEFAULT 0;

UPDATE "public"."engorda"
SET "machos" = GREATEST(0, "cantidad"),
    "hembras" = 0
WHERE "machos" = 0 AND "hembras" = 0 AND "cantidad" > 0;

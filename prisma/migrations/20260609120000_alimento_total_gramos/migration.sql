-- Las medidas de peso pasan a gramos. Los valores existentes ya se capturaban
-- en gramos (solo la etiqueta decia kg), por lo que no se convierten datos.
ALTER TABLE "public"."alimentacion" RENAME COLUMN "total_alimento_kg" TO "total_alimento_gramos";

-- Campos de inventario reproductor por sexo, genética, familia y procedencia

ALTER TABLE "public"."reproductores"
    ADD COLUMN "machos" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "genetica_machos" VARCHAR(60),
    ADD COLUMN "familia_machos" VARCHAR(60),
    ADD COLUMN "procedencia_machos" VARCHAR(100),
    ADD COLUMN "hembras" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "genetica_hembras" VARCHAR(60),
    ADD COLUMN "familia_hembras" VARCHAR(60),
    ADD COLUMN "procedencia_hembras" VARCHAR(100),
    ADD COLUMN "ratio" VARCHAR(20),
    ADD COLUMN "talla" DECIMAL(10, 2);

-- Registros migrados solo con cantidad_total: asignar todo a machos para conservar stock
UPDATE "public"."reproductores"
SET
    "machos" = "cantidad_total",
    "hembras" = 0
WHERE "cantidad_total" > 0
  AND "machos" = 0
  AND "hembras" = 0;

-- CreateTable
CREATE TABLE "catalogos"."areas_instalacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "areas_instalacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos"."faunas_detectadas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "faunas_detectadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos"."evidencias_fauna" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "evidencias_fauna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos"."estados_trampa" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "estados_trampa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogos"."acciones_correctivas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "acciones_correctivas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_instalacion_nombre_key" ON "catalogos"."areas_instalacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "faunas_detectadas_nombre_key" ON "catalogos"."faunas_detectadas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "evidencias_fauna_nombre_key" ON "catalogos"."evidencias_fauna"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_trampa_nombre_key" ON "catalogos"."estados_trampa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "acciones_correctivas_nombre_key" ON "catalogos"."acciones_correctivas"("nombre");

-- Seed inicial
INSERT INTO "catalogos"."areas_instalacion" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Almacen de alimentos', true, CURRENT_TIMESTAMP),
    ('Almacen de herramientas', true, CURRENT_TIMESTAMP),
    ('Area de embolsado', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "catalogos"."faunas_detectadas" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Roedor', true, CURRENT_TIMESTAMP),
    ('Ave', true, CURRENT_TIMESTAMP),
    ('No aplica', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "catalogos"."evidencias_fauna" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Animal vivo', true, CURRENT_TIMESTAMP),
    ('Animal muerto', true, CURRENT_TIMESTAMP),
    ('Excretas', true, CURRENT_TIMESTAMP),
    ('Alimento roido', true, CURRENT_TIMESTAMP),
    ('Daño en malla', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "catalogos"."estados_trampa" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Activa', true, CURRENT_TIMESTAMP),
    ('Inactiva', true, CURRENT_TIMESTAMP),
    ('Con captura', true, CURRENT_TIMESTAMP),
    ('Sin cebo', true, CURRENT_TIMESTAMP),
    ('Fuera de lugar', true, CURRENT_TIMESTAMP),
    ('Dañada', true, CURRENT_TIMESTAMP),
    ('Requiere mantenimiento', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

INSERT INTO "catalogos"."acciones_correctivas" ("nombre", "esta_activo", "updated_at")
VALUES
    ('Retiro de fauna', true, CURRENT_TIMESTAMP),
    ('Mantenimiento de trampa', true, CURRENT_TIMESTAMP),
    ('Limpieza del Area', true, CURRENT_TIMESTAMP),
    ('Cambio de cebo', true, CURRENT_TIMESTAMP)
ON CONFLICT ("nombre") DO NOTHING;

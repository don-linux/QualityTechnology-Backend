DO $$ BEGIN
  CREATE TYPE "public"."TipoCicloAvicola" AS ENUM ('engorda', 'postura', 'patos', 'kikiriki', 'otro');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."EstadoCicloAvicola" AS ENUM ('activo', 'cerrado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_avicola" (
    "id" SERIAL NOT NULL,
    "id_ciclo" VARCHAR(40) NOT NULL,
    "nombre_lote" VARCHAR(120) NOT NULL,
    "tipo" "public"."TipoCicloAvicola" NOT NULL DEFAULT 'engorda',
    "especie" VARCHAR(120) NOT NULL,
    "objetivo" VARCHAR(80),
    "fecha_inicio" DATE NOT NULL,
    "fecha_salida_estimada" DATE,
    "animales_iniciales" INTEGER NOT NULL,
    "responsable" VARCHAR(120),
    "estado" "public"."EstadoCicloAvicola" NOT NULL DEFAULT 'activo',
    "observaciones" VARCHAR(500),
    "ubicacion_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_avicola_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ciclos_avicola_id_ciclo_key" ON "public"."ciclos_avicola"("id_ciclo");
CREATE INDEX IF NOT EXISTS "ciclos_avicola_tipo_idx" ON "public"."ciclos_avicola"("tipo");
CREATE INDEX IF NOT EXISTS "ciclos_avicola_estado_idx" ON "public"."ciclos_avicola"("estado");
CREATE INDEX IF NOT EXISTS "ciclos_avicola_ubicacion_id_idx" ON "public"."ciclos_avicola"("ubicacion_id");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_avicola"
    ADD CONSTRAINT "ciclos_avicola_ubicacion_id_fkey"
    FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_calendario_evento" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE,
    "dia_ciclo" INTEGER,
    "tipo_evento" VARCHAR(80) NOT NULL,
    "actividad" VARCHAR(200) NOT NULL,
    "producto" VARCHAR(120),
    "dosis" VARCHAR(80),
    "responsable" VARCHAR(120),
    "estado_evento" VARCHAR(40) NOT NULL DEFAULT 'Pendiente',
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_calendario_evento_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_calendario_evento_ciclo_avicola_id_idx" ON "public"."ciclos_calendario_evento"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_calendario_evento_fecha_idx" ON "public"."ciclos_calendario_evento"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_calendario_evento"
    ADD CONSTRAINT "ciclos_calendario_evento_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_gasto" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "categoria" VARCHAR(80) NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "unidad" VARCHAR(40) NOT NULL,
    "descripcion" VARCHAR(200),
    "proveedor" VARCHAR(120),
    "precio_unitario" DECIMAL(12,4) NOT NULL,
    "importe_final" DECIMAL(12,2) NOT NULL,
    "metodo_pago" VARCHAR(40),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_gasto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_gasto_ciclo_avicola_id_idx" ON "public"."ciclos_gasto"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_gasto_fecha_idx" ON "public"."ciclos_gasto"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_gasto"
    ADD CONSTRAINT "ciclos_gasto_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_venta" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "producto" VARCHAR(120) NOT NULL,
    "cantidad" DECIMAL(12,3) NOT NULL,
    "unidad" VARCHAR(40) NOT NULL,
    "cliente" VARCHAR(120),
    "precio_unitario" DECIMAL(12,4) NOT NULL,
    "importe_final" DECIMAL(12,2) NOT NULL,
    "estado_pago" VARCHAR(40),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_venta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_venta_ciclo_avicola_id_idx" ON "public"."ciclos_venta"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_venta_fecha_idx" ON "public"."ciclos_venta"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_venta"
    ADD CONSTRAINT "ciclos_venta_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_biometria" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "dia_ciclo" INTEGER,
    "animales_pesados" INTEGER,
    "peso_promedio_g" DECIMAL(12,4) NOT NULL,
    "peso_promedio_kg" DECIMAL(12,6),
    "indice_crecimiento_g_dia" DECIMAL(12,4),
    "dias_transcurridos" INTEGER,
    "ganancia_ultima_g" DECIMAL(12,4),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_biometria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_biometria_ciclo_avicola_id_idx" ON "public"."ciclos_biometria"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_biometria_fecha_idx" ON "public"."ciclos_biometria"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_biometria"
    ADD CONSTRAINT "ciclos_biometria_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_mortalidad" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "dia_ciclo" INTEGER,
    "muertes" INTEGER NOT NULL DEFAULT 0,
    "descartes" INTEGER NOT NULL DEFAULT 0,
    "causa" VARCHAR(200),
    "accion_correctiva" VARCHAR(200),
    "responsable" VARCHAR(120),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_mortalidad_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_mortalidad_ciclo_avicola_id_idx" ON "public"."ciclos_mortalidad"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_mortalidad_fecha_idx" ON "public"."ciclos_mortalidad"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_mortalidad"
    ADD CONSTRAINT "ciclos_mortalidad_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_alimento_fase" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "dia_ciclo" INTEGER,
    "fase_alimento" VARCHAR(80),
    "producto" VARCHAR(120),
    "kg_ingreso" DECIMAL(12,3),
    "kg_consumidos" DECIMAL(12,3),
    "existencia_final" DECIMAL(12,3),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_alimento_fase_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_alimento_fase_ciclo_avicola_id_idx" ON "public"."ciclos_alimento_fase"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_alimento_fase_fecha_idx" ON "public"."ciclos_alimento_fase"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_alimento_fase"
    ADD CONSTRAINT "ciclos_alimento_fase_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_consumo_estimado" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "semana" INTEGER NOT NULL,
    "rango_dias" VARCHAR(40),
    "fase_alimento" VARCHAR(80),
    "producto" VARCHAR(120),
    "kg_ingreso" DECIMAL(12,4),
    "consumo_individual" DECIMAL(12,4),
    "consumo_conjunto" DECIMAL(12,3),
    "consumo_acumulado" DECIMAL(12,3),
    "gdp" DECIMAL(12,2),
    "conversion" DECIMAL(12,4),
    "mortalidad_semanal" DECIMAL(12,4),
    "mortalidad_acumulada" DECIMAL(12,4),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_consumo_estimado_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_consumo_estimado_ciclo_avicola_id_idx" ON "public"."ciclos_consumo_estimado"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_consumo_estimado_semana_idx" ON "public"."ciclos_consumo_estimado"("semana");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_consumo_estimado"
    ADD CONSTRAINT "ciclos_consumo_estimado_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ciclos_sanidad" (
    "id" SERIAL NOT NULL,
    "ciclo_avicola_id" INTEGER NOT NULL,
    "fecha" DATE,
    "dia_ciclo" INTEGER,
    "tipo" VARCHAR(80) NOT NULL,
    "producto" VARCHAR(120),
    "dosis" VARCHAR(80),
    "via" VARCHAR(40),
    "responsable" VARCHAR(120),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ciclos_sanidad_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ciclos_sanidad_ciclo_avicola_id_idx" ON "public"."ciclos_sanidad"("ciclo_avicola_id");
CREATE INDEX IF NOT EXISTS "ciclos_sanidad_fecha_idx" ON "public"."ciclos_sanidad"("fecha");

DO $$ BEGIN
  ALTER TABLE "public"."ciclos_sanidad"
    ADD CONSTRAINT "ciclos_sanidad_ciclo_avicola_id_fkey"
    FOREIGN KEY ("ciclo_avicola_id") REFERENCES "public"."ciclos_avicola"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

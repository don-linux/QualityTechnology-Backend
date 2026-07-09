-- Refactor medicamentos: esquema limpio sin columnas legacy

DROP TABLE IF EXISTS "public"."medicamentos";

CREATE TABLE "public"."medicamentos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "infraestructura_fisica_id" INTEGER NOT NULL,
    "diagnostico" VARCHAR(500) NOT NULL,
    "farmaco" VARCHAR(500) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_final" DATE NOT NULL,
    "periodo" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "medicamentos_ubicacion_id_idx" ON "public"."medicamentos"("ubicacion_id");
CREATE INDEX "medicamentos_infraestructura_fisica_id_idx" ON "public"."medicamentos"("infraestructura_fisica_id");
CREATE INDEX "medicamentos_usuario_id_idx" ON "public"."medicamentos"("usuario_id");

ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_infraestructura_fisica_id_fkey" FOREIGN KEY ("infraestructura_fisica_id") REFERENCES "public"."infraestructura_fisica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

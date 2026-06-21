-- Renombrar módulo Cosecha e incubación → Eficiencia reproductiva (tabla principal)

ALTER TABLE "public"."incubacion" RENAME TO "eficiencia_reproductiva";

ALTER INDEX IF EXISTS "public"."incubacion_pkey"
  RENAME TO "eficiencia_reproductiva_pkey";

ALTER INDEX IF EXISTS "public"."incubacion_pileta_id_idx"
  RENAME TO "eficiencia_reproductiva_pileta_id_idx";

ALTER INDEX IF EXISTS "public"."incubacion_lote_idx"
  RENAME TO "eficiencia_reproductiva_lote_idx";

ALTER INDEX IF EXISTS "public"."incubacion_pileta_id_lote_key"
  RENAME TO "eficiencia_reproductiva_pileta_id_lote_key";

ALTER INDEX IF EXISTS "public"."incubacion_pileta_origen_id_idx"
  RENAME TO "eficiencia_reproductiva_pileta_origen_id_idx";

ALTER INDEX IF EXISTS "public"."incubacion_reproductor_id_idx"
  RENAME TO "eficiencia_reproductiva_reproductor_id_idx";

ALTER INDEX IF EXISTS "public"."incubacion_evento_cosecha_id_key"
  RENAME TO "eficiencia_reproductiva_evento_cosecha_id_key";

ALTER INDEX IF EXISTS "public"."incubacion_evento_cosecha_id_idx"
  RENAME TO "eficiencia_reproductiva_evento_cosecha_id_idx";

ALTER INDEX IF EXISTS "public"."incubacion_codigo_key"
  RENAME TO "eficiencia_reproductiva_codigo_key";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_biometria_id_fkey"
  TO "eficiencia_reproductiva_biometria_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_observacion_id_fkey"
  TO "eficiencia_reproductiva_observacion_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_pileta_id_fkey"
  TO "eficiencia_reproductiva_pileta_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_siembra_origen_id_fkey"
  TO "eficiencia_reproductiva_siembra_origen_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_pileta_origen_id_fkey"
  TO "eficiencia_reproductiva_pileta_origen_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_reproductor_id_fkey"
  TO "eficiencia_reproductiva_reproductor_id_fkey";

ALTER TABLE "public"."eficiencia_reproductiva"
  RENAME CONSTRAINT "incubacion_evento_cosecha_id_fkey"
  TO "eficiencia_reproductiva_evento_cosecha_id_fkey";

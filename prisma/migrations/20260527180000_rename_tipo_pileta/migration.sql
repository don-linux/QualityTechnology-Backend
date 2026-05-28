-- Rename catalog table
ALTER TABLE "catalogos"."tipo_instancia_pileta" RENAME TO "tipo_pileta";

-- Rename catalog indexes
ALTER INDEX "catalogos"."tipo_instancia_pileta_pkey" RENAME TO "tipo_pileta_pkey";
ALTER INDEX "catalogos"."tipo_instancia_pileta_nombre_key" RENAME TO "tipo_pileta_nombre_key";

-- Rename FK column on piletas
ALTER TABLE "public"."piletas" RENAME COLUMN "tipo_instancia" TO "tipo_pileta_id";
ALTER INDEX "public"."piletas_tipo_instancia_idx" RENAME TO "piletas_tipo_pileta_id_idx";
ALTER TABLE "public"."piletas" RENAME CONSTRAINT "piletas_tipo_instancia_fkey" TO "piletas_tipo_pileta_id_fkey";

-- Update module permissions route
UPDATE "public"."modulos"
SET nombre = 'Tipos de pileta', ruta = '/tipos-pileta'
WHERE ruta = '/tipos-instancia-pileta';

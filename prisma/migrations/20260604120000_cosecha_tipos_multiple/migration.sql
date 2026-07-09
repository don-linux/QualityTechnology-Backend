-- Cosecha e incubación: `tipo_cosecha` pasa de un único valor a varios.
-- La columna `incubacion.tipo_cosecha` se convierte de enum simple a arreglo de enum
-- (`TipoCosecha[]`) para permitir seleccionar más de una opción por desove.
-- Los valores existentes (un solo tipo o NULL) se preservan envolviéndolos en un arreglo.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'incubacion'
      AND column_name = 'tipo_cosecha'
      AND data_type <> 'ARRAY'
  ) THEN
    ALTER TABLE "public"."incubacion"
      ALTER COLUMN "tipo_cosecha" DROP DEFAULT;

    ALTER TABLE "public"."incubacion"
      ALTER COLUMN "tipo_cosecha" TYPE "public"."TipoCosecha"[]
      USING (
        CASE
          WHEN "tipo_cosecha" IS NULL THEN ARRAY[]::"public"."TipoCosecha"[]
          ELSE ARRAY["tipo_cosecha"]
        END
      );

    ALTER TABLE "public"."incubacion"
      ALTER COLUMN "tipo_cosecha" SET DEFAULT ARRAY[]::"public"."TipoCosecha"[];

    ALTER TABLE "public"."incubacion"
      ALTER COLUMN "tipo_cosecha" SET NOT NULL;
  END IF;
END $$;

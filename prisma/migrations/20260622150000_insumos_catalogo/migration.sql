-- CreateTable
CREATE TABLE "catalogos"."insumos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "marca" VARCHAR(100),
    "unidad_medida" VARCHAR(10) NOT NULL,
    "cliente_id" INTEGER,
    "presentacion" DECIMAL(12,3) NOT NULL,
    "precio_bulto" DECIMAL(12,2) NOT NULL,
    "precio_unitario" DECIMAL(14,4) NOT NULL,
    "stock_minimo" DECIMAL(12,3) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "insumos_codigo_key" ON "catalogos"."insumos"("codigo");

-- CreateIndex
CREATE INDEX "insumos_cliente_id_idx" ON "catalogos"."insumos"("cliente_id");

-- AddForeignKey
ALTER TABLE "catalogos"."insumos"
  ADD CONSTRAINT "insumos_cliente_id_fkey"
  FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

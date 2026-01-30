/*
 Navicat Premium Dump SQL

 Source Server         : PostgreSQL
 Source Server Type    : PostgreSQL
 Source Server Version : 160010 (160010)
 Source Host           : 127.0.0.1:5432
 Source Catalog        : quality
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160010 (160010)
 File Encoding         : 65001

 Date: 30/01/2026 01:35:42
*/


-- ----------------------------
-- Sequence structure for alimentos_fi_alimento_id
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."alimentos_fi_alimento_id";
CREATE SEQUENCE "public"."alimentos_fi_alimento_id" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for alimentos_fi_alimento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."alimentos_fi_alimento_id_seq";
CREATE SEQUENCE "public"."alimentos_fi_alimento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for caja_ahorro_movimientos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."caja_ahorro_movimientos_id_seq";
CREATE SEQUENCE "public"."caja_ahorro_movimientos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for caja_ahorro_resumen_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."caja_ahorro_resumen_id_seq";
CREATE SEQUENCE "public"."caja_ahorro_resumen_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for cat_caja_ahorro_categorias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cat_caja_ahorro_categorias_id_seq";
CREATE SEQUENCE "public"."cat_caja_ahorro_categorias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for cat_tesoreria_categorias_fi_categoria_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cat_tesoreria_categorias_fi_categoria_id_seq";
CREATE SEQUENCE "public"."cat_tesoreria_categorias_fi_categoria_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for categorias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."categorias_id_seq";
CREATE SEQUENCE "public"."categorias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_alimentacion_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_alimentacion_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_alimentacion_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_biometrias_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_biometrias_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_biometrias_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_insumos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_insumos_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_insumos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_limpieza_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_limpieza_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_limpieza_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for clientes_fi_cliente_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clientes_fi_cliente_id_seq";
CREATE SEQUENCE "public"."clientes_fi_cliente_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for engorda_fi_engorda_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."engorda_fi_engorda_id_seq";
CREATE SEQUENCE "public"."engorda_fi_engorda_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for equipos_fi_equipo_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."equipos_fi_equipo_id_seq";
CREATE SEQUENCE "public"."equipos_fi_equipo_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for expedientes_fi_expediente_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."expedientes_fi_expediente_id_seq";
CREATE SEQUENCE "public"."expedientes_fi_expediente_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for flujo_caja_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."flujo_caja_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."flujo_caja_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for instalaciones_fi_instalacion_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."instalaciones_fi_instalacion_id_seq";
CREATE SEQUENCE "public"."instalaciones_fi_instalacion_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for lista_espera_fi_lista_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."lista_espera_fi_lista_id_seq";
CREATE SEQUENCE "public"."lista_espera_fi_lista_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for mantenimientos_fi_mantenimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."mantenimientos_fi_mantenimiento_id_seq";
CREATE SEQUENCE "public"."mantenimientos_fi_mantenimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_banos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_banos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_banos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_inventario_alevines_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_inventario_alevines_fi_id_seq";
CREATE SEQUENCE "public"."medellin_inventario_alevines_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_medicamentos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_medicamentos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_medicamentos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_parametros_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_parametros_fi_id_seq";
CREATE SEQUENCE "public"."medellin_parametros_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_plagas_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_plagas_fi_id_seq";
CREATE SEQUENCE "public"."medellin_plagas_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_recambios_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_recambios_fi_id_seq";
CREATE SEQUENCE "public"."medellin_recambios_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_recepcion_insumos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_recepcion_insumos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_recepcion_insumos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_visitas_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_visitas_fi_id_seq";
CREATE SEQUENCE "public"."medellin_visitas_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for alevines_fi_alevines_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."alevines_fi_alevines_id_seq";
CREATE SEQUENCE "public"."alevines_fi_alevines_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for movimiento_alevines_fi_movimiento_alevines_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."movimiento_alevines_fi_movimiento_alevines_id_seq";
CREATE SEQUENCE "public"."movimiento_alevines_fi_movimiento_alevines_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nomina_fi_nomina_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nomina_fi_nomina_id_seq";
CREATE SEQUENCE "public"."nomina_fi_nomina_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for piletas_fi_pileta_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."piletas_fi_pileta_id_seq";
CREATE SEQUENCE "public"."piletas_fi_pileta_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for proveedores_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."proveedores_id_seq";
CREATE SEQUENCE "public"."proveedores_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rastreabilidad_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."rastreabilidad_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."rastreabilidad_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rastreabilidad_reproductores_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."rastreabilidad_reproductores_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."rastreabilidad_reproductores_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for reproductores_fi_reproductor_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."reproductores_fi_reproductor_id_seq";
CREATE SEQUENCE "public"."reproductores_fi_reproductor_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for roles_fi_rol_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."roles_fi_rol_id_seq";
CREATE SEQUENCE "public"."roles_fi_rol_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuarios_fi_usuario_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuarios_fi_usuario_id_seq";
CREATE SEQUENCE "public"."usuarios_fi_usuario_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for vacaciones_fi_vacacion_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."vacaciones_fi_vacacion_id_seq";
CREATE SEQUENCE "public"."vacaciones_fi_vacacion_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_fi_venta_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_fi_venta_id_seq";
CREATE SEQUENCE "public"."ventas_fi_venta_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for alimentacion
-- ----------------------------
DROP TABLE IF EXISTS "public"."alimentacion";
CREATE TABLE "public"."alimentacion" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_alimentacion_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fn_peso_promedio_entrada" numeric,
  "fd_fecha_siembra" date,
  "fc_origen_alevines" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha" date,
  "fn_total_alimento_kg" numeric,
  "fn_mortalidad" int4,
  "fc_recambio_agua" varchar(50) COLLATE "pg_catalog"."default",
  "fn_temp_agua" numeric,
  "fn_amonio" numeric,
  "fn_ph" numeric,
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of alimentacion
-- ----------------------------

-- ----------------------------
-- Table structure for alevines
-- ----------------------------
DROP TABLE IF EXISTS "public"."alevines";
CREATE TABLE "public"."alevines" (
  "fi_alevines_id" int4 NOT NULL DEFAULT nextval('alevines_fi_alevines_id_seq'::regclass),
  "fc_numero_lote" varchar(50) COLLATE "pg_catalog"."default",
  "fn_peso_promedio" numeric,
  "fn_cantidad" int4,
  "fc_observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4,
  "fi_colecta_id" int4,
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of alevines
-- ----------------------------

-- ----------------------------
-- Table structure for alimentos
-- ----------------------------
DROP TABLE IF EXISTS "public"."alimentos";
CREATE TABLE "public"."alimentos" (
  "fi_alimento_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fi_reproductor_id" int4,
  "fi_pileta_id" int4,
  "fi_usuario_id" int4,
  "particula_mm" numeric(10,2),
  "alimento_dia" numeric(10,3),
  "porcion" numeric(10,3),
  "gasto_alimento" numeric(12,2),
  "fi_engorda_id" int4
)
;

-- ----------------------------
-- Records of alimentos
-- ----------------------------
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (1, 2, NULL, NULL, 3.00, 3.900, 0.030, 234.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (2, 4, NULL, NULL, 3.00, 3.900, 0.030, 234.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (3, 2, NULL, NULL, 3.00, 3.900, 0.030, 234.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (4, 3, NULL, NULL, 3.00, 4.350, 0.030, 261.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (6, 4, NULL, NULL, 3.00, 1.050, 0.030, 63.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (7, 5, NULL, NULL, 3.00, 4.290, 0.030, 257.40, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (8, 2, NULL, 3, 3.00, 3.900, 0.030, 234.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (14, 7, NULL, 4, 3.00, 4.800, 0.030, 288.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (20, 4, NULL, 3, 3.00, 1.050, 0.030, 63.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (22, 8, NULL, 4, 3.00, 6.420, 0.030, 385.20, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (26, 10, NULL, 4, 3.00, 6.000, 0.030, 360.00, NULL);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (27, NULL, NULL, 4, 4.00, 370.000, 0.020, 22200.00, 3);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (28, NULL, NULL, 4, 5.00, 100.000, 0.020, 6000.00, 2);
INSERT INTO "public"."alimentos" OVERRIDING SYSTEM VALUE VALUES (29, 9, NULL, 3, 3.00, 4.500, 0.030, 270.00, NULL);

-- ----------------------------
-- Table structure for banos
-- ----------------------------
DROP TABLE IF EXISTS "public"."banos";
CREATE TABLE "public"."banos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_banos_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fc_dia" varchar(20) COLLATE "pg_catalog"."default",
  "fc_banio_hombres" varchar(100) COLLATE "pg_catalog"."default",
  "fc_banio_mujeres" varchar(100) COLLATE "pg_catalog"."default",
  "fc_regadera" varchar(100) COLLATE "pg_catalog"."default",
  "fc_realizo" varchar(100) COLLATE "pg_catalog"."default",
  "fc_firma" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of banos
-- ----------------------------

-- ----------------------------
-- Table structure for biometrias
-- ----------------------------
DROP TABLE IF EXISTS "public"."biometrias";
CREATE TABLE "public"."biometrias" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_biometrias_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fn_peso_total_gramos" numeric,
  "fn_organismos_muestreados" int4,
  "fn_peso_promedio" numeric,
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of biometrias
-- ----------------------------

-- ----------------------------
-- Table structure for caja_ahorro_movimientos
-- ----------------------------
DROP TABLE IF EXISTS "public"."caja_ahorro_movimientos";
CREATE TABLE "public"."caja_ahorro_movimientos" (
  "id" int4 NOT NULL DEFAULT nextval('caja_ahorro_movimientos_id_seq'::regclass),
  "categoria_id" int4,
  "fecha" date DEFAULT CURRENT_DATE,
  "tipo_movimiento" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'EGRESO'::character varying,
  "monto" numeric(12,2) DEFAULT 0.00,
  "descripcion" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of caja_ahorro_movimientos
-- ----------------------------

-- ----------------------------
-- Table structure for caja_ahorro_resumen
-- ----------------------------
DROP TABLE IF EXISTS "public"."caja_ahorro_resumen";
CREATE TABLE "public"."caja_ahorro_resumen" (
  "id" int4 NOT NULL DEFAULT nextval('caja_ahorro_resumen_id_seq'::regclass),
  "categoria" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "enero" numeric(12,2) DEFAULT 0,
  "febrero" numeric(12,2) DEFAULT 0,
  "marzo" numeric(12,2) DEFAULT 0,
  "abril" numeric(12,2) DEFAULT 0,
  "mayo" numeric(12,2) DEFAULT 0,
  "junio" numeric(12,2) DEFAULT 0,
  "julio" numeric(12,2) DEFAULT 0,
  "agosto" numeric(12,2) DEFAULT 0,
  "septiembre" numeric(12,2) DEFAULT 0,
  "octubre" numeric(12,2) DEFAULT 0,
  "noviembre" numeric(12,2) DEFAULT 0,
  "diciembre" numeric(12,2) DEFAULT 0,
  "total" numeric(12,2) GENERATED ALWAYS AS (
(((((((((((COALESCE(enero, (0)::numeric) + COALESCE(febrero, (0)::numeric)) + COALESCE(marzo, (0)::numeric)) + COALESCE(abril, (0)::numeric)) + COALESCE(mayo, (0)::numeric)) + COALESCE(junio, (0)::numeric)) + COALESCE(julio, (0)::numeric)) + COALESCE(agosto, (0)::numeric)) + COALESCE(septiembre, (0)::numeric)) + COALESCE(octubre, (0)::numeric)) + COALESCE(noviembre, (0)::numeric)) + COALESCE(diciembre, (0)::numeric))
) STORED,
  "actualizado" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "granja" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Ceiba'::character varying
)
;

-- ----------------------------
-- Records of caja_ahorro_resumen
-- ----------------------------
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (1, 'Sueldos y Salarios', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (2, 'Préstamos de Nómina', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (3, 'Caja de Ahorro', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (4, 'Seguro Social', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (5, 'INFONAVIT', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (6, '2.5% Sobre Nómina', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (7, 'Capacitación', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (8, 'Viáticos', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (9, 'Incentivos/Bonos', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (10, 'EPP/Uniformes', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (11, 'Liquidaciones', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (12, 'Otro RRHH', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (14, 'Prestamos y Nomina', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:47:46.168501', 'Medellín');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (13, 'Sueldos y salarios', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:47:29.154625', 'Medellín');

-- ----------------------------
-- Table structure for cat_caja_ahorro_categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."cat_caja_ahorro_categorias";
CREATE TABLE "public"."cat_caja_ahorro_categorias" (
  "id" int4 NOT NULL DEFAULT nextval('cat_caja_ahorro_categorias_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'EGRESO'::character varying,
  "activo" bool DEFAULT true
)
;

-- ----------------------------
-- Records of cat_caja_ahorro_categorias
-- ----------------------------
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (1, 'Sueldos y Salarios', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (2, 'Préstamos de Nómina', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (3, 'Caja de Ahorro', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (4, 'Seguro Social', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (5, 'INFONAVIT', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (6, '2.5% Sobre Nómina', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (7, 'Capacitación', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (8, 'Viáticos', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (9, 'Incentivos/Bonos', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (10, 'EPP/Uniformes', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (11, 'Liquidaciones', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (12, 'Otro RRHH', 'EGRESO', 't');

-- ----------------------------
-- Table structure for cat_tesoreria_categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."cat_tesoreria_categorias";
CREATE TABLE "public"."cat_tesoreria_categorias" (
  "fi_categoria_id" int4 NOT NULL DEFAULT nextval('cat_tesoreria_categorias_fi_categoria_id_seq'::regclass),
  "fc_nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_grupo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of cat_tesoreria_categorias
-- ----------------------------

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."categorias";
CREATE TABLE "public"."categorias" (
  "id" int4 NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_principal" varchar(30) COLLATE "pg_catalog"."default",
  "subcategoria" varchar(50) COLLATE "pg_catalog"."default",
  "descripcion" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of categorias
-- ----------------------------
INSERT INTO "public"."categorias" VALUES (1, 'Venta de Alevines', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (2, 'Venta de Mojarras (Kg)', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (3, 'Venta de Alimento', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (4, 'Venta de Medicamentos/Vitaminas', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (5, 'Otras Ventas', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (6, 'Renta Cámara de Congelación', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (7, 'Fletes y Envíos', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (8, 'Ingresos por Intereses', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (9, 'Servicios de Gestión', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (10, 'Reembolsos', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (11, 'Comisiones', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (12, 'Fondeo Externo y Pasivos', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (13, 'Misceláneo', 'INGRESO', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (14, 'Fondo Líquido', 'CAPITAL', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (15, 'Capital en Caja de Ahorro', 'CAPITAL', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (16, 'Intereses Caja de Ahorro', 'CAPITAL', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (17, 'Cuentas por Cobrar', 'CAPITAL', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (18, 'Otro', 'CAPITAL', NULL, NULL);
INSERT INTO "public"."categorias" VALUES (19, 'Sueldos y Salarios', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (20, 'Aguinaldo', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (21, 'Préstamos de Nómina', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (22, 'Caja de Ahorro', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (23, 'Seguro Social', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (24, 'Gastos Médicos', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (25, 'ISR', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (26, 'INFONAVIT', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (27, 'Vacaciones NO Disfrutadas', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (28, 'Prima Vacacional', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (29, 'Capacitación', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (30, 'Viáticos', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (31, 'Incentivos/Bonos', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (32, 'EPP/Uniformes', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (33, 'Liquidaciones', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (34, 'Otro RRHH', 'GASTOS OPERATIVOS', 'RECURSOS HUMANOS', NULL);
INSERT INTO "public"."categorias" VALUES (35, 'Internet y Telefónico', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (36, 'Electricidad CFE', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (37, 'Limpieza', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (38, 'Comisiones Bancarias', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (39, 'Certificaciones', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (40, 'Marketing', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (41, 'Servicios de Facturación', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (42, 'Otros Servicios', 'GASTOS OPERATIVOS', 'SERVICIOS', NULL);
INSERT INTO "public"."categorias" VALUES (43, 'Compra de Alevines', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (44, 'Compra de Alimento', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (45, 'Compra de Medicamentos', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (46, 'Compra de Reproductores', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (47, 'Compra de Artículos Para Venta', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (48, 'Material de Construcción Interno', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (49, 'Artículos de Mantenimiento', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (50, 'Hardware Tecnología', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (51, 'Mano de Obra', 'GASTOS OPERATIVOS', 'RECURSOS MATERIALES', NULL);
INSERT INTO "public"."categorias" VALUES (52, 'Renta Instalaciones', 'GASTOS OPERATIVOS', 'INSTALACIONES', NULL);
INSERT INTO "public"."categorias" VALUES (53, 'Depósito Garantía', 'GASTOS OPERATIVOS', 'INSTALACIONES', NULL);
INSERT INTO "public"."categorias" VALUES (54, 'Préstamo Capital', 'GASTOS OPERATIVOS', 'AJUSTE DE CAPITALES', NULL);
INSERT INTO "public"."categorias" VALUES (55, 'Devolución de Préstamos', 'GASTOS OPERATIVOS', 'AJUSTE DE CAPITALES', NULL);

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."clientes";
CREATE TABLE "public"."clientes" (
  "fi_cliente_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" varchar(100) COLLATE "pg_catalog"."default",
  "fc_telefono" char(10) COLLATE "pg_catalog"."default",
  "fc_correo" char(30) COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4 NOT NULL,
  "fd_fecha_registro" date NOT NULL,
  "fd_fecha_modificacion" date NOT NULL,
  "fc_cp" char(5) COLLATE "pg_catalog"."default",
  "fc_localidad" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of clientes
-- ----------------------------
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (2, 'Gonzalo Gavira Gepeto', '9876346210', 'ggavira_gepe@hotmail.com      ', 3, '2025-12-23', '2025-12-23', '8912 ', 'Ixtacomitán');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (3, 'Biologo Jordan', '          ', '                              ', 3, '2025-12-23', '2025-12-23', '     ', 'catazaja');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (4, 'ARTEMIO MORENO', '          ', '                              ', 3, '2025-12-23', '2025-12-23', '     ', '');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (5, 'Armando Hernandez', '          ', '                              ', 3, '2025-12-23', '2025-12-23', '     ', 'Tabasco');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (6, 'Alexander', '          ', '                              ', 1, '2025-12-23', '2025-12-23', '     ', '');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (7, 'JULIAN GONZALEZ', '          ', '                              ', 1, '2025-12-23', '2025-12-23', '     ', 'La Ceiba');

-- ----------------------------
-- Table structure for engorda
-- ----------------------------
DROP TABLE IF EXISTS "public"."engorda";
CREATE TABLE "public"."engorda" (
  "fi_engorda_id" int4 NOT NULL DEFAULT nextval('engorda_fi_engorda_id_seq'::regclass),
  "instalacion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "cantidad" numeric(10,2) NOT NULL,
  "talla_gr" numeric(10,2),
  "no_lote" varchar(50) COLLATE "pg_catalog"."default",
  "observacion" text COLLATE "pg_catalog"."default",
  "fecha_siembra" date,
  "fecha_biometria" date,
  "particula_mm" numeric(4,2),
  "fecha_registro" date DEFAULT CURRENT_DATE,
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of engorda
-- ----------------------------
INSERT INTO "public"."engorda" VALUES (2, 'Estanque 6', 5000.00, 460.00, '1-2025', '', '2025-01-27', '2025-10-16', 5.50, '2025-11-12', 4);
INSERT INTO "public"."engorda" VALUES (3, 'Estanque CH 1', 18500.00, 140.00, '2-2025', '', '2025-07-05', '2025-10-16', 3.50, '2025-11-18', 4);
INSERT INTO "public"."engorda" VALUES (4, 'Estanque 6', 5000.00, 520.00, '1-2025', '', '2025-01-27', '2025-11-13', 4.00, '2026-01-12', 1);
INSERT INTO "public"."engorda" VALUES (5, 'Estanque CH1', 8000.00, 220.00, '2-2025', '', '2025-07-05', '2025-10-31', 3.50, '2026-01-12', 1);
INSERT INTO "public"."engorda" VALUES (6, 'Estanque 2', 8000.00, 115.00, '3-2025', '', '2025-11-06', '2025-11-06', 0.00, '2026-01-12', 1);

-- ----------------------------
-- Table structure for equipos
-- ----------------------------
DROP TABLE IF EXISTS "public"."equipos";
CREATE TABLE "public"."equipos" (
  "fi_equipo_id" int4 NOT NULL DEFAULT nextval('equipos_fi_equipo_id_seq'::regclass),
  "fc_nombre" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_marca" varchar(100) COLLATE "pg_catalog"."default",
  "fc_modelo" varchar(100) COLLATE "pg_catalog"."default",
  "fc_tipo" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_compra" date,
  "fn_costo" numeric(12,2),
  "fc_estado" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Operativo'::character varying,
  "fc_ubicacion" varchar(150) COLLATE "pg_catalog"."default",
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_proximo_mantenimiento" date,
  "fc_notas" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of equipos
-- ----------------------------

-- ----------------------------
-- Table structure for expedientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."expedientes";
CREATE TABLE "public"."expedientes" (
  "fi_expediente_id" int4 NOT NULL DEFAULT nextval('expedientes_fi_expediente_id_seq'::regclass),
  "fc_nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_id_empleado" varchar(50) COLLATE "pg_catalog"."default",
  "fn_uniformes" int4 DEFAULT 0,
  "fc_credencial" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_fotografia" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_acta_nacimiento" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_ine" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_licencia_conducir" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_comprobante_domicilio" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_rfc" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_curp" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_comprobante_estudios" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_cv" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_carta_recomendacion" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_acuerdo_confidencialidad" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_codigo_etica" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_codigo_conducta" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_solicitud_empleo" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fd_fecha_actualizacion" date DEFAULT CURRENT_DATE,
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of expedientes
-- ----------------------------
INSERT INTO "public"."expedientes" VALUES (1, 'Juan Carlos Jimenez Morales', '10101010', 5, 'NO', 'SI', 'NO', 'SI', 'SI', 'NO', 'SI', 'SI', 'NO', 'NO', 'NO', 'NO', 'SI', 'SUSTITUIR', 'NO', '2025-12-08', 1);
INSERT INTO "public"."expedientes" VALUES (2, 'Carlos Manuel Perez Ruiz', '10101014', 2, 'NO', 'SI', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'SI', 'SI', 'NO', '2025-12-09', 1);
INSERT INTO "public"."expedientes" VALUES (4, 'Juan Carlos Jimenez Ara', '10101011', 4, 'NO', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2025-12-15', 1);

-- ----------------------------
-- Table structure for flujo_caja
-- ----------------------------
DROP TABLE IF EXISTS "public"."flujo_caja";
CREATE TABLE "public"."flujo_caja" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('flujo_caja_fi_movimiento_id_seq'::regclass),
  "fc_granja" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fd_fecha" date NOT NULL,
  "fn_ingreso" numeric(12,2) DEFAULT 0,
  "fn_egreso" numeric(12,2) DEFAULT 0,
  "fc_descripcion" varchar(200) COLLATE "pg_catalog"."default",
  "fc_cuenta" varchar(50) COLLATE "pg_catalog"."default",
  "fc_categoria" varchar(100) COLLATE "pg_catalog"."default",
  "fc_subcategoria" varchar(100) COLLATE "pg_catalog"."default",
  "fc_factura" varchar(50) COLLATE "pg_catalog"."default",
  "fc_estatus" varchar(20) COLLATE "pg_catalog"."default",
  "fc_mes" varchar(7) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "categoria_id" int4
)
;

-- ----------------------------
-- Records of flujo_caja
-- ----------------------------
INSERT INTO "public"."flujo_caja" VALUES (2, 'Medellin', '2026-01-05', 25000.00, 0.00, 'Venta de alevines', 'Banco BBVA', 'Ventas', NULL, 'F001', 'LIQUIDADO', '2026-01', '2026-01-29 09:43:06.176364', NULL);
INSERT INTO "public"."flujo_caja" VALUES (4, 'La Ceiba', '2026-01-12', 40000.00, 0.00, 'Venta de alimento', 'Banco Azteca', 'Ventas', NULL, 'F002', 'LIQUIDADO', '2026-01', '2026-01-29 09:43:06.176364', NULL);
INSERT INTO "public"."flujo_caja" VALUES (5, 'Quality', '2026-01-15', 0.00, 5000.00, 'Compra de medicinas', 'Santander', 'Gastos', NULL, 'F003', 'LIQUIDADO', '2026-01', '2026-01-29 09:43:06.176364', NULL);
INSERT INTO "public"."flujo_caja" VALUES (3, 'Medellin', '2026-01-10', 0.00, 12000.00, 'Pago de sueldos', 'Efectivo', 'Nómina', NULL, 'N/A', 'REPOSICION', '2026-01', '2026-01-29 09:43:06.176364', NULL);

-- ----------------------------
-- Table structure for instalaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."instalaciones";
CREATE TABLE "public"."instalaciones" (
  "fi_instalacion_id" int4 NOT NULL DEFAULT nextval('instalaciones_fi_instalacion_id_seq'::regclass),
  "nombre_instalacion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "largo" numeric(10,2) NOT NULL,
  "ancho" numeric(10,2) NOT NULL,
  "altura" numeric(10,2) NOT NULL,
  "material" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "metros_cubicos" numeric(10,2) GENERATED ALWAYS AS (
((largo * ancho) * altura)
) STORED,
  "fi_usuario_id" int4,
  "fecha_registro" date DEFAULT CURRENT_DATE,
  "fd_fecha_modificacion" date,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of instalaciones
-- ----------------------------
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (1, 'L-11', 12.00, 12.00, 1.50, 'Concreto', 1, '2026-01-14', NULL, 'Granja Acuícola Medellin');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (2, 'L-06', 12.00, 12.00, 1.50, 'Concreto', 1, '2026-01-14', NULL, 'Granja Acuícola Medellin');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (3, 'L-05', 12.00, 12.00, 1.50, 'Concreto', 1, '2026-01-15', NULL, 'Granja Acuícola Medellin');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (4, 'L-03', 12.00, 12.00, 1.50, 'Conceto', 1, '2026-01-15', NULL, 'Granja Acuícola Medellin');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (5, 'R-13', 12.00, 12.00, 1.50, 'Concreto', 1, '2026-01-15', NULL, 'Granja Acuícola Medellin');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (9, 'R-05', 13.00, 8.00, 1.60, 'Asbeto', 1, '2026-01-15', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (12, 'A-02', 13.00, 8.00, 1.60, 'Asbeto', 1, '2026-01-15', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (14, 'R-03', 13.00, 8.00, 1.60, 'Abesto', 1, '2026-01-17', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (16, 'R-01', 13.00, 8.00, 1.60, 'Asbeto', 1, '2026-01-17', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (21, 'R-04', 13.00, 8.00, 1.60, 'Asbeto', 1, '2026-01-17', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (13, 'TR', 12.00, 8.00, 1.60, 'Asbeto', 1, '2026-01-17', NULL, 'Granja Acuícola La Ceiba');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja") VALUES (7, 'R-10', 13.00, 5.00, 1.50, 'Concreto', 1, '2026-01-15', NULL, 'Granja Acuícola Medellin');

-- ----------------------------
-- Table structure for insumos
-- ----------------------------
DROP TABLE IF EXISTS "public"."insumos";
CREATE TABLE "public"."insumos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_insumos_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_cantidad_udm" varchar(100) COLLATE "pg_catalog"."default",
  "fc_num_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" varchar(300) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado_entrega" varchar(100) COLLATE "pg_catalog"."default",
  "fc_encargado_recepcion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of insumos
-- ----------------------------

-- ----------------------------
-- Table structure for inventario_alevines
-- ----------------------------
DROP TABLE IF EXISTS "public"."inventario_alevines";
CREATE TABLE "public"."inventario_alevines" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_inventario_alevines_fi_id_seq'::regclass),
  "fn_num_instalacion" int4,
  "fn_cantidad" int4,
  "fn_talla" numeric,
  "fc_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observacion" text COLLATE "pg_catalog"."default",
  "fd_fecha_siembra" date,
  "fd_fecha_salida_hormonado" date,
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of inventario_alevines
-- ----------------------------

-- ----------------------------
-- Table structure for limpieza
-- ----------------------------
DROP TABLE IF EXISTS "public"."limpieza";
CREATE TABLE "public"."limpieza" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_limpieza_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_tipo_instalacion" varchar(100) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fc_desinfectante" varchar(150) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of limpieza
-- ----------------------------

-- ----------------------------
-- Table structure for lista_espera
-- ----------------------------
DROP TABLE IF EXISTS "public"."lista_espera";
CREATE TABLE "public"."lista_espera" (
  "fi_lista_id" int4 NOT NULL DEFAULT nextval('lista_espera_fi_lista_id_seq'::regclass),
  "fd_fecha_entrega" date NOT NULL,
  "fc_talla" varchar(50) COLLATE "pg_catalog"."default",
  "fn_cantidad" numeric(12,2),
  "fc_cliente" varchar(200) COLLATE "pg_catalog"."default",
  "fc_lugar_entrega" varchar(200) COLLATE "pg_catalog"."default",
  "fc_encargado_venta" varchar(200) COLLATE "pg_catalog"."default",
  "fc_unidad_produccion" varchar(200) COLLATE "pg_catalog"."default",
  "fc_hora_embolsado" varchar(20) COLLATE "pg_catalog"."default",
  "fc_hora_entrega" varchar(20) COLLATE "pg_catalog"."default",
  "fn_precio_venta" numeric(12,2),
  "fc_uap_asignada" varchar(200) COLLATE "pg_catalog"."default",
  "fc_granja_asignada" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of lista_espera
-- ----------------------------

-- ----------------------------
-- Table structure for mantenimientos
-- ----------------------------
DROP TABLE IF EXISTS "public"."mantenimientos";
CREATE TABLE "public"."mantenimientos" (
  "fi_mantenimiento_id" int4 NOT NULL DEFAULT nextval('mantenimientos_fi_mantenimiento_id_seq'::regclass),
  "fi_equipo_id" int4,
  "fd_fecha" date NOT NULL,
  "fc_tipo" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Preventivo'::character varying,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" text COLLATE "pg_catalog"."default",
  "fn_costo" numeric(12,2) DEFAULT 0,
  "fc_estado_post" varchar(50) COLLATE "pg_catalog"."default",
  "fd_proximo_mantenimiento" date
)
;

-- ----------------------------
-- Records of mantenimientos
-- ----------------------------

-- ----------------------------
-- Table structure for medicamentos
-- ----------------------------
DROP TABLE IF EXISTS "public"."medicamentos";
CREATE TABLE "public"."medicamentos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_medicamentos_fi_id_seq'::regclass),
  "fd_fecha_hora" timestamp(6) NOT NULL,
  "fn_num_estanque" int4,
  "fc_diagnosis" text COLLATE "pg_catalog"."default",
  "fc_tratamiento" text COLLATE "pg_catalog"."default",
  "fc_dosis" varchar(100) COLLATE "pg_catalog"."default",
  "fc_forma_aplicacion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_ultima_dosis" date,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of medicamentos
-- ----------------------------

-- ----------------------------
-- Table structure for movimiento_alevines
-- ----------------------------
DROP TABLE IF EXISTS "public"."movimiento_alevines";
CREATE TABLE "public"."movimiento_alevines" (
  "fi_movimiento_alevines_id" int4 NOT NULL DEFAULT nextval('movimiento_alevines_fi_movimiento_alevines_id_seq'::regclass),
  "fi_usuario_id" int4 NOT NULL,
  "fi_cantidad_alevines" int4 NOT NULL,
  "fn_peso_promedio" numeric NOT NULL,
  "fd_fecha_registro" date NOT NULL,
  "fd_fecha_modificacion" date NOT NULL,
  "fi_pileta_id" int4 NOT NULL,
  "fi_alevines_id" int4 NOT NULL,
  "fi_tipo" int4
)
;

-- ----------------------------
-- Records of movimiento_alevines
-- ----------------------------

-- ----------------------------
-- Table structure for nomina
-- ----------------------------
DROP TABLE IF EXISTS "public"."nomina";
CREATE TABLE "public"."nomina" (
  "fi_nomina_id" int4 NOT NULL DEFAULT nextval('nomina_fi_nomina_id_seq'::regclass),
  "fc_nombre_empleado" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_empleado_id" int4,
  "fd_fecha_pago" date NOT NULL DEFAULT CURRENT_DATE,
  "fn_total" numeric(10,2) DEFAULT 0,
  "fn_bono" numeric(10,2) DEFAULT 0,
  "fn_deuda" numeric(10,2) DEFAULT 0,
  "fn_descuento" numeric(10,2) DEFAULT 0,
  "fn_anticipo" numeric(10,2) DEFAULT 0,
  "fi_usuario_id" int4,
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_actualizacion" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of nomina
-- ----------------------------
INSERT INTO "public"."nomina" VALUES (1, 'Jose Carlos Ermesio Cequef', 230092, '2025-12-08', 2500.00, 500.00, 2000.00, 0.00, 0.00, 1, '2025-12-08 17:00:28.182154', '2025-12-08 17:00:28.182154');

-- ----------------------------
-- Table structure for parametros
-- ----------------------------
DROP TABLE IF EXISTS "public"."parametros";
CREATE TABLE "public"."parametros" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_parametros_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fn_num_estanque" int4,
  "fn_oxigeno" numeric,
  "fn_temperatura" numeric,
  "fn_ph" numeric,
  "fn_amonio" numeric,
  "fn_nitritos" numeric,
  "fn_nitratos" numeric,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of parametros
-- ----------------------------

-- ----------------------------
-- Table structure for piletas
-- ----------------------------
DROP TABLE IF EXISTS "public"."piletas";
CREATE TABLE "public"."piletas" (
  "fi_pileta_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "nombre_instalacion" varchar(50) COLLATE "pg_catalog"."default",
  "ubicacion" varchar(100) COLLATE "pg_catalog"."default",
  "fc_especie" varchar(50) COLLATE "pg_catalog"."default",
  "fecha_registro" date NOT NULL DEFAULT CURRENT_DATE,
  "fd_fecha_modificacion" date,
  "fecha_siembra" date DEFAULT now(),
  "fecha_ultima_biometria" date DEFAULT now(),
  "cantidad" int4 DEFAULT 0,
  "talla_gr" numeric(10,2),
  "no_lote" int4,
  "observacion" varchar(255) COLLATE "pg_catalog"."default",
  "particula" numeric,
  "alimento_dia" numeric,
  "alimento_porcion" numeric,
  "fi_usuario_id" int4,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fi_instalacion_id" int4,
  "origen_instalacion" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of piletas
-- ----------------------------
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (65, NULL, NULL, NULL, '2026-01-17', '2026-01-17', NULL, NULL, 400, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (64, NULL, NULL, NULL, '2026-01-17', '2026-01-17', NULL, NULL, 2800, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (62, NULL, NULL, NULL, '2026-01-15', '2026-01-17', NULL, NULL, 800, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (61, NULL, NULL, NULL, '2026-01-15', '2026-01-17', NULL, NULL, 9100, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (67, NULL, NULL, NULL, '2026-01-17', '2026-01-17', NULL, NULL, 12, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (63, NULL, NULL, NULL, '2026-01-17', '2026-01-17', NULL, NULL, 375, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (59, NULL, NULL, NULL, '2026-01-15', '2026-01-17', NULL, NULL, 1000, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (58, NULL, NULL, NULL, '2026-01-15', '2026-01-17', NULL, NULL, 600, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (57, NULL, NULL, NULL, '2026-01-15', '2026-01-17', NULL, NULL, 800, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (66, NULL, NULL, NULL, '2026-01-17', '2026-01-17', NULL, NULL, 38, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL);
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (69, NULL, NULL, NULL, '2026-01-17', '2026-01-17', '2026-01-17', '2026-01-17', 145, 0.20, 23, 'Hormonado', NULL, NULL, NULL, 1, 'Granja Acuícola La Ceiba', 12, '');
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (71, NULL, NULL, NULL, '2026-01-19', '2026-01-21', '2026-01-19', '2025-11-12', 30, 0.10, 20, 'Venta', NULL, NULL, NULL, 1, 'Granja Acuícola Medellin', 2, '');
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (70, NULL, NULL, NULL, '2026-01-17', '2026-01-21', '2026-01-17', '2026-01-17', 250, 0.10, 23, 'Hormonado', NULL, NULL, NULL, 1, 'Granja Acuícola Medellin', 3, '70');
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (72, NULL, NULL, NULL, '2026-01-21', '2026-01-22', '2026-01-17', '2026-01-17', 50, 0.10, 23, 'Venta', NULL, NULL, NULL, 1, 'Granja Acuícola Medellin', 1, '70');
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (68, NULL, NULL, NULL, '2026-01-17', '2026-01-27', '2026-01-17', '2026-01-17', 20, 0.10, 22, 'Venta', NULL, NULL, NULL, 1, 'Granja Acuícola Medellin', 7, '68');

-- ----------------------------
-- Table structure for plagas
-- ----------------------------
DROP TABLE IF EXISTS "public"."plagas";
CREATE TABLE "public"."plagas" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_plagas_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fn_num_trampa" varchar(100) COLLATE "pg_catalog"."default",
  "fc_hallazgo" text COLLATE "pg_catalog"."default",
  "fc_malla" varchar(200) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_verifico" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(100) COLLATE "pg_catalog"."default",
  "tipo_trampa" varchar(100) COLLATE "pg_catalog"."default",
  "fc_veneno" varchar(100) COLLATE "pg_catalog"."default",
  "unidad_produccion" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of plagas
-- ----------------------------
INSERT INTO "public"."plagas" VALUES (2, '2025-12-23', '1', 'Ratas', 'ROTA', '', 'Jose', '2025-12-23 14:13:12.466512', '2025-12-23 14:13:12.466512', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."plagas" VALUES (5, '2026-01-06', '114d', 'ahaosja ', 'sdiqhwidjns', 'sansjbjsn', 'xwwkhi2h2', '2026-01-06 14:55:03.393528', '2026-01-06 14:55:03.393528', 1, 'quality', NULL, NULL, NULL);
INSERT INTO "public"."plagas" VALUES (6, '2026-01-06', 'c12', 'rata', 'Dañada', 'no', 'juan', '2026-01-06 15:06:36.382843', '2026-01-06 15:13:46.534329', 1, 'medellin', 'Adhesiva', 'Líquido', 'Engorda 1');
INSERT INTO "public"."plagas" VALUES (4, '2026-01-07', '121sss', 'rata', 'Sin Malla', 'uana', '231', '2026-01-06 14:54:43.562833', '2026-01-06 15:20:48.505116', 1, 'ceiba', 'Cebadera', 'Ninguno', 'Reproductores');

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS "public"."proveedores";
CREATE TABLE "public"."proveedores" (
  "id" int4 NOT NULL DEFAULT nextval('proveedores_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "empresa" varchar(255) COLLATE "pg_catalog"."default",
  "rfc" varchar(50) COLLATE "pg_catalog"."default",
  "categoria" varchar(100) COLLATE "pg_catalog"."default",
  "contacto" varchar(150) COLLATE "pg_catalog"."default",
  "telefono" varchar(50) COLLATE "pg_catalog"."default",
  "correo" varchar(150) COLLATE "pg_catalog"."default",
  "direccion" text COLLATE "pg_catalog"."default",
  "forma_pago" varchar(50) COLLATE "pg_catalog"."default",
  "plazo_credito" int4,
  "ultima_compra" date,
  "monto_promedio" numeric(12,2) DEFAULT 0,
  "activo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of proveedores
-- ----------------------------
INSERT INTO "public"."proveedores" VALUES (2, 'Alexander Julian Navarro', 'SACO', 'SA34OWP2', 'Jefe de Allande', 'Vendedor', '99921302912', 'edualexo@gmail.com', 'jaunw´s', 'efectivo', 23, '2025-12-22', 2.50, 't', '2025-12-22 16:23:55.113155', '2025-12-22 16:29:15.835635');

-- ----------------------------
-- Table structure for rastreabilidad
-- ----------------------------
DROP TABLE IF EXISTS "public"."rastreabilidad";
CREATE TABLE "public"."rastreabilidad" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('rastreabilidad_fi_movimiento_id_seq'::regclass),
  "fi_pileta_origen" int4,
  "fi_pileta_destino" int4,
  "cantidad_trasladada" int4 NOT NULL,
  "fecha_movimiento" date DEFAULT CURRENT_DATE,
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of rastreabilidad
-- ----------------------------
INSERT INTO "public"."rastreabilidad" VALUES (5, 64, 65, 400, '2026-01-17', 'Venta', 1);
INSERT INTO "public"."rastreabilidad" VALUES (6, 63, 66, 25, '2026-01-17', 'Hormonado', 1);
INSERT INTO "public"."rastreabilidad" VALUES (7, 66, 67, 12, '2026-01-17', 'Venta', 1);
INSERT INTO "public"."rastreabilidad" VALUES (8, 70, 68, 128, '2026-01-17', 'Venta', 1);
INSERT INTO "public"."rastreabilidad" VALUES (9, 68, 71, 30, '2026-01-19', 'Venta', 1);
INSERT INTO "public"."rastreabilidad" VALUES (10, 70, 72, 250, '2026-01-21', 'Venta', 1);

-- ----------------------------
-- Table structure for rastreabilidad_reproductores
-- ----------------------------
DROP TABLE IF EXISTS "public"."rastreabilidad_reproductores";
CREATE TABLE "public"."rastreabilidad_reproductores" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('rastreabilidad_reproductores_fi_movimiento_id_seq'::regclass),
  "fi_repro_origen" int4,
  "fi_repro_destino" int4,
  "cantidad_trasladada" int4,
  "fecha_movimiento" date,
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of rastreabilidad_reproductores
-- ----------------------------

-- ----------------------------
-- Table structure for recambios
-- ----------------------------
DROP TABLE IF EXISTS "public"."recambios";
CREATE TABLE "public"."recambios" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_recambios_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fd_fecha1" date,
  "fc_tipo1" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha2" date,
  "fc_tipo2" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha3" date,
  "fc_tipo3" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha4" date,
  "fc_tipo4" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha5" date,
  "fc_tipo5" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha6" date,
  "fc_tipo6" varchar(30) COLLATE "pg_catalog"."default",
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of recambios
-- ----------------------------

-- ----------------------------
-- Table structure for recepcion_insumos
-- ----------------------------
DROP TABLE IF EXISTS "public"."recepcion_insumos";
CREATE TABLE "public"."recepcion_insumos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_recepcion_insumos_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fd_fecha" date NOT NULL,
  "fn_cantidad" varchar(100) COLLATE "pg_catalog"."default",
  "fc_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" varchar(300) COLLATE "pg_catalog"."default",
  "fc_encargado_entrega" varchar(100) COLLATE "pg_catalog"."default",
  "fc_verifico" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default",
  "fc_proveedor" varchar(100) COLLATE "pg_catalog"."default",
  "fc_producto" varchar(255) COLLATE "pg_catalog"."default",
  "fc_unidad_medida" varchar(255) COLLATE "pg_catalog"."default",
  "fc_condiciones_entrega" varchar(150) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of recepcion_insumos
-- ----------------------------
INSERT INTO "public"."recepcion_insumos" VALUES (2, NULL, '2026-01-09', '5', '2', NULL, NULL, 'JC JIMENEZ ARA', '', '2026-01-09 14:37:32.572406', '2026-01-09 14:37:32.572406', 1, 'medellin', 'Ernesto Alandro', 'Alimento', 'Kg', 'Buenas');
INSERT INTO "public"."recepcion_insumos" VALUES (3, NULL, '2026-01-09', '2', '45', NULL, NULL, 'Jose Alfredo', '', '2026-01-09 14:38:39.736136', '2026-01-09 14:38:39.736136', 1, 'ceiba', 'Julio Alonso Mendez', 'Aceite', 'Litros', 'Buena');

-- ----------------------------
-- Table structure for reproductores
-- ----------------------------
DROP TABLE IF EXISTS "public"."reproductores";
CREATE TABLE "public"."reproductores" (
  "fi_reproductor_id" int4 NOT NULL DEFAULT nextval('reproductores_fi_reproductor_id_seq'::regclass),
  "fc_instalacion" varchar(50) COLLATE "pg_catalog"."default",
  "fn_cantidad" int4,
  "fn_talla" numeric(10,2),
  "fn_no_lote" numeric(10,2),
  "fc_observacion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_siembra" date,
  "fd_fecha_biometria" date,
  "fi_usuario_id" int4,
  "fd_fecha_registro" timestamp(6),
  "fn_machos" int4 DEFAULT 0,
  "fn_hembras" int4 DEFAULT 0,
  "fc_ratio" varchar(10) COLLATE "pg_catalog"."default",
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fc_linea" varchar(50) COLLATE "pg_catalog"."default",
  "fc_familia" varchar(20) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of reproductores
-- ----------------------------
INSERT INTO "public"."reproductores" VALUES (4, 'R05', 35, 0.00, 0.00, '26 Hembras, 9 Machos', '2025-04-05', '2025-10-21', 3, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (2, 'Reproductora R01', 130, 0.00, 0.00, '107 HEMBRAS, 23 MACHOS', '2025-04-04', '2025-11-05', 3, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (7, 'R11', 160, 800.00, 1.00, '1 RO, Venta', '2025-03-29', '2025-08-18', 4, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (8, 'P 06', 214, 250.00, 1.00, 'ROCKY MOUNTAIN 1', '2025-03-29', '2025-08-23', 4, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (5, 'R06', 143, 0.00, 0.00, '125 Hembras, 19 Machos', '2025-04-05', '2025-10-21', 3, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (3, 'R03', 145, 0.00, 0.00, '100 HEMBRAS, 45 MACHOS', '2025-05-01', '2025-11-14', 3, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (9, 'Reproductora R02', 150, 0.00, 0.00, '100 Hembras, 60 Machos', '2025-05-08', '2025-11-20', 3, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (10, 'P08', 200, 832.00, 1.00, 'Medellin, VENTAS', '2025-12-04', '2025-12-04', 4, NULL, 0, 0, NULL, NULL, NULL, NULL);
INSERT INTO "public"."reproductores" VALUES (16, 'repro-02', 143, 500.00, 0.00, '', '2025-05-01', '2025-12-16', 1, NULL, 75, 60, '1.3', NULL, 'Alevines', 'F0');
INSERT INTO "public"."reproductores" VALUES (19, 'Repro-01', 144, 500.00, 0.00, '', '2026-01-09', '2026-07-24', 1, NULL, 119, 25, '4.8', NULL, 'alevines', 'F2');
INSERT INTO "public"."reproductores" VALUES (20, 'repro03', 500, 0.10, 0.00, '', '2026-01-06', '2026-09-18', 1, NULL, 100, 189, '0.5', 'Granja Acuícola Medellín', 'Alevines', 'F0');
INSERT INTO "public"."reproductores" VALUES (21, 'Repro03', 500, 1.20, 0.00, '', '2026-01-14', '2026-09-04', 1, NULL, 75, 105, '0.7', 'Granja Acuícola La Ceiba', 'alevine', 'f2');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS "public"."roles";
CREATE TABLE "public"."roles" (
  "fi_rol_id" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" char(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO "public"."roles" VALUES (2, 'Bióloga             ');
INSERT INTO "public"."roles" VALUES (3, 'Jefe de Empresa     ');
INSERT INTO "public"."roles" VALUES (1, 'Administrador       ');

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuarios";
CREATE TABLE "public"."usuarios" (
  "fi_usuario_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" char(20) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_contraseña" char(20) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_rol_id" int4 NOT NULL,
  "fi_empresa_id" int4
)
;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (1, 'admin               ', '1234                ', 1, NULL);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (2, 'biologa             ', '4321                ', 2, NULL);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (3, 'jefegam             ', '2345                ', 3, 1);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (4, 'jefegac             ', '3456                ', 3, 2);

-- ----------------------------
-- Table structure for vacaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."vacaciones";
CREATE TABLE "public"."vacaciones" (
  "fi_vacacion_id" int4 NOT NULL DEFAULT nextval('vacaciones_fi_vacacion_id_seq'::regclass),
  "fc_nombre_empleado" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_empleado_id" int4,
  "fd_inicio_periodo" date NOT NULL,
  "fd_fin_periodo" date NOT NULL,
  "fc_departamento" varchar(80) COLLATE "pg_catalog"."default",
  "fn_dias_trabajados" int4 DEFAULT 0,
  "fn_vacaciones_v" int4 DEFAULT 0,
  "fn_enfermedad_e" int4 DEFAULT 0,
  "fn_maternidad_m" int4 DEFAULT 0,
  "fn_permiso_parcial_pp" int4 DEFAULT 0,
  "fn_permiso_total_pt" int4 DEFAULT 0,
  "fn_inasistencias_i" int4 DEFAULT 0,
  "fn_vacaciones_anio" int4 DEFAULT 0,
  "fn_dias_previos" int4 DEFAULT 0,
  "fn_vacaciones_disponibles" int4 DEFAULT 0,
  "fn_vacaciones_disfrutadas" int4 DEFAULT 0,
  "fd_fecha_actualizacion" timestamp(6) DEFAULT now(),
  "fc_asistencia" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Asistió'::character varying
)
;

-- ----------------------------
-- Records of vacaciones
-- ----------------------------
INSERT INTO "public"."vacaciones" VALUES (5, 'Juan Carlos Jimenez Morales', 10101010, '2024-12-31', '2025-12-30', 'General', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-12-08 18:22:32.176599', 'NO');
INSERT INTO "public"."vacaciones" VALUES (6, 'Juan Carlos Jimenez Ara', 10101011, '2025-01-01', '2025-12-31', 'Direccion', 364, 10, 1, 0, 0, 0, 0, 12, 0, 0, 2, '2025-12-15 14:06:13.13212', 'Asistió');
INSERT INTO "public"."vacaciones" VALUES (4, 'Carlos Manuel Perez Ruiz', 10101014, '2024-12-31', '2025-12-30', 'General', 365, 1, 0, 0, 0, 0, 0, 26, 0, 0, 1, '2025-12-15 14:41:20.189885', 'NO');

-- ----------------------------
-- Table structure for ventas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas";
CREATE TABLE "public"."ventas" (
  "fi_venta_id" int4 NOT NULL DEFAULT nextval('ventas_fi_venta_id_seq'::regclass),
  "fi_usuario_id" int4 NOT NULL,
  "fn_monto_total" numeric(12,2) NOT NULL,
  "fd_fecha_venta" date NOT NULL,
  "fd_fecha_registro" date NOT NULL DEFAULT now(),
  "fd_fecha_modificacion" date NOT NULL DEFAULT now(),
  "fc_lugar_entrega" varchar(100) COLLATE "pg_catalog"."default",
  "fc_estado_pago" text COLLATE "pg_catalog"."default",
  "fc_metodo_pago" text COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_unidad_produccion" varchar(100) COLLATE "pg_catalog"."default",
  "fc_cliente" varchar(150) COLLATE "pg_catalog"."default",
  "fc_granja" text COLLATE "pg_catalog"."default",
  "fn_talla" numeric(10,2),
  "fn_cantidad_vendida" int4,
  "fn_precio_venta" numeric(10,2),
  "fc_estado" text COLLATE "pg_catalog"."default",
  "fc_encargado_venta" text COLLATE "pg_catalog"."default",
  "fc_estanque_cosecha" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of ventas
-- ----------------------------
INSERT INTO "public"."ventas" VALUES (42, 1, 120.00, '2025-11-15', '2025-11-27', '2025-12-04', 'Pie de Granja', 'Parcial', 'Efectivo', 'Ninguna', 'MEDICAMENTO', 'Armando Hernandez', 'Medellin', NULL, 10, 12.00, 'Tabasco', 'Juan Carlos Jimenez Ara', 'L05');
INSERT INTO "public"."ventas" VALUES (45, 1, 7.80, '2025-12-04', '2025-12-04', '2025-12-04', 'Ixtacomitán', '', '', 'Ninguna', 'KG', 'Armando Hernandez', 'La Ceiba', NULL, 5, 1.56, '', 'admin               ', '');
INSERT INTO "public"."ventas" VALUES (46, 1, 625000.00, '2025-12-22', '2025-12-22', '2025-12-23', 'medellin', 'PENDIENTE', 'EFECTIVO', '', '201', 'Alexander', 'Medellin', 2.00, 2500, 250.00, 'PENDIENTE', 'admin               ', '');
INSERT INTO "public"."ventas" VALUES (44, 3, 600.00, '2025-10-09', '2025-11-27', '2025-12-23', 'Chontalpa', 'Pagado', 'Efectivo', 'Ninguna', 'ALEVIN', 'JULIAN GONZALEZ', 'La Ceiba', 12.00, 3, 200.00, 'Tabasco', 'jefegam             ', '');
INSERT INTO "public"."ventas" VALUES (47, 1, 1200.00, '2026-01-06', '2026-01-06', '2026-01-06', 'Pie de granja', '', '', '', 'ALEVIN', 'Armando Hernandez', 'Medellin', 0.60, 1000, 1.20, '', 'admin               ', '');
INSERT INTO "public"."ventas" VALUES (43, 1, 240.00, '2025-11-15', '2025-11-27', '2025-11-27', 'Comalcalco', 'PENDIENTE', 'EFECTIVO', '', 'ALEVIN', 'ARTEMIO MORENO', 'LA CEIBA', 0.18, 200, 1.20, 'PENDIENTE', 'Juan Carlos Morales', 'L20');
INSERT INTO "public"."ventas" VALUES (41, 1, 45000.00, '2025-11-12', '2025-11-26', '2025-11-27', 'Pie de granja', 'PENDIENTE', 'EFECTIVO', '', 'KG', 'Armando Hernandez', 'MEDELLIN', NULL, 60, 750.00, 'Campeche', 'Juan Carlos Jimenez', 'L01');

-- ----------------------------
-- Table structure for visitas
-- ----------------------------
DROP TABLE IF EXISTS "public"."visitas";
CREATE TABLE "public"."visitas" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_visitas_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_nombre_completo" varchar(200) COLLATE "pg_catalog"."default",
  "fc_origen" varchar(200) COLLATE "pg_catalog"."default",
  "fc_motivo" varchar(300) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_foto_identificacion" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default",
  "fd_entrada" time(6),
  "fd_salida" time(6)
)
;

-- ----------------------------
-- Records of visitas
-- ----------------------------
INSERT INTO "public"."visitas" VALUES (4, '2026-01-08', 'Adrian Felix Felez', 'Campeche', 'Empleo', '', NULL, '2026-01-09 15:29:17.383992', '2026-01-09 15:29:17.383992', 1, 'ceiba', '15:26:00', '16:26:00');
INSERT INTO "public"."visitas" VALUES (5, '2026-01-09', 'Julian Alonso Perez', 'Macuspana', 'Vendedor', 'No', NULL, '2026-01-09 15:30:18.284792', '2026-01-09 15:30:18.284792', 1, 'ceiba', '16:30:00', '18:30:00');

-- ----------------------------
-- Procedure structure for sp_limpiarpiletassininstalacion
-- ----------------------------
DROP PROCEDURE IF EXISTS "public"."sp_limpiarpiletassininstalacion"();
CREATE PROCEDURE "public"."sp_limpiarpiletassininstalacion"()
 AS $BODY$
DECLARE
    v_contador_piletas INT := 0;
    v_contador_alimentos INT := 0;
    v_contador_rastreabilidad INT := 0;
BEGIN
    -- Inicia la transacción manualmente
    PERFORM pg_advisory_xact_lock(99999);

    -- 🔹 Eliminar dependencias de alimentos
    DELETE FROM alimentos
    WHERE fi_pileta_id IN (
        SELECT fi_pileta_id
        FROM piletas
        WHERE fi_instalacion_id IS NULL
    );

    GET DIAGNOSTICS v_contador_alimentos = ROW_COUNT;
    RAISE NOTICE '🧾 Se eliminaron % registros en la tabla alimentos.', v_contador_alimentos;

    -- 🔹 Eliminar dependencias en rastreabilidad
    DELETE FROM rastreabilidad
    WHERE fi_pileta_origen IN (
        SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id IS NULL
    )
    OR fi_pileta_destino IN (
        SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id IS NULL
    );

    GET DIAGNOSTICS v_contador_rastreabilidad = ROW_COUNT;
    RAISE NOTICE '🔁 Se eliminaron % registros en rastreabilidad.', v_contador_rastreabilidad;

    -- 🔹 Finalmente eliminar las piletas huérfanas
    DELETE FROM piletas
    WHERE fi_instalacion_id IS NULL;

    GET DIAGNOSTICS v_contador_piletas = ROW_COUNT;
    RAISE NOTICE '✅ Se eliminaron % piletas sin instalación.', v_contador_piletas;

    RAISE NOTICE '🧹 Limpieza completada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Error al limpiar piletas sin instalación: %', SQLERRM;
END;
$BODY$
  LANGUAGE plpgsql;

-- ----------------------------
-- View structure for vw_tesoreria_overview
-- ----------------------------
DROP VIEW IF EXISTS "public"."vw_tesoreria_overview";
CREATE VIEW "public"."vw_tesoreria_overview" AS  SELECT EXTRACT(year FROM f.fd_fecha) AS anio,
    to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text) AS periodo,
    c.tipo_principal AS grupo,
    COALESCE(c.subcategoria, 'SIN SUBCATEGORIA'::character varying) AS subgrupo,
    c.nombre AS categoria,
    sum(f.fn_ingreso) AS total_ingreso,
    sum(f.fn_egreso) AS total_egreso,
    sum(f.fn_ingreso) - sum(f.fn_egreso) AS saldo_neto
   FROM flujo_caja f
     LEFT JOIN categorias c ON f.fc_categoria::text = c.nombre::text
  GROUP BY (EXTRACT(year FROM f.fd_fecha)), (to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text)), c.tipo_principal, c.subcategoria, c.nombre
  ORDER BY (EXTRACT(year FROM f.fd_fecha)), (to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text)), c.tipo_principal, c.subcategoria, c.nombre;

-- ----------------------------
-- View structure for vw_tesoreria_general
-- ----------------------------
DROP VIEW IF EXISTS "public"."vw_tesoreria_general";
CREATE VIEW "public"."vw_tesoreria_general" AS  SELECT fc_granja,
    fc_mes,
    fc_categoria,
    sum(fn_ingreso) AS total_ingreso,
    sum(fn_egreso) AS total_egreso,
    sum(fn_ingreso - fn_egreso) AS saldo_neto
   FROM flujo_caja
  WHERE fn_ingreso IS NOT NULL OR fn_egreso IS NOT NULL
  GROUP BY fc_granja, fc_mes, fc_categoria
  ORDER BY fc_granja, fc_mes, fc_categoria;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."alimentos_fi_alimento_id"
OWNED BY "public"."alimentos"."fi_alimento_id";
SELECT setval('"public"."alimentos_fi_alimento_id"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."alimentos_fi_alimento_id_seq"
OWNED BY "public"."alimentos"."fi_alimento_id";
SELECT setval('"public"."alimentos_fi_alimento_id_seq"', 29, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."caja_ahorro_movimientos_id_seq"
OWNED BY "public"."caja_ahorro_movimientos"."id";
SELECT setval('"public"."caja_ahorro_movimientos_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."caja_ahorro_resumen_id_seq"
OWNED BY "public"."caja_ahorro_resumen"."id";
SELECT setval('"public"."caja_ahorro_resumen_id_seq"', 14, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cat_caja_ahorro_categorias_id_seq"
OWNED BY "public"."cat_caja_ahorro_categorias"."id";
SELECT setval('"public"."cat_caja_ahorro_categorias_id_seq"', 12, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cat_tesoreria_categorias_fi_categoria_id_seq"
OWNED BY "public"."cat_tesoreria_categorias"."fi_categoria_id";
SELECT setval('"public"."cat_tesoreria_categorias_fi_categoria_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."categorias_id_seq"
OWNED BY "public"."categorias"."id";
SELECT setval('"public"."categorias_id_seq"', 55, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_alimentacion_fi_id_seq"
OWNED BY "public"."alimentacion"."fi_id";
SELECT setval('"public"."ceiba_alimentacion_fi_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_biometrias_fi_id_seq"
OWNED BY "public"."biometrias"."fi_id";
SELECT setval('"public"."ceiba_biometrias_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_insumos_fi_id_seq"
OWNED BY "public"."insumos"."fi_id";
SELECT setval('"public"."ceiba_insumos_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_limpieza_fi_id_seq"
OWNED BY "public"."limpieza"."fi_id";
SELECT setval('"public"."ceiba_limpieza_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."alevines_fi_alevines_id_seq"
OWNED BY "public"."alevines"."fi_alevines_id";
SELECT setval('"public"."alevines_fi_alevines_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."movimiento_alevines_fi_movimiento_alevines_id_seq"
OWNED BY "public"."movimiento_alevines"."fi_movimiento_alevines_id";
SELECT setval('"public"."movimiento_alevines_fi_movimiento_alevines_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clientes_fi_cliente_id_seq"
OWNED BY "public"."clientes"."fi_cliente_id";
SELECT setval('"public"."clientes_fi_cliente_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."engorda_fi_engorda_id_seq"
OWNED BY "public"."engorda"."fi_engorda_id";
SELECT setval('"public"."engorda_fi_engorda_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."equipos_fi_equipo_id_seq"
OWNED BY "public"."equipos"."fi_equipo_id";
SELECT setval('"public"."equipos_fi_equipo_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."expedientes_fi_expediente_id_seq"
OWNED BY "public"."expedientes"."fi_expediente_id";
SELECT setval('"public"."expedientes_fi_expediente_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."flujo_caja_fi_movimiento_id_seq"
OWNED BY "public"."flujo_caja"."fi_movimiento_id";
SELECT setval('"public"."flujo_caja_fi_movimiento_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."instalaciones_fi_instalacion_id_seq"
OWNED BY "public"."instalaciones"."fi_instalacion_id";
SELECT setval('"public"."instalaciones_fi_instalacion_id_seq"', 21, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."lista_espera_fi_lista_id_seq"
OWNED BY "public"."lista_espera"."fi_lista_id";
SELECT setval('"public"."lista_espera_fi_lista_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."mantenimientos_fi_mantenimiento_id_seq"
OWNED BY "public"."mantenimientos"."fi_mantenimiento_id";
SELECT setval('"public"."mantenimientos_fi_mantenimiento_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_banos_fi_id_seq"
OWNED BY "public"."banos"."fi_id";
SELECT setval('"public"."medellin_banos_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_inventario_alevines_fi_id_seq"
OWNED BY "public"."inventario_alevines"."fi_id";
SELECT setval('"public"."medellin_inventario_alevines_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_medicamentos_fi_id_seq"
OWNED BY "public"."medicamentos"."fi_id";
SELECT setval('"public"."medellin_medicamentos_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_parametros_fi_id_seq"
OWNED BY "public"."parametros"."fi_id";
SELECT setval('"public"."medellin_parametros_fi_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_plagas_fi_id_seq"
OWNED BY "public"."plagas"."fi_id";
SELECT setval('"public"."medellin_plagas_fi_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_recambios_fi_id_seq"
OWNED BY "public"."recambios"."fi_id";
SELECT setval('"public"."medellin_recambios_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_recepcion_insumos_fi_id_seq"
OWNED BY "public"."recepcion_insumos"."fi_id";
SELECT setval('"public"."medellin_recepcion_insumos_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_visitas_fi_id_seq"
OWNED BY "public"."visitas"."fi_id";
SELECT setval('"public"."medellin_visitas_fi_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."nomina_fi_nomina_id_seq"
OWNED BY "public"."nomina"."fi_nomina_id";
SELECT setval('"public"."nomina_fi_nomina_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."piletas_fi_pileta_id_seq"
OWNED BY "public"."piletas"."fi_pileta_id";
SELECT setval('"public"."piletas_fi_pileta_id_seq"', 73, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."proveedores_id_seq"
OWNED BY "public"."proveedores"."id";
SELECT setval('"public"."proveedores_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."rastreabilidad_fi_movimiento_id_seq"
OWNED BY "public"."rastreabilidad"."fi_movimiento_id";
SELECT setval('"public"."rastreabilidad_fi_movimiento_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."rastreabilidad_reproductores_fi_movimiento_id_seq"
OWNED BY "public"."rastreabilidad_reproductores"."fi_movimiento_id";
SELECT setval('"public"."rastreabilidad_reproductores_fi_movimiento_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."reproductores_fi_reproductor_id_seq"
OWNED BY "public"."reproductores"."fi_reproductor_id";
SELECT setval('"public"."reproductores_fi_reproductor_id_seq"', 21, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."roles_fi_rol_id_seq"
OWNED BY "public"."roles"."fi_rol_id";
SELECT setval('"public"."roles_fi_rol_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuarios_fi_usuario_id_seq"
OWNED BY "public"."usuarios"."fi_usuario_id";
SELECT setval('"public"."usuarios_fi_usuario_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."vacaciones_fi_vacacion_id_seq"
OWNED BY "public"."vacaciones"."fi_vacacion_id";
SELECT setval('"public"."vacaciones_fi_vacacion_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ventas_fi_venta_id_seq"
OWNED BY "public"."ventas"."fi_venta_id";
SELECT setval('"public"."ventas_fi_venta_id_seq"', 47, true);

-- ----------------------------
-- Primary Key structure for table alimentacion
-- ----------------------------
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "ceiba_alimentacion_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Auto increment value for alimentos
-- ----------------------------
SELECT setval('"public"."alimentos_fi_alimento_id_seq"', 29, true);

-- ----------------------------
-- Indexes structure for table alimentos
-- ----------------------------
CREATE UNIQUE INDEX "xpkalimentos" ON "public"."alimentos" USING btree (
  "fi_alimento_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table alimentos
-- ----------------------------
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_pkey" PRIMARY KEY ("fi_alimento_id");

-- ----------------------------
-- Primary Key structure for table banos
-- ----------------------------
ALTER TABLE "public"."banos" ADD CONSTRAINT "medellin_banos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table biometrias
-- ----------------------------
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "ceiba_biometrias_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Checks structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_tipo_movimiento_check" CHECK (tipo_movimiento::text = ANY (ARRAY['INGRESO'::character varying, 'EGRESO'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table caja_ahorro_resumen
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_resumen" ADD CONSTRAINT "caja_ahorro_resumen_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table cat_caja_ahorro_categorias
-- ----------------------------
ALTER TABLE "public"."cat_caja_ahorro_categorias" ADD CONSTRAINT "cat_caja_ahorro_categorias_tipo_check" CHECK (tipo::text = ANY (ARRAY['INGRESO'::character varying, 'EGRESO'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table cat_caja_ahorro_categorias
-- ----------------------------
ALTER TABLE "public"."cat_caja_ahorro_categorias" ADD CONSTRAINT "cat_caja_ahorro_categorias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table cat_tesoreria_categorias
-- ----------------------------
ALTER TABLE "public"."cat_tesoreria_categorias" ADD CONSTRAINT "cat_tesoreria_categorias_pkey" PRIMARY KEY ("fi_categoria_id");

-- ----------------------------
-- Uniques structure for table categorias
-- ----------------------------
ALTER TABLE "public"."categorias" ADD CONSTRAINT "categorias_nombre_key" UNIQUE ("nombre");

-- ----------------------------
-- Checks structure for table categorias
-- ----------------------------
ALTER TABLE "public"."categorias" ADD CONSTRAINT "categorias_tipo_principal_check" CHECK (tipo_principal::text = ANY (ARRAY['INGRESO'::character varying, 'CAPITAL'::character varying, 'GASTOS OPERATIVOS'::character varying]::text[]));
ALTER TABLE "public"."categorias" ADD CONSTRAINT "categorias_subcategoria_check" CHECK ((subcategoria::text = ANY (ARRAY['RECURSOS HUMANOS'::character varying, 'LOGISTICA'::character varying, 'SERVICIOS'::character varying, 'RECURSOS MATERIALES'::character varying, 'INSTALACIONES'::character varying, 'AJUSTE DE CAPITALES'::character varying]::text[])) OR subcategoria IS NULL);

-- ----------------------------
-- Primary Key structure for table categorias
-- ----------------------------
ALTER TABLE "public"."categorias" ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for clientes
-- ----------------------------
SELECT setval('"public"."clientes_fi_cliente_id_seq"', 7, true);

-- ----------------------------
-- Indexes structure for table clientes
-- ----------------------------
CREATE UNIQUE INDEX "xpkclientes" ON "public"."clientes" USING btree (
  "fi_cliente_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("fi_cliente_id");

-- ----------------------------
-- Primary Key structure for table engorda
-- ----------------------------
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_pkey" PRIMARY KEY ("fi_engorda_id");

-- ----------------------------
-- Primary Key structure for table equipos
-- ----------------------------
ALTER TABLE "public"."equipos" ADD CONSTRAINT "equipos_pkey" PRIMARY KEY ("fi_equipo_id");

-- ----------------------------
-- Indexes structure for table expedientes
-- ----------------------------
CREATE INDEX "idx_expedientes_nombre" ON "public"."expedientes" USING btree (
  "fc_nombre" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table expedientes
-- ----------------------------
ALTER TABLE "public"."expedientes" ADD CONSTRAINT "expedientes_pkey" PRIMARY KEY ("fi_expediente_id");

-- ----------------------------
-- Checks structure for table flujo_caja
-- ----------------------------
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_fc_estatus_check" CHECK (fc_estatus::text = ANY (ARRAY['REPOSICION'::character varying, 'LIQUIDADO'::character varying, 'ADEUDO'::character varying, 'PARCIAL'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table flujo_caja
-- ----------------------------
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Uniques structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_nombre_instalacion_key" UNIQUE ("nombre_instalacion");

-- ----------------------------
-- Checks structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_altura_check" CHECK (altura > 0::numeric);
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "chk_instalaciones_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_largo_check" CHECK (largo > 0::numeric);
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "chk_fc_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_ancho_check" CHECK (ancho > 0::numeric);

-- ----------------------------
-- Primary Key structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_pkey" PRIMARY KEY ("fi_instalacion_id");

-- ----------------------------
-- Primary Key structure for table insumos
-- ----------------------------
ALTER TABLE "public"."insumos" ADD CONSTRAINT "ceiba_insumos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table inventario_alevines
-- ----------------------------
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "medellin_inventario_alevines_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table limpieza
-- ----------------------------
ALTER TABLE "public"."limpieza" ADD CONSTRAINT "ceiba_limpieza_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table lista_espera
-- ----------------------------
ALTER TABLE "public"."lista_espera" ADD CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("fi_lista_id");

-- ----------------------------
-- Primary Key structure for table mantenimientos
-- ----------------------------
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("fi_mantenimiento_id");

-- ----------------------------
-- Primary Key structure for table medicamentos
-- ----------------------------
ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medellin_medicamentos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table alevines
-- ----------------------------
ALTER TABLE "public"."alevines" ADD CONSTRAINT "alevines_pkey" PRIMARY KEY ("fi_alevines_id");

-- ----------------------------
-- Indexes structure for table movimiento_alevines
-- ----------------------------
CREATE INDEX "fki_fi_alevines_id" ON "public"."movimiento_alevines" USING btree (
  "fi_alevines_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "xpkmovimiento_alevines" ON "public"."movimiento_alevines" USING btree (
  "fi_movimiento_alevines_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table movimiento_alevines
-- ----------------------------
ALTER TABLE "public"."movimiento_alevines" ADD CONSTRAINT "movimiento_alevines_pkey" PRIMARY KEY ("fi_movimiento_alevines_id");

-- ----------------------------
-- Primary Key structure for table nomina
-- ----------------------------
ALTER TABLE "public"."nomina" ADD CONSTRAINT "nomina_pkey" PRIMARY KEY ("fi_nomina_id");

-- ----------------------------
-- Primary Key structure for table parametros
-- ----------------------------
ALTER TABLE "public"."parametros" ADD CONSTRAINT "medellin_parametros_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Auto increment value for piletas
-- ----------------------------
SELECT setval('"public"."piletas_fi_pileta_id_seq"', 73, true);

-- ----------------------------
-- Indexes structure for table piletas
-- ----------------------------
CREATE UNIQUE INDEX "xpkpiletas" ON "public"."piletas" USING btree (
  "fi_pileta_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Checks structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "chk_fc_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));
ALTER TABLE "public"."piletas" ADD CONSTRAINT "chk_piletas_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_pkey" PRIMARY KEY ("fi_pileta_id");

-- ----------------------------
-- Primary Key structure for table plagas
-- ----------------------------
ALTER TABLE "public"."plagas" ADD CONSTRAINT "medellin_plagas_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table proveedores
-- ----------------------------
ALTER TABLE "public"."proveedores" ADD CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table rastreabilidad
-- ----------------------------
ALTER TABLE "public"."rastreabilidad" ADD CONSTRAINT "rastreabilidad_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Primary Key structure for table rastreabilidad_reproductores
-- ----------------------------
ALTER TABLE "public"."rastreabilidad_reproductores" ADD CONSTRAINT "rastreabilidad_reproductores_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Primary Key structure for table recambios
-- ----------------------------
ALTER TABLE "public"."recambios" ADD CONSTRAINT "medellin_recambios_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table recepcion_insumos
-- ----------------------------
ALTER TABLE "public"."recepcion_insumos" ADD CONSTRAINT "medellin_recepcion_insumos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table reproductores
-- ----------------------------
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_pkey" PRIMARY KEY ("fi_reproductor_id");

-- ----------------------------
-- Auto increment value for roles
-- ----------------------------
SELECT setval('"public"."roles_fi_rol_id_seq"', 2, true);

-- ----------------------------
-- Indexes structure for table roles
-- ----------------------------
CREATE UNIQUE INDEX "xpkroles" ON "public"."roles" USING btree (
  "fi_rol_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table roles
-- ----------------------------
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("fi_rol_id");

-- ----------------------------
-- Auto increment value for usuarios
-- ----------------------------
SELECT setval('"public"."usuarios_fi_usuario_id_seq"', 4, true);

-- ----------------------------
-- Indexes structure for table usuarios
-- ----------------------------
CREATE INDEX "fki_fi_rol_id" ON "public"."usuarios" USING btree (
  "fi_rol_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "xpkusuarios" ON "public"."usuarios" USING btree (
  "fi_usuario_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("fi_usuario_id");

-- ----------------------------
-- Primary Key structure for table vacaciones
-- ----------------------------
ALTER TABLE "public"."vacaciones" ADD CONSTRAINT "vacaciones_pkey" PRIMARY KEY ("fi_vacacion_id");

-- ----------------------------
-- Indexes structure for table ventas
-- ----------------------------
CREATE UNIQUE INDEX "xpkventas" ON "public"."ventas" USING btree (
  "fi_venta_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ventas
-- ----------------------------
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_pkey" PRIMARY KEY ("fi_venta_id");

-- ----------------------------
-- Primary Key structure for table visitas
-- ----------------------------
ALTER TABLE "public"."visitas" ADD CONSTRAINT "medellin_visitas_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Foreign Keys structure for table alimentos
-- ----------------------------
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_alimentos_engorda" FOREIGN KEY ("fi_engorda_id") REFERENCES "public"."engorda" ("fi_engorda_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_pileta" FOREIGN KEY ("fi_pileta_id") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_reproductor" FOREIGN KEY ("fi_reproductor_id") REFERENCES "public"."reproductores" ("fi_reproductor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_usuario_alimentos" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."cat_caja_ahorro_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "fi_usuario_id" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table engorda
-- ----------------------------
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table equipos
-- ----------------------------
ALTER TABLE "public"."equipos" ADD CONSTRAINT "equipos_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table flujo_caja
-- ----------------------------
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table mantenimientos
-- ----------------------------
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_fi_equipo_id_fkey" FOREIGN KEY ("fi_equipo_id") REFERENCES "public"."equipos" ("fi_equipo_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table movimiento_alevines
-- ----------------------------
ALTER TABLE "public"."movimiento_alevines" ADD CONSTRAINT "fi_pileta_id" FOREIGN KEY ("fi_pileta_id") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."movimiento_alevines" ADD CONSTRAINT "fi_usuario_id" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_fi_instalacion_id_fkey" FOREIGN KEY ("fi_instalacion_id") REFERENCES "public"."instalaciones" ("fi_instalacion_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table rastreabilidad
-- ----------------------------
ALTER TABLE "public"."rastreabilidad" ADD CONSTRAINT "rastreabilidad_fi_pileta_destino_fkey" FOREIGN KEY ("fi_pileta_destino") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."rastreabilidad" ADD CONSTRAINT "rastreabilidad_fi_pileta_origen_fkey" FOREIGN KEY ("fi_pileta_origen") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."rastreabilidad" ADD CONSTRAINT "rastreabilidad_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "fi_rol_id" FOREIGN KEY ("fi_rol_id") REFERENCES "public"."roles" ("fi_rol_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas
-- ----------------------------
ALTER TABLE "public"."ventas" ADD CONSTRAINT "fi_usuario_id" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

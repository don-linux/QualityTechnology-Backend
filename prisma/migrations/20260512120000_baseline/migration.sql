-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalogos";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rrhh";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "seguridad";

-- CreateEnum
CREATE TYPE "public"."PiletaEstado" AS ENUM ('vacia', 'ocupada');

-- CreateEnum
CREATE TYPE "public"."PiletaTipo" AS ENUM ('alevinaje', 'reproductores', 'engorda');

-- CreateTable
CREATE TABLE "catalogos"."estados" (
    "fi_estado_id" SERIAL NOT NULL,
    "fc_nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("fi_estado_id")
);

-- CreateTable
CREATE TABLE "public"."actas_administrativas" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "descripcion" VARCHAR(500),
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actas_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alevinaje" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lote" VARCHAR(60) NOT NULL,
    "huevos_ml" DECIMAL(10,2),
    "ovadas" INTEGER NOT NULL DEFAULT 0,
    "alevines_iniciales" INTEGER NOT NULL,
    "mortalidad" INTEGER NOT NULL DEFAULT 0,
    "mortalidad_porcentaje" DECIMAL(6,2) NOT NULL,
    "observacion_id" INTEGER,
    "biometria_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "alevinaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alimentacion" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE,
    "mes" VARCHAR(20),
    "pileta_id" INTEGER,
    "fecha_siembra" DATE,
    "origen_alevines" VARCHAR(200),
    "peso_promedio_entrada" DECIMAL(12,3),
    "total_alimento_kg" DECIMAL(12,3),
    "mortalidad" INTEGER,
    "recambio_agua" VARCHAR(50),
    "temperatura_agua" DECIMAL(6,2),
    "amonio" DECIMAL(10,4),
    "ph" DECIMAL(5,2),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "alimentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alimentos" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER,
    "engorda_id" INTEGER,
    "reproductor_id" INTEGER,
    "milimetros_particula" DECIMAL(10,2),
    "cantidad_dia" DECIMAL(10,3),
    "porcion" DECIMAL(10,3),
    "costo_total" DECIMAL(12,2),
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "alimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."banos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "tipo_banio" VARCHAR(20),
    "regadera" VARCHAR(100),
    "realizado_por" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "banos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."biometrias" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peso_total_gramos" DECIMAL(12,3),
    "organismos_muestreados" INTEGER,
    "peso_promedio" DECIMAL(10,3),
    "encargado" VARCHAR(120),
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometrias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caja_ahorro" (
    "id" SERIAL NOT NULL,
    "granja" VARCHAR(120) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "concepto" VARCHAR(200),
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" DATE,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "caja_ahorro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "empresa" VARCHAR(150),
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cuentas" (
    "id" SERIAL NOT NULL,
    "unidad_negocio" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "numero_cuenta" VARCHAR(50),
    "banco" VARCHAR(150),
    "tipo_cuenta" VARCHAR(20) NOT NULL,
    "saldo_actual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "esta_activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documentos_empleado" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "tipo_documento_id" INTEGER,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."empleados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido_paterno" VARCHAR(100) NOT NULL,
    "apellido_materno" VARCHAR(100),
    "usuario_id" INTEGER,
    "puesto_id" INTEGER,
    "departamento_id" INTEGER,
    "sueldo_base" DECIMAL(12,2),
    "fecha_ingreso" DATE,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engorda" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "talla_gr" DECIMAL(10,2),
    "observacion_id" INTEGER,
    "siembra_id" INTEGER,
    "biometria_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "engorda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(80),
    "marca" VARCHAR(80),
    "modelo" VARCHAR(80),
    "serial" VARCHAR(80),
    "usuario_id" INTEGER,
    "estado" VARCHAR(30),
    "observaciones" VARCHAR(300),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flujo_caja" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "ingreso" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "egreso" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descripcion" VARCHAR(200),
    "cuenta_nombre" VARCHAR(50),
    "categoria" VARCHAR(100),
    "subcategoria" VARCHAR(100),
    "beneficiario" VARCHAR(100),
    "estatus" VARCHAR(20),
    "mes_periodo" VARCHAR(7),
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "flujo_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instalaciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(80),
    "granja" VARCHAR(120) NOT NULL,
    "capacidad" DECIMAL(12,2),
    "observaciones" VARCHAR(300),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "instalaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insumos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "cantidad_udm" VARCHAR(100),
    "numero_lote" VARCHAR(100),
    "descripcion" VARCHAR(300),
    "encargado_entrega" VARCHAR(100),
    "encargado_recepcion" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventario_alevines" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "pileta_id" INTEGER,
    "lote_nombre" VARCHAR(100),
    "cantidad" INTEGER,
    "talla" DECIMAL(10,2),
    "observacion_id" INTEGER,
    "fecha_siembra" DATE,
    "fecha_salida_hormonado" DATE,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "inventario_alevines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lista_espera" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "cliente_nombre" VARCHAR(150) NOT NULL,
    "cantidad_peces" INTEGER,
    "precio_unitario" DECIMAL(10,2),
    "notas" VARCHAR(500),
    "estatus" VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lotes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "instalacion_id" INTEGER NOT NULL,
    "familia" VARCHAR(60),
    "fecha_ingreso" DATE,
    "cantidad" INTEGER,
    "estatus" VARCHAR(30),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mantenimientos" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "fecha" DATE NOT NULL,
    "costo" DECIMAL(12,2),
    "responsable" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medicamentos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "numero_estanque" INTEGER,
    "diagnostico" VARCHAR(500),
    "tratamiento" VARCHAR(500),
    "dosis" VARCHAR(100),
    "forma_aplicacion" VARCHAR(100),
    "fecha_ultima_dosis" DATE,
    "responsable" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modulos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "ruta" VARCHAR(120) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nomina" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "periodo" VARCHAR(20) NOT NULL,
    "sueldo_bruto" DECIMAL(12,2) NOT NULL,
    "descuentos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sueldo_neto" DECIMAL(12,2) NOT NULL,
    "fecha_pago" DATE NOT NULL,
    "observaciones" VARCHAR(300),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "nomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."observacion" (
    "id" SERIAL NOT NULL,
    "comentario" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parametros" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "numero_estanque" INTEGER,
    "oxigeno" DECIMAL(8,3),
    "temperatura" DECIMAL(6,2),
    "ph" DECIMAL(5,2),
    "amonio" DECIMAL(10,4),
    "nitritos" DECIMAL(10,4),
    "nitratos" DECIMAL(10,4),
    "responsable" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."piletas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "largo" DECIMAL(10,2) NOT NULL,
    "ancho" DECIMAL(10,2) NOT NULL,
    "alto" DECIMAL(10,2) NOT NULL,
    "metros_cubicos" DECIMAL(14,3) NOT NULL,
    "material" VARCHAR(80) NOT NULL,
    "estado" "public"."PiletaEstado" NOT NULL DEFAULT 'vacia',
    "tipo" "public"."PiletaTipo" NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "piletas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plagas" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "unidad_produccion" VARCHAR(100),
    "fecha" DATE NOT NULL,
    "numero_trampa" VARCHAR(100),
    "tipo_trampa" VARCHAR(100),
    "hallazgo" VARCHAR(500),
    "malla" VARCHAR(200),
    "veneno" VARCHAR(100),
    "verificador" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "plagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "rfc" VARCHAR(13),
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "direccion" VARCHAR(255),
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."puestos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recambios" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "mes_periodo" VARCHAR(20),
    "pileta_id" INTEGER,
    "fecha_1" DATE,
    "tipo_1" VARCHAR(30),
    "fecha_2" DATE,
    "tipo_2" VARCHAR(30),
    "fecha_3" DATE,
    "tipo_3" VARCHAR(30),
    "fecha_4" DATE,
    "tipo_4" VARCHAR(30),
    "fecha_5" DATE,
    "tipo_5" VARCHAR(30),
    "fecha_6" DATE,
    "tipo_6" VARCHAR(30),
    "responsable" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "recambios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recepcion_insumos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "proveedor_nombre" VARCHAR(100),
    "producto" VARCHAR(255),
    "unidad_medida" VARCHAR(255),
    "cantidad" DECIMAL(15,2),
    "numero_lote" VARCHAR(100),
    "condiciones_entrega" VARCHAR(150),
    "encargado_entrega" VARCHAR(100),
    "verificador" VARCHAR(100),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "recepcion_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "fecha_expiracion" TIMESTAMP(6) NOT NULL,
    "es_revocado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reproductores" (
    "id" SERIAL NOT NULL,
    "pileta_id" INTEGER NOT NULL,
    "machos" INTEGER NOT NULL DEFAULT 0,
    "hembras" INTEGER NOT NULL DEFAULT 0,
    "cantidad_total" INTEGER NOT NULL,
    "talla" DECIMAL(10,2),
    "ratio" VARCHAR(20),
    "linea" VARCHAR(60),
    "familia" VARCHAR(60),
    "observacion_id" INTEGER,
    "siembra_id" INTEGER,
    "biometria_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "reproductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "es_root" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles_modulos" (
    "rol_id" INTEGER NOT NULL,
    "modulo_id" INTEGER NOT NULL,

    CONSTRAINT "roles_modulos_pkey" PRIMARY KEY ("rol_id","modulo_id")
);

-- CreateTable
CREATE TABLE "public"."siembra" (
    "id" SERIAL NOT NULL,
    "pileta_origen" INTEGER,
    "pileta_destino" INTEGER NOT NULL,
    "cantidad" BIGINT NOT NULL,
    "mortalidad" INTEGER NOT NULL DEFAULT 0,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siembra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tipos_documento" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ubicacion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "direccion" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unidades_negocio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "unidades_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vacaciones" (
    "id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "dias_tomados" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'ordinarias',
    "estatus" VARCHAR(30) NOT NULL DEFAULT 'aprobadas',
    "observaciones" VARCHAR(300),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "vacaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ventas" (
    "id" SERIAL NOT NULL,
    "folio" VARCHAR(50),
    "fecha" DATE NOT NULL,
    "cliente_nombre" VARCHAR(150) NOT NULL,
    "tipo_venta" VARCHAR(50) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_abonado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "monto_adeudo" DECIMAL(12,2) NOT NULL GENERATED ALWAYS AS ((monto_total - monto_abonado)) STORED,
    "estado_pago" VARCHAR(20) NOT NULL DEFAULT 'ADEUDO',
    "empresa" VARCHAR(255) NOT NULL,
    "vendedor_nombre" VARCHAR(255),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."visitas" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_entrada" TIME(6),
    "hora_salida" TIME(6),
    "nombre_completo" VARCHAR(200),
    "procedencia" VARCHAR(200),
    "motivo" VARCHAR(300) NOT NULL,
    "foto_identificacion" VARCHAR(200),
    "observacion_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "visitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rrhh"."departamentos" (
    "fi_departamento_id" SERIAL NOT NULL,
    "fc_nombre" VARCHAR(80) NOT NULL,
    "fb_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("fi_departamento_id")
);

-- CreateTable
CREATE TABLE "rrhh"."empleados" (
    "fi_empleado_id" SERIAL NOT NULL,
    "fi_usuario_id" INTEGER,
    "fi_departamento_id" INTEGER NOT NULL,
    "fi_estado_id" INTEGER NOT NULL,
    "fc_ciudad" VARCHAR(60) NOT NULL,
    "fc_nombre" VARCHAR(60) NOT NULL,
    "fc_apellido_paterno" VARCHAR(60) NOT NULL,
    "fc_apellido_materno" VARCHAR(60) NOT NULL,
    "fd_fecha_nacimiento" DATE NOT NULL,
    "fc_calle" VARCHAR(120) NOT NULL,
    "fc_codigo_postal" VARCHAR(10) NOT NULL,
    "fc_referencias" VARCHAR(255),
    "ft_comentarios_adicionales" TEXT,
    "fd_fecha_alta" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("fi_empleado_id")
);

-- CreateTable
CREATE TABLE "seguridad"."modulos" (
    "fi_modulo_id" SERIAL NOT NULL,
    "fc_nombre" VARCHAR(50) NOT NULL,
    "fc_ruta" VARCHAR(100) NOT NULL,
    "fb_activo" BOOLEAN DEFAULT true,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("fi_modulo_id")
);

-- CreateTable
CREATE TABLE "seguridad"."refresh_tokens" (
    "fi_token_id" SERIAL NOT NULL,
    "fi_usuario_id" INTEGER NOT NULL,
    "fc_token" VARCHAR(255) NOT NULL,
    "fd_expiracion" TIMESTAMP(6) NOT NULL,
    "fb_revocado" BOOLEAN NOT NULL DEFAULT false,
    "fd_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("fi_token_id")
);

-- CreateTable
CREATE TABLE "seguridad"."roles_modulos" (
    "fi_rol_id" INTEGER NOT NULL,
    "fi_modulo_id" INTEGER NOT NULL,

    CONSTRAINT "roles_modulos_pkey" PRIMARY KEY ("fi_rol_id","fi_modulo_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_fc_nombre_key" ON "catalogos"."estados"("fc_nombre" ASC);

-- CreateIndex
CREATE INDEX "actas_administrativas_empleado_id_idx" ON "public"."actas_administrativas"("empleado_id" ASC);

-- CreateIndex
CREATE INDEX "alevinaje_fecha_idx" ON "public"."alevinaje"("fecha" DESC);

-- CreateIndex
CREATE INDEX "alevinaje_lote_idx" ON "public"."alevinaje"("lote" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "alevinaje_pileta_id_lote_key" ON "public"."alevinaje"("pileta_id" ASC, "lote" ASC);

-- CreateIndex
CREATE INDEX "alimentacion_ubicacion_id_idx" ON "public"."alimentacion"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "alimentacion_usuario_id_idx" ON "public"."alimentacion"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "alimentos_engorda_id_idx" ON "public"."alimentos"("engorda_id" ASC);

-- CreateIndex
CREATE INDEX "alimentos_pileta_id_idx" ON "public"."alimentos"("pileta_id" ASC);

-- CreateIndex
CREATE INDEX "alimentos_reproductor_id_idx" ON "public"."alimentos"("reproductor_id" ASC);

-- CreateIndex
CREATE INDEX "alimentos_usuario_id_idx" ON "public"."alimentos"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "banos_fecha_idx" ON "public"."banos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "banos_ubicacion_id_idx" ON "public"."banos"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "banos_usuario_id_idx" ON "public"."banos"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "biometrias_fecha_idx" ON "public"."biometrias"("fecha" DESC);

-- CreateIndex
CREATE INDEX "biometrias_pileta_id_idx" ON "public"."biometrias"("pileta_id" ASC);

-- CreateIndex
CREATE INDEX "caja_ahorro_granja_idx" ON "public"."caja_ahorro"("granja" ASC);

-- CreateIndex
CREATE INDEX "clientes_nombre_idx" ON "public"."clientes"("nombre" ASC);

-- CreateIndex
CREATE INDEX "cuentas_esta_activa_idx" ON "public"."cuentas"("esta_activa" ASC);

-- CreateIndex
CREATE INDEX "cuentas_nombre_idx" ON "public"."cuentas"("nombre" ASC);

-- CreateIndex
CREATE INDEX "cuentas_unidad_negocio_idx" ON "public"."cuentas"("unidad_negocio" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "public"."departamentos"("nombre" ASC);

-- CreateIndex
CREATE INDEX "documentos_empleado_empleado_id_idx" ON "public"."documentos_empleado"("empleado_id" ASC);

-- CreateIndex
CREATE INDEX "empleados_departamento_id_idx" ON "public"."empleados"("departamento_id" ASC);

-- CreateIndex
CREATE INDEX "empleados_puesto_id_idx" ON "public"."empleados"("puesto_id" ASC);

-- CreateIndex
CREATE INDEX "empleados_usuario_id_idx" ON "public"."empleados"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "empleados_usuario_id_key" ON "public"."empleados"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "engorda_pileta_id_key" ON "public"."engorda"("pileta_id" ASC);

-- CreateIndex
CREATE INDEX "equipos_usuario_id_idx" ON "public"."equipos"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "flujo_caja_categoria_idx" ON "public"."flujo_caja"("categoria" ASC);

-- CreateIndex
CREATE INDEX "flujo_caja_cuenta_nombre_idx" ON "public"."flujo_caja"("cuenta_nombre" ASC);

-- CreateIndex
CREATE INDEX "flujo_caja_estatus_idx" ON "public"."flujo_caja"("estatus" ASC);

-- CreateIndex
CREATE INDEX "flujo_caja_fecha_idx" ON "public"."flujo_caja"("fecha" DESC);

-- CreateIndex
CREATE INDEX "flujo_caja_mes_periodo_idx" ON "public"."flujo_caja"("mes_periodo" ASC);

-- CreateIndex
CREATE INDEX "flujo_caja_ubicacion_id_idx" ON "public"."flujo_caja"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "instalaciones_granja_idx" ON "public"."instalaciones"("granja" ASC);

-- CreateIndex
CREATE INDEX "instalaciones_tipo_idx" ON "public"."instalaciones"("tipo" ASC);

-- CreateIndex
CREATE INDEX "insumos_ubicacion_id_idx" ON "public"."insumos"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "insumos_usuario_id_idx" ON "public"."insumos"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "inventario_alevines_pileta_id_idx" ON "public"."inventario_alevines"("pileta_id" ASC);

-- CreateIndex
CREATE INDEX "inventario_alevines_ubicacion_id_idx" ON "public"."inventario_alevines"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "inventario_alevines_usuario_id_idx" ON "public"."inventario_alevines"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "lista_espera_cliente_id_idx" ON "public"."lista_espera"("cliente_id" ASC);

-- CreateIndex
CREATE INDEX "lista_espera_estatus_idx" ON "public"."lista_espera"("estatus" ASC);

-- CreateIndex
CREATE INDEX "lotes_instalacion_id_idx" ON "public"."lotes"("instalacion_id" ASC);

-- CreateIndex
CREATE INDEX "mantenimientos_equipo_id_idx" ON "public"."mantenimientos"("equipo_id" ASC);

-- CreateIndex
CREATE INDEX "mantenimientos_fecha_idx" ON "public"."mantenimientos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "medicamentos_ubicacion_id_idx" ON "public"."medicamentos"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "medicamentos_usuario_id_idx" ON "public"."medicamentos"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_ruta_key" ON "public"."modulos"("ruta" ASC);

-- CreateIndex
CREATE INDEX "nomina_empleado_id_idx" ON "public"."nomina"("empleado_id" ASC);

-- CreateIndex
CREATE INDEX "nomina_periodo_idx" ON "public"."nomina"("periodo" ASC);

-- CreateIndex
CREATE INDEX "observacion_created_at_idx" ON "public"."observacion"("created_at" DESC);

-- CreateIndex
CREATE INDEX "observacion_usuario_id_idx" ON "public"."observacion"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "parametros_ubicacion_id_idx" ON "public"."parametros"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "parametros_usuario_id_idx" ON "public"."parametros"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "piletas_estado_idx" ON "public"."piletas"("estado" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "piletas_nombre_ubicacion_id_key" ON "public"."piletas"("nombre" ASC, "ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "piletas_tipo_idx" ON "public"."piletas"("tipo" ASC);

-- CreateIndex
CREATE INDEX "piletas_ubicacion_id_idx" ON "public"."piletas"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "plagas_ubicacion_id_idx" ON "public"."plagas"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "plagas_usuario_id_idx" ON "public"."plagas"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "proveedores_nombre_idx" ON "public"."proveedores"("nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "puestos_nombre_key" ON "public"."puestos"("nombre" ASC);

-- CreateIndex
CREATE INDEX "recambios_ubicacion_id_idx" ON "public"."recambios"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "recambios_usuario_id_idx" ON "public"."recambios"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "recepcion_insumos_ubicacion_id_idx" ON "public"."recepcion_insumos"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "recepcion_insumos_usuario_id_idx" ON "public"."recepcion_insumos"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token" ASC);

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "public"."refresh_tokens"("usuario_id" ASC);

-- CreateIndex
CREATE INDEX "reproductores_familia_idx" ON "public"."reproductores"("familia" ASC);

-- CreateIndex
CREATE INDEX "reproductores_linea_idx" ON "public"."reproductores"("linea" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reproductores_pileta_id_key" ON "public"."reproductores"("pileta_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "public"."roles"("nombre" ASC);

-- CreateIndex
CREATE INDEX "siembra_fecha_idx" ON "public"."siembra"("fecha" DESC);

-- CreateIndex
CREATE INDEX "siembra_pileta_destino_idx" ON "public"."siembra"("pileta_destino" ASC);

-- CreateIndex
CREATE INDEX "siembra_pileta_origen_idx" ON "public"."siembra"("pileta_origen" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_nombre_key" ON "public"."tipos_documento"("nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ubicacion_nombre_key" ON "public"."ubicacion"("nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "unidades_negocio_nombre_key" ON "public"."unidades_negocio"("nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_key" ON "public"."usuarios"("nombre" ASC);

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "public"."usuarios"("rol_id" ASC);

-- CreateIndex
CREATE INDEX "vacaciones_empleado_id_idx" ON "public"."vacaciones"("empleado_id" ASC);

-- CreateIndex
CREATE INDEX "vacaciones_fecha_inicio_idx" ON "public"."vacaciones"("fecha_inicio" DESC);

-- CreateIndex
CREATE INDEX "ventas_cliente_nombre_idx" ON "public"."ventas"("cliente_nombre" ASC);

-- CreateIndex
CREATE INDEX "ventas_empresa_idx" ON "public"."ventas"("empresa" ASC);

-- CreateIndex
CREATE INDEX "ventas_estado_pago_idx" ON "public"."ventas"("estado_pago" ASC);

-- CreateIndex
CREATE INDEX "ventas_fecha_idx" ON "public"."ventas"("fecha" DESC);

-- CreateIndex
CREATE INDEX "visitas_fecha_idx" ON "public"."visitas"("fecha" DESC);

-- CreateIndex
CREATE INDEX "visitas_ubicacion_id_idx" ON "public"."visitas"("ubicacion_id" ASC);

-- CreateIndex
CREATE INDEX "visitas_usuario_id_idx" ON "public"."visitas"("usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_fc_nombre_key" ON "rrhh"."departamentos"("fc_nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "empleados_fi_usuario_id_key" ON "rrhh"."empleados"("fi_usuario_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_fc_nombre_key" ON "seguridad"."modulos"("fc_nombre" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_fc_ruta_key" ON "seguridad"."modulos"("fc_ruta" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_uk" ON "seguridad"."refresh_tokens"("fc_token" ASC);

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_idx" ON "seguridad"."refresh_tokens"("fi_usuario_id" ASC);

-- AddForeignKey
ALTER TABLE "public"."actas_administrativas" ADD CONSTRAINT "actas_administrativas_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alevinaje" ADD CONSTRAINT "alevinaje_biometria_id_fkey" FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alevinaje" ADD CONSTRAINT "alevinaje_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alevinaje" ADD CONSTRAINT "alevinaje_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alevinaje" ADD CONSTRAINT "alevinaje_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "alimentacion_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "alimentacion_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "alimentacion_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "alimentacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_engorda_id_fkey" FOREIGN KEY ("engorda_id") REFERENCES "public"."engorda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_reproductor_id_fkey" FOREIGN KEY ("reproductor_id") REFERENCES "public"."reproductores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."banos" ADD CONSTRAINT "banos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."banos" ADD CONSTRAINT "banos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."banos" ADD CONSTRAINT "banos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "biometrias_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "biometrias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documentos_empleado" ADD CONSTRAINT "documentos_empleado_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documentos_empleado" ADD CONSTRAINT "documentos_empleado_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "public"."tipos_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleados" ADD CONSTRAINT "empleados_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleados" ADD CONSTRAINT "empleados_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "public"."puestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleados" ADD CONSTRAINT "empleados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_biometria_id_fkey" FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_siembra_id_fkey" FOREIGN KEY ("siembra_id") REFERENCES "public"."siembra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipos" ADD CONSTRAINT "equipos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insumos" ADD CONSTRAINT "insumos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insumos" ADD CONSTRAINT "insumos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insumos" ADD CONSTRAINT "insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "inventario_alevines_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "inventario_alevines_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "inventario_alevines_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "inventario_alevines_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lista_espera" ADD CONSTRAINT "lista_espera_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lotes" ADD CONSTRAINT "lotes_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "public"."instalaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medicamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nomina" ADD CONSTRAINT "nomina_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."observacion" ADD CONSTRAINT "observacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parametros" ADD CONSTRAINT "parametros_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parametros" ADD CONSTRAINT "parametros_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parametros" ADD CONSTRAINT "parametros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plagas" ADD CONSTRAINT "plagas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plagas" ADD CONSTRAINT "plagas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plagas" ADD CONSTRAINT "plagas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recambios" ADD CONSTRAINT "recambios_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recambios" ADD CONSTRAINT "recambios_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recambios" ADD CONSTRAINT "recambios_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recambios" ADD CONSTRAINT "recambios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_biometria_id_fkey" FOREIGN KEY ("biometria_id") REFERENCES "public"."biometrias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_siembra_id_fkey" FOREIGN KEY ("siembra_id") REFERENCES "public"."siembra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles_modulos" ADD CONSTRAINT "roles_modulos_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles_modulos" ADD CONSTRAINT "roles_modulos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siembra" ADD CONSTRAINT "siembra_pileta_destino_fkey" FOREIGN KEY ("pileta_destino") REFERENCES "public"."piletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siembra" ADD CONSTRAINT "siembra_pileta_origen_fkey" FOREIGN KEY ("pileta_origen") REFERENCES "public"."piletas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siembra" ADD CONSTRAINT "siembra_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vacaciones" ADD CONSTRAINT "vacaciones_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitas" ADD CONSTRAINT "visitas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."observacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitas" ADD CONSTRAINT "visitas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitas" ADD CONSTRAINT "visitas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rrhh"."empleados" ADD CONSTRAINT "empleados_fi_departamento_id_fkey" FOREIGN KEY ("fi_departamento_id") REFERENCES "rrhh"."departamentos"("fi_departamento_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rrhh"."empleados" ADD CONSTRAINT "empleados_fi_estado_id_fkey" FOREIGN KEY ("fi_estado_id") REFERENCES "catalogos"."estados"("fi_estado_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seguridad"."roles_modulos" ADD CONSTRAINT "roles_modulos_fi_modulo_id_fkey" FOREIGN KEY ("fi_modulo_id") REFERENCES "seguridad"."modulos"("fi_modulo_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

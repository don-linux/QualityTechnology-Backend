-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "roles" (
    "rol_id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "es_root" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "empresa_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "modulo_id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "ruta" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("modulo_id")
);

-- CreateTable
CREATE TABLE "roles_modulos" (
    "rol_id" INTEGER NOT NULL,
    "modulo_id" INTEGER NOT NULL,

    CONSTRAINT "roles_modulos_pk" PRIMARY KEY ("rol_id","modulo_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token_id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiracion" TIMESTAMP(6) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "puestos" (
    "puesto_id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "puestos_pkey" PRIMARY KEY ("puesto_id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "departamento_id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("departamento_id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "tipo_documento_id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("tipo_documento_id")
);

-- CreateTable
CREATE TABLE "unidades_negocio" (
    "unidad_negocio_id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidades_negocio_pkey" PRIMARY KEY ("unidad_negocio_id")
);

-- CreateTable
CREATE TABLE "observaciones" (
    "observacion_id" SERIAL NOT NULL,
    "observacion" VARCHAR(500),
    "responsable" VARCHAR(100),
    "usuario_id" INTEGER,
    "fecha" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "observaciones_pkey" PRIMARY KEY ("observacion_id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "ubicacion_id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(300),
    "descripcion" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("ubicacion_id")
);

-- CreateTable
CREATE TABLE "instalaciones" (
    "instalacion_id" SERIAL NOT NULL,
    "nombre_instalacion" VARCHAR(100) NOT NULL,
    "largo" DECIMAL(10,2) NOT NULL,
    "ancho" DECIMAL(10,2) NOT NULL,
    "altura" DECIMAL(10,2) NOT NULL,
    "material" VARCHAR(100) NOT NULL,
    "metros_cubicos" DECIMAL(12,2),
    "tipo_instalacion" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'vacia',
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "instalaciones_pkey" PRIMARY KEY ("instalacion_id")
);

-- CreateTable
CREATE TABLE "reproductores" (
    "reproductor_id" SERIAL NOT NULL,
    "instalacion_id" INTEGER NOT NULL,
    "machos" INTEGER NOT NULL DEFAULT 0,
    "hembras" INTEGER NOT NULL DEFAULT 0,
    "cantidad" INTEGER,
    "talla" DECIMAL(10,2),
    "ratio" VARCHAR(10),
    "linea" VARCHAR(50),
    "familia" VARCHAR(20),
    "fecha_siembra" DATE,
    "fecha_biometria" DATE,
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "observacion_id" INTEGER,

    CONSTRAINT "reproductores_pkey" PRIMARY KEY ("reproductor_id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "lote_id" SERIAL NOT NULL,
    "instalacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "familia" VARCHAR(50) NOT NULL,
    "no_lote" VARCHAR(50) NOT NULL,
    "huevos_ml" DECIMAL(10,2),
    "ovadas" INTEGER NOT NULL DEFAULT 0,
    "alevines_inicial" INTEGER NOT NULL,
    "mortalidad" INTEGER NOT NULL DEFAULT 0,
    "mortalidad_porcentaje" DECIMAL(6,2),
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "observacion_id" INTEGER,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("lote_id")
);

-- CreateTable
CREATE TABLE "piletas" (
    "pileta_id" SERIAL NOT NULL,
    "instalacion_id" INTEGER NOT NULL,
    "lote_id" INTEGER,
    "cantidad" BIGINT NOT NULL DEFAULT 0,
    "talla_gr" DECIMAL(14,2),
    "fecha_siembra" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_ultima_biometria" DATE NOT NULL DEFAULT CURRENT_DATE,
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "observacion_id" INTEGER,

    CONSTRAINT "piletas_pkey" PRIMARY KEY ("pileta_id")
);

-- CreateTable
CREATE TABLE "engorda" (
    "engorda_id" SERIAL NOT NULL,
    "instalacion_id" INTEGER NOT NULL,
    "lote_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "talla_gr" DECIMAL(10,2),
    "fecha_siembra" DATE,
    "fecha_biometria" DATE,
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "observacion_id" INTEGER,

    CONSTRAINT "engorda_pkey" PRIMARY KEY ("engorda_id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "equipo_id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "marca" VARCHAR(100),
    "modelo" VARCHAR(100),
    "tipo" VARCHAR(100),
    "fecha_compra" DATE,
    "costo" DECIMAL(12,2),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'Operativo',
    "ubicacion" VARCHAR(150),
    "proximo_mantenimiento" DATE,
    "notas" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "observacion_id" INTEGER,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("equipo_id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "mantenimiento_id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "tipo" VARCHAR(50) NOT NULL DEFAULT 'Preventivo',
    "descripcion" TEXT,
    "costo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado_post" VARCHAR(50),
    "proximo_mantenimiento" DATE,
    "observacion_id" INTEGER,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("mantenimiento_id")
);

-- CreateTable
CREATE TABLE "alimentos" (
    "alimento_id" SERIAL NOT NULL,
    "pileta_id" INTEGER,
    "engorda_id" INTEGER,
    "reproductor_id" INTEGER,
    "particula_mm" DECIMAL(10,2),
    "alimento_dia" DECIMAL(10,3),
    "porcion" DECIMAL(10,3),
    "gasto_alimento" DECIMAL(12,2),
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "alimentos_pkey" PRIMARY KEY ("alimento_id")
);

-- CreateTable
CREATE TABLE "trazabilidad_alevinaje" (
    "movimiento_id" SERIAL NOT NULL,
    "pileta_origen" INTEGER,
    "pileta_destino" INTEGER,
    "instalacion_origen" INTEGER,
    "instalacion_destino" INTEGER,
    "lote_id" INTEGER,
    "origen_externo" TEXT,
    "tipo_movimiento" VARCHAR(20) NOT NULL DEFAULT 'TRASLADO',
    "cantidad" BIGINT NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_movimiento" DATE NOT NULL DEFAULT CURRENT_DATE,
    "observacion_id" INTEGER,

    CONSTRAINT "trazabilidad_alevinaje_pkey" PRIMARY KEY ("movimiento_id")
);

-- CreateTable
CREATE TABLE "trazabilidad_engorda" (
    "movimiento_id" SERIAL NOT NULL,
    "engorda_origen" INTEGER,
    "engorda_destino" INTEGER,
    "cantidad_trasladada" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_movimiento" DATE NOT NULL DEFAULT CURRENT_DATE,
    "observacion_id" INTEGER,

    CONSTRAINT "trazabilidad_engorda_pkey" PRIMARY KEY ("movimiento_id")
);

-- CreateTable
CREATE TABLE "trazabilidad_reproductores" (
    "movimiento_id" SERIAL NOT NULL,
    "repro_origen" INTEGER,
    "repro_destino" INTEGER,
    "origen_texto" VARCHAR(150),
    "cantidad_trasladada" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "fecha_movimiento" DATE NOT NULL DEFAULT CURRENT_DATE,
    "observacion_id" INTEGER,

    CONSTRAINT "trazabilidad_reproductores_pkey" PRIMARY KEY ("movimiento_id")
);

-- CreateTable
CREATE TABLE "empleados" (
    "empleado_id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "departamento_id" INTEGER NOT NULL,
    "puesto_id" INTEGER,
    "unidad_negocio_id" INTEGER,
    "nombre" VARCHAR(60) NOT NULL,
    "apellido_paterno" VARCHAR(60) NOT NULL,
    "apellido_materno" VARCHAR(60) NOT NULL,
    "genero" VARCHAR(20),
    "fecha_nacimiento" DATE,
    "estado" VARCHAR(50),
    "ciudad" VARCHAR(60),
    "calle" VARCHAR(120),
    "codigo_postal" VARCHAR(10),
    "referencias" VARCHAR(255),
    "comentarios_adicionales" TEXT,
    "fecha_contratacion" DATE,
    "uniformes" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_alta" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_baja" DATE,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("empleado_id")
);

-- CreateTable
CREATE TABLE "documentos_empleado" (
    "documento_id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "fecha_carga" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "documentos_empleado_pkey" PRIMARY KEY ("documento_id")
);

-- CreateTable
CREATE TABLE "actas_administrativas" (
    "acta_id" SERIAL NOT NULL,
    "empleado_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,

    CONSTRAINT "actas_administrativas_pkey" PRIMARY KEY ("acta_id")
);

-- CreateTable
CREATE TABLE "nomina" (
    "nomina_id" SERIAL NOT NULL,
    "empleado_id" INTEGER,
    "nombre_empleado" VARCHAR(120) NOT NULL,
    "fecha_pago" DATE NOT NULL DEFAULT CURRENT_DATE,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bono" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deuda" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "anticipo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "usuario_id" INTEGER,
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nomina_pkey" PRIMARY KEY ("nomina_id")
);

-- CreateTable
CREATE TABLE "vacaciones" (
    "vacacion_id" SERIAL NOT NULL,
    "empleado_id" INTEGER,
    "nombre_empleado" VARCHAR(120) NOT NULL,
    "departamento" VARCHAR(80),
    "inicio_periodo" DATE NOT NULL,
    "fin_periodo" DATE NOT NULL,
    "dias_trabajados" INTEGER NOT NULL DEFAULT 0,
    "vacaciones_v" INTEGER NOT NULL DEFAULT 0,
    "enfermedad_e" INTEGER NOT NULL DEFAULT 0,
    "maternidad_m" INTEGER NOT NULL DEFAULT 0,
    "permiso_parcial_pp" INTEGER NOT NULL DEFAULT 0,
    "permiso_total_pt" INTEGER NOT NULL DEFAULT 0,
    "inasistencias_i" INTEGER NOT NULL DEFAULT 0,
    "vacaciones_anio" INTEGER NOT NULL DEFAULT 0,
    "dias_previos" INTEGER NOT NULL DEFAULT 0,
    "vacaciones_disponibles" INTEGER NOT NULL DEFAULT 0,
    "vacaciones_disfrutadas" INTEGER NOT NULL DEFAULT 0,
    "asistencia" VARCHAR(50) NOT NULL DEFAULT 'Asistió',
    "fecha_actualizacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacaciones_pkey" PRIMARY KEY ("vacacion_id")
);

-- CreateTable
CREATE TABLE "caja_ahorro_resumen" (
    "caja_ahorro_id" SERIAL NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "enero" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "febrero" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "marzo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "abril" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mayo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "junio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "julio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "agosto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "septiembre" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "octubre" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "noviembre" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "diciembre" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2),
    "actualizado" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caja_ahorro_resumen_pkey" PRIMARY KEY ("caja_ahorro_id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "cliente_id" SERIAL NOT NULL,
    "razon_social" VARCHAR(150) NOT NULL,
    "rfc" VARCHAR(20),
    "unidad_negocio_id" INTEGER NOT NULL,
    "nombre_contacto" VARCHAR(150),
    "telefono" VARCHAR(10),
    "correo" VARCHAR(255),
    "localidad" VARCHAR(100),
    "estado" VARCHAR(100),
    "ejecutivo_empleado_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "proveedor_id" SERIAL NOT NULL,
    "razon_social" VARCHAR(150) NOT NULL,
    "rfc" VARCHAR(20) NOT NULL,
    "producto_servicio" VARCHAR(255) NOT NULL,
    "unidad_negocio_id" INTEGER NOT NULL,
    "nombre_contacto" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,
    "correo" VARCHAR(255) NOT NULL,
    "localidad" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "venta_id" SERIAL NOT NULL,
    "folio" VARCHAR(50),
    "fecha_venta" DATE NOT NULL,
    "cliente" VARCHAR(150) NOT NULL,
    "tipo_venta" VARCHAR(50) NOT NULL,
    "cantidad_vendida" INTEGER NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "abonado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "adeudo" DECIMAL(12,2),
    "estado_pago" VARCHAR(20) NOT NULL DEFAULT 'ADEUDO',
    "empresa" TEXT NOT NULL,
    "encargado_venta" TEXT,
    "observacion_id" INTEGER,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("venta_id")
);

-- CreateTable
CREATE TABLE "lista_espera" (
    "lista_id" SERIAL NOT NULL,
    "fecha_entrega" DATE NOT NULL,
    "talla" VARCHAR(50),
    "cantidad" DECIMAL(12,2) NOT NULL,
    "precio_venta" DECIMAL(12,2),
    "cliente" VARCHAR(200),
    "lugar_entrega" VARCHAR(200),
    "encargado_venta" VARCHAR(200),
    "unidad_produccion" VARCHAR(200),
    "uap_asignada" VARCHAR(200),
    "ubicacion_id" INTEGER,
    "hora_embolsado" VARCHAR(20),
    "hora_entrega" VARCHAR(20),

    CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("lista_id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "cuenta_id" SERIAL NOT NULL,
    "udn" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "numero_cuenta" VARCHAR(50),
    "banco" VARCHAR(150),
    "tipo" VARCHAR(20) NOT NULL,
    "saldo_actual" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("cuenta_id")
);

-- CreateTable
CREATE TABLE "flujo_caja" (
    "movimiento_id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "ingreso" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "egreso" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descripcion" VARCHAR(200),
    "cuenta" VARCHAR(50),
    "categoria" VARCHAR(100),
    "subcategoria" VARCHAR(100),
    "beneficiario" VARCHAR(100),
    "noproyecto" VARCHAR(50),
    "factura" VARCHAR(50),
    "estatus" VARCHAR(20),
    "mes" VARCHAR(7),
    "equilibrar" DECIMAL(12,2),

    CONSTRAINT "flujo_caja_pkey" PRIMARY KEY ("movimiento_id")
);

-- CreateTable
CREATE TABLE "lote_movimientos" (
    "mov_id" SERIAL NOT NULL,
    "lote_id" INTEGER NOT NULL,
    "tipo_movimiento" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "talla" DECIMAL(5,2),
    "fecha" DATE NOT NULL,
    "destino" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "lote_movimientos_pkey" PRIMARY KEY ("mov_id")
);

-- CreateTable
CREATE TABLE "alimentacion" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE,
    "mes" VARCHAR(20),
    "num_instalacion" INTEGER,
    "fecha_siembra" DATE,
    "origen_alevines" VARCHAR(200),
    "peso_promedio_entrada" DECIMAL(12,3),
    "total_alimento_kg" DECIMAL(12,3),
    "mortalidad" INTEGER,
    "recambio_agua" VARCHAR(50),
    "temp_agua" DECIMAL(6,2),
    "amonio" DECIMAL(10,4),
    "ph" DECIMAL(5,2),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "alimentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "tipo_banio" VARCHAR(20),
    "regadera" VARCHAR(100),
    "realizo" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "banos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometrias" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "instalacion_id" INTEGER,
    "reproductor_id" INTEGER,
    "tipo" VARCHAR(20),
    "fecha" DATE NOT NULL,
    "peso_total_gramos" DECIMAL(12,3),
    "organismos_muestreados" INTEGER,
    "peso_promedio" DECIMAL(10,3),
    "encargado" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "biometrias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "cantidad_udm" VARCHAR(100),
    "num_lote" VARCHAR(100),
    "descripcion" VARCHAR(300),
    "encargado_entrega" VARCHAR(100),
    "encargado_recepcion" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_alevines" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "num_instalacion" INTEGER,
    "lote" VARCHAR(100),
    "cantidad" INTEGER,
    "talla" DECIMAL(10,2),
    "fecha_siembra" DATE,
    "fecha_salida_hormonado" DATE,
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "inventario_alevines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL,
    "num_estanque" INTEGER,
    "diagnosis" VARCHAR(500),
    "tratamiento" VARCHAR(500),
    "dosis" VARCHAR(100),
    "forma_aplicacion" VARCHAR(100),
    "fecha_ultima_dosis" DATE,
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "num_estanque" INTEGER,
    "oxigeno" DECIMAL(8,3),
    "temperatura" DECIMAL(6,2),
    "ph" DECIMAL(5,2),
    "amonio" DECIMAL(10,4),
    "nitritos" DECIMAL(10,4),
    "nitratos" DECIMAL(10,4),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plagas" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER,
    "unidad_produccion" VARCHAR(100),
    "fecha" DATE NOT NULL,
    "num_trampa" VARCHAR(100),
    "tipo_trampa" VARCHAR(100),
    "hallazgo" VARCHAR(500),
    "malla" VARCHAR(200),
    "veneno" VARCHAR(100),
    "verifico" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "plagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recambios" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER NOT NULL,
    "mes" VARCHAR(20),
    "num_instalacion" INTEGER,
    "fecha1" DATE,
    "tipo1" VARCHAR(30),
    "fecha2" DATE,
    "tipo2" VARCHAR(30),
    "fecha3" DATE,
    "tipo3" VARCHAR(30),
    "fecha4" DATE,
    "tipo4" VARCHAR(30),
    "fecha5" DATE,
    "tipo5" VARCHAR(30),
    "fecha6" DATE,
    "tipo6" VARCHAR(30),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "recambios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepcion_insumos" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER,
    "fecha" DATE NOT NULL,
    "proveedor" VARCHAR(100),
    "producto" VARCHAR(255),
    "unidad_medida" VARCHAR(255),
    "cantidad" DECIMAL(15,2),
    "lote" VARCHAR(100),
    "condiciones_entrega" VARCHAR(150),
    "encargado_entrega" VARCHAR(100),
    "verifico" VARCHAR(100),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "recepcion_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitas" (
    "id" SERIAL NOT NULL,
    "ubicacion_id" INTEGER,
    "fecha" DATE NOT NULL,
    "entrada" TIME(6),
    "salida" TIME(6),
    "nombre_completo" VARCHAR(200),
    "origen" VARCHAR(200),
    "motivo" VARCHAR(300),
    "foto_identificacion" VARCHAR(200),
    "usuario_id" INTEGER,
    "observacion_id" INTEGER,

    CONSTRAINT "visitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_uk" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_uk" ON "usuarios"("nombre");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_nombre_uk" ON "modulos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_ruta_uk" ON "modulos"("ruta");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_uk" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "puestos_nombre_uk" ON "puestos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_uk" ON "departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_nombre_uk" ON "tipos_documento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_negocio_nombre_uk" ON "unidades_negocio"("nombre");

-- CreateIndex
CREATE INDEX "observaciones_usuario_idx" ON "observaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "observaciones_fecha_idx" ON "observaciones"("fecha" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_nombre_uk" ON "ubicaciones"("nombre");

-- CreateIndex
CREATE INDEX "ubicaciones_activo_idx" ON "ubicaciones"("activo");

-- CreateIndex
CREATE INDEX "instalaciones_ubicacion_idx" ON "instalaciones"("ubicacion_id");

-- CreateIndex
CREATE INDEX "instalaciones_tipo_idx" ON "instalaciones"("tipo_instalacion");

-- CreateIndex
CREATE INDEX "instalaciones_usuario_idx" ON "instalaciones"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "instalaciones_nombre_uk" ON "instalaciones"("nombre_instalacion", "ubicacion_id");

-- CreateIndex
CREATE INDEX "reproductores_instalacion_idx" ON "reproductores"("instalacion_id");

-- CreateIndex
CREATE INDEX "reproductores_ubicacion_idx" ON "reproductores"("ubicacion_id");

-- CreateIndex
CREATE INDEX "reproductores_familia_idx" ON "reproductores"("familia");

-- CreateIndex
CREATE UNIQUE INDEX "lotes_no_lote_uk" ON "lotes"("no_lote");

-- CreateIndex
CREATE INDEX "lotes_instalacion_idx" ON "lotes"("instalacion_id");

-- CreateIndex
CREATE INDEX "lotes_ubicacion_idx" ON "lotes"("ubicacion_id");

-- CreateIndex
CREATE INDEX "lotes_fecha_idx" ON "lotes"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "piletas_instalacion_uk" ON "piletas"("instalacion_id");

-- CreateIndex
CREATE INDEX "piletas_lote_idx" ON "piletas"("lote_id");

-- CreateIndex
CREATE INDEX "piletas_ubicacion_idx" ON "piletas"("ubicacion_id");

-- CreateIndex
CREATE INDEX "piletas_usuario_idx" ON "piletas"("usuario_id");

-- CreateIndex
CREATE INDEX "engorda_instalacion_idx" ON "engorda"("instalacion_id");

-- CreateIndex
CREATE INDEX "engorda_lote_idx" ON "engorda"("lote_id");

-- CreateIndex
CREATE INDEX "engorda_ubicacion_idx" ON "engorda"("ubicacion_id");

-- CreateIndex
CREATE INDEX "equipos_usuario_idx" ON "equipos"("usuario_id");

-- CreateIndex
CREATE INDEX "equipos_estado_idx" ON "equipos"("estado");

-- CreateIndex
CREATE INDEX "mantenimientos_equipo_idx" ON "mantenimientos"("equipo_id");

-- CreateIndex
CREATE INDEX "mantenimientos_fecha_idx" ON "mantenimientos"("fecha");

-- CreateIndex
CREATE INDEX "alimentos_pileta_idx" ON "alimentos"("pileta_id");

-- CreateIndex
CREATE INDEX "alimentos_engorda_idx" ON "alimentos"("engorda_id");

-- CreateIndex
CREATE INDEX "alimentos_reproductor_idx" ON "alimentos"("reproductor_id");

-- CreateIndex
CREATE INDEX "alimentos_usuario_idx" ON "alimentos"("usuario_id");

-- CreateIndex
CREATE INDEX "traza_alev_pileta_origen_idx" ON "trazabilidad_alevinaje"("pileta_origen");

-- CreateIndex
CREATE INDEX "traza_alev_pileta_destino_idx" ON "trazabilidad_alevinaje"("pileta_destino");

-- CreateIndex
CREATE INDEX "traza_alev_instalacion_origen_idx" ON "trazabilidad_alevinaje"("instalacion_origen");

-- CreateIndex
CREATE INDEX "traza_alev_instalacion_destino_idx" ON "trazabilidad_alevinaje"("instalacion_destino");

-- CreateIndex
CREATE INDEX "traza_alev_lote_idx" ON "trazabilidad_alevinaje"("lote_id");

-- CreateIndex
CREATE INDEX "traza_alev_fecha_idx" ON "trazabilidad_alevinaje"("fecha_movimiento" DESC);

-- CreateIndex
CREATE INDEX "traza_alev_ubicacion_idx" ON "trazabilidad_alevinaje"("ubicacion_id");

-- CreateIndex
CREATE INDEX "traza_eng_origen_idx" ON "trazabilidad_engorda"("engorda_origen");

-- CreateIndex
CREATE INDEX "traza_eng_destino_idx" ON "trazabilidad_engorda"("engorda_destino");

-- CreateIndex
CREATE INDEX "traza_eng_fecha_idx" ON "trazabilidad_engorda"("fecha_movimiento" DESC);

-- CreateIndex
CREATE INDEX "traza_repro_origen_idx" ON "trazabilidad_reproductores"("repro_origen");

-- CreateIndex
CREATE INDEX "traza_repro_destino_idx" ON "trazabilidad_reproductores"("repro_destino");

-- CreateIndex
CREATE INDEX "traza_repro_fecha_idx" ON "trazabilidad_reproductores"("fecha_movimiento" DESC);

-- CreateIndex
CREATE INDEX "empleados_departamento_idx" ON "empleados"("departamento_id");

-- CreateIndex
CREATE INDEX "empleados_puesto_idx" ON "empleados"("puesto_id");

-- CreateIndex
CREATE INDEX "empleados_unidad_negocio_idx" ON "empleados"("unidad_negocio_id");

-- CreateIndex
CREATE INDEX "empleados_usuario_idx" ON "empleados"("usuario_id");

-- CreateIndex
CREATE INDEX "empleados_activo_idx" ON "empleados"("activo");

-- CreateIndex
CREATE INDEX "empleados_apellidos_idx" ON "empleados"("apellido_paterno", "apellido_materno");

-- CreateIndex
CREATE INDEX "doc_emp_empleado_idx" ON "documentos_empleado"("empleado_id");

-- CreateIndex
CREATE INDEX "doc_emp_tipo_idx" ON "documentos_empleado"("tipo_documento_id");

-- CreateIndex
CREATE UNIQUE INDEX "doc_emp_unico" ON "documentos_empleado"("empleado_id", "tipo_documento_id");

-- CreateIndex
CREATE INDEX "actas_admin_empleado_idx" ON "actas_administrativas"("empleado_id");

-- CreateIndex
CREATE INDEX "actas_admin_fecha_idx" ON "actas_administrativas"("fecha" DESC);

-- CreateIndex
CREATE INDEX "nomina_empleado_idx" ON "nomina"("empleado_id");

-- CreateIndex
CREATE INDEX "nomina_fecha_pago_idx" ON "nomina"("fecha_pago" DESC);

-- CreateIndex
CREATE INDEX "nomina_usuario_idx" ON "nomina"("usuario_id");

-- CreateIndex
CREATE INDEX "vacaciones_empleado_idx" ON "vacaciones"("empleado_id");

-- CreateIndex
CREATE INDEX "vacaciones_periodo_idx" ON "vacaciones"("inicio_periodo", "fin_periodo");

-- CreateIndex
CREATE INDEX "caja_ahorro_categoria_idx" ON "caja_ahorro_resumen"("categoria");

-- CreateIndex
CREATE INDEX "caja_ahorro_ubicacion_idx" ON "caja_ahorro_resumen"("ubicacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "caja_ahorro_categoria_ubicacion_uq" ON "caja_ahorro_resumen"("categoria", "ubicacion_id");

-- CreateIndex
CREATE INDEX "clientes_razon_idx" ON "clientes"("razon_social");

-- CreateIndex
CREATE INDEX "clientes_rfc_idx" ON "clientes"("rfc");

-- CreateIndex
CREATE INDEX "clientes_localidad_idx" ON "clientes"("localidad");

-- CreateIndex
CREATE INDEX "clientes_udn_idx" ON "clientes"("unidad_negocio_id");

-- CreateIndex
CREATE INDEX "clientes_ejecutivo_idx" ON "clientes"("ejecutivo_empleado_id");

-- CreateIndex
CREATE INDEX "clientes_usuario_idx" ON "clientes"("usuario_id");

-- CreateIndex
CREATE INDEX "proveedores_razon_social_idx" ON "proveedores"("razon_social");

-- CreateIndex
CREATE INDEX "proveedores_rfc_idx" ON "proveedores"("rfc");

-- CreateIndex
CREATE INDEX "proveedores_localidad_idx" ON "proveedores"("localidad");

-- CreateIndex
CREATE INDEX "proveedores_udn_idx" ON "proveedores"("unidad_negocio_id");

-- CreateIndex
CREATE INDEX "ventas_cliente_idx" ON "ventas"("cliente");

-- CreateIndex
CREATE INDEX "ventas_fecha_idx" ON "ventas"("fecha_venta" DESC);

-- CreateIndex
CREATE INDEX "ventas_estado_pago_idx" ON "ventas"("estado_pago");

-- CreateIndex
CREATE INDEX "ventas_empresa_idx" ON "ventas"("empresa");

-- CreateIndex
CREATE INDEX "lista_espera_fecha_entrega_idx" ON "lista_espera"("fecha_entrega");

-- CreateIndex
CREATE INDEX "lista_espera_cliente_idx" ON "lista_espera"("cliente");

-- CreateIndex
CREATE INDEX "lista_espera_granja_idx" ON "lista_espera"("ubicacion_id");

-- CreateIndex
CREATE INDEX "cuentas_udn_idx" ON "cuentas"("udn");

-- CreateIndex
CREATE INDEX "cuentas_activo_idx" ON "cuentas"("activo");

-- CreateIndex
CREATE INDEX "cuentas_nombre_idx" ON "cuentas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_nombre_udn_uq" ON "cuentas"("nombre", "udn");

-- CreateIndex
CREATE INDEX "flujo_caja_ubicacion_idx" ON "flujo_caja"("ubicacion_id");

-- CreateIndex
CREATE INDEX "flujo_caja_fecha_idx" ON "flujo_caja"("fecha" DESC);

-- CreateIndex
CREATE INDEX "flujo_caja_cuenta_idx" ON "flujo_caja"("cuenta");

-- CreateIndex
CREATE INDEX "flujo_caja_categoria_idx" ON "flujo_caja"("categoria");

-- CreateIndex
CREATE INDEX "flujo_caja_mes_idx" ON "flujo_caja"("mes");

-- CreateIndex
CREATE INDEX "flujo_caja_estatus_idx" ON "flujo_caja"("estatus");

-- CreateIndex
CREATE INDEX "lote_mov_lote_idx" ON "lote_movimientos"("lote_id");

-- CreateIndex
CREATE INDEX "lote_mov_fecha_idx" ON "lote_movimientos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "lote_mov_tipo_idx" ON "lote_movimientos"("tipo_movimiento");

-- CreateIndex
CREATE INDEX "lote_mov_usuario_idx" ON "lote_movimientos"("usuario_id");

-- CreateIndex
CREATE INDEX "alimentacion_ubicacion_idx" ON "alimentacion"("ubicacion_id");

-- CreateIndex
CREATE INDEX "alimentacion_fecha_idx" ON "alimentacion"("fecha" DESC);

-- CreateIndex
CREATE INDEX "alimentacion_usuario_idx" ON "alimentacion"("usuario_id");

-- CreateIndex
CREATE INDEX "banos_ubicacion_idx" ON "banos"("ubicacion_id");

-- CreateIndex
CREATE INDEX "banos_fecha_idx" ON "banos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "banos_usuario_idx" ON "banos"("usuario_id");

-- CreateIndex
CREATE INDEX "biometrias_ubicacion_idx" ON "biometrias"("ubicacion_id");

-- CreateIndex
CREATE INDEX "biometrias_instalacion_idx" ON "biometrias"("instalacion_id");

-- CreateIndex
CREATE INDEX "biometrias_reproductor_idx" ON "biometrias"("reproductor_id");

-- CreateIndex
CREATE INDEX "biometrias_fecha_idx" ON "biometrias"("fecha" DESC);

-- CreateIndex
CREATE INDEX "biometrias_tipo_idx" ON "biometrias"("tipo");

-- CreateIndex
CREATE INDEX "biometrias_usuario_idx" ON "biometrias"("usuario_id");

-- CreateIndex
CREATE INDEX "insumos_ubicacion_idx" ON "insumos"("ubicacion_id");

-- CreateIndex
CREATE INDEX "insumos_fecha_idx" ON "insumos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "insumos_usuario_idx" ON "insumos"("usuario_id");

-- CreateIndex
CREATE INDEX "inv_alev_ubicacion_idx" ON "inventario_alevines"("ubicacion_id");

-- CreateIndex
CREATE INDEX "inv_alev_lote_idx" ON "inventario_alevines"("lote");

-- CreateIndex
CREATE INDEX "inv_alev_usuario_idx" ON "inventario_alevines"("usuario_id");

-- CreateIndex
CREATE INDEX "medicamentos_ubicacion_idx" ON "medicamentos"("ubicacion_id");

-- CreateIndex
CREATE INDEX "medicamentos_fecha_idx" ON "medicamentos"("fecha_hora" DESC);

-- CreateIndex
CREATE INDEX "medicamentos_usuario_idx" ON "medicamentos"("usuario_id");

-- CreateIndex
CREATE INDEX "parametros_ubicacion_idx" ON "parametros"("ubicacion_id");

-- CreateIndex
CREATE INDEX "parametros_fecha_idx" ON "parametros"("fecha" DESC);

-- CreateIndex
CREATE INDEX "parametros_usuario_idx" ON "parametros"("usuario_id");

-- CreateIndex
CREATE INDEX "plagas_ubicacion_idx" ON "plagas"("ubicacion_id");

-- CreateIndex
CREATE INDEX "plagas_fecha_idx" ON "plagas"("fecha" DESC);

-- CreateIndex
CREATE INDEX "plagas_usuario_idx" ON "plagas"("usuario_id");

-- CreateIndex
CREATE INDEX "recambios_ubicacion_idx" ON "recambios"("ubicacion_id");

-- CreateIndex
CREATE INDEX "recambios_mes_idx" ON "recambios"("mes");

-- CreateIndex
CREATE INDEX "recambios_usuario_idx" ON "recambios"("usuario_id");

-- CreateIndex
CREATE INDEX "recepcion_ubicacion_idx" ON "recepcion_insumos"("ubicacion_id");

-- CreateIndex
CREATE INDEX "recepcion_fecha_idx" ON "recepcion_insumos"("fecha" DESC);

-- CreateIndex
CREATE INDEX "recepcion_proveedor_idx" ON "recepcion_insumos"("proveedor");

-- CreateIndex
CREATE INDEX "recepcion_usuario_idx" ON "recepcion_insumos"("usuario_id");

-- CreateIndex
CREATE INDEX "visitas_ubicacion_idx" ON "visitas"("ubicacion_id");

-- CreateIndex
CREATE INDEX "visitas_fecha_idx" ON "visitas"("fecha" DESC);

-- CreateIndex
CREATE INDEX "visitas_usuario_idx" ON "visitas"("usuario_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_modulos" ADD CONSTRAINT "roles_modulos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_modulos" ADD CONSTRAINT "roles_modulos_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("modulo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones" ADD CONSTRAINT "observaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instalaciones" ADD CONSTRAINT "instalaciones_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instalaciones" ADD CONSTRAINT "instalaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductores" ADD CONSTRAINT "reproductores_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "instalaciones"("instalacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductores" ADD CONSTRAINT "reproductores_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductores" ADD CONSTRAINT "reproductores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reproductores" ADD CONSTRAINT "reproductores_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "instalaciones"("instalacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piletas" ADD CONSTRAINT "piletas_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "instalaciones"("instalacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piletas" ADD CONSTRAINT "piletas_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes"("lote_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piletas" ADD CONSTRAINT "piletas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piletas" ADD CONSTRAINT "piletas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piletas" ADD CONSTRAINT "piletas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engorda" ADD CONSTRAINT "engorda_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "instalaciones"("instalacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engorda" ADD CONSTRAINT "engorda_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes"("lote_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engorda" ADD CONSTRAINT "engorda_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engorda" ADD CONSTRAINT "engorda_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engorda" ADD CONSTRAINT "engorda_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("equipo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentos" ADD CONSTRAINT "alimentos_pileta_id_fkey" FOREIGN KEY ("pileta_id") REFERENCES "piletas"("pileta_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentos" ADD CONSTRAINT "alimentos_engorda_id_fkey" FOREIGN KEY ("engorda_id") REFERENCES "engorda"("engorda_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentos" ADD CONSTRAINT "alimentos_reproductor_id_fkey" FOREIGN KEY ("reproductor_id") REFERENCES "reproductores"("reproductor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentos" ADD CONSTRAINT "alimentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_pileta_origen_fkey" FOREIGN KEY ("pileta_origen") REFERENCES "piletas"("pileta_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_pileta_destino_fkey" FOREIGN KEY ("pileta_destino") REFERENCES "piletas"("pileta_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_instalacion_origen_fkey" FOREIGN KEY ("instalacion_origen") REFERENCES "instalaciones"("instalacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_instalacion_destino_fkey" FOREIGN KEY ("instalacion_destino") REFERENCES "instalaciones"("instalacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes"("lote_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_alevinaje" ADD CONSTRAINT "trazabilidad_alevinaje_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_engorda" ADD CONSTRAINT "trazabilidad_engorda_engorda_origen_fkey" FOREIGN KEY ("engorda_origen") REFERENCES "engorda"("engorda_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_engorda" ADD CONSTRAINT "trazabilidad_engorda_engorda_destino_fkey" FOREIGN KEY ("engorda_destino") REFERENCES "engorda"("engorda_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_engorda" ADD CONSTRAINT "trazabilidad_engorda_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_engorda" ADD CONSTRAINT "trazabilidad_engorda_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_reproductores" ADD CONSTRAINT "trazabilidad_reproductores_repro_origen_fkey" FOREIGN KEY ("repro_origen") REFERENCES "reproductores"("reproductor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_reproductores" ADD CONSTRAINT "trazabilidad_reproductores_repro_destino_fkey" FOREIGN KEY ("repro_destino") REFERENCES "reproductores"("reproductor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_reproductores" ADD CONSTRAINT "trazabilidad_reproductores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trazabilidad_reproductores" ADD CONSTRAINT "trazabilidad_reproductores_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("departamento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_puesto_id_fkey" FOREIGN KEY ("puesto_id") REFERENCES "puestos"("puesto_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidades_negocio"("unidad_negocio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_empleado" ADD CONSTRAINT "documentos_empleado_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("empleado_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_empleado" ADD CONSTRAINT "documentos_empleado_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documento"("tipo_documento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_administrativas" ADD CONSTRAINT "actas_administrativas_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("empleado_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nomina" ADD CONSTRAINT "nomina_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("empleado_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nomina" ADD CONSTRAINT "nomina_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacaciones" ADD CONSTRAINT "vacaciones_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("empleado_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_ahorro_resumen" ADD CONSTRAINT "caja_ahorro_resumen_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidades_negocio"("unidad_negocio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_ejecutivo_empleado_id_fkey" FOREIGN KEY ("ejecutivo_empleado_id") REFERENCES "empleados"("empleado_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidades_negocio"("unidad_negocio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_espera" ADD CONSTRAINT "lista_espera_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flujo_caja" ADD CONSTRAINT "flujo_caja_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_movimientos" ADD CONSTRAINT "lote_movimientos_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lotes"("lote_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_movimientos" ADD CONSTRAINT "lote_movimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_movimientos" ADD CONSTRAINT "lote_movimientos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentacion" ADD CONSTRAINT "alimentacion_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentacion" ADD CONSTRAINT "alimentacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimentacion" ADD CONSTRAINT "alimentacion_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banos" ADD CONSTRAINT "banos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banos" ADD CONSTRAINT "banos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banos" ADD CONSTRAINT "banos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometrias" ADD CONSTRAINT "biometrias_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometrias" ADD CONSTRAINT "biometrias_instalacion_id_fkey" FOREIGN KEY ("instalacion_id") REFERENCES "instalaciones"("instalacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometrias" ADD CONSTRAINT "biometrias_reproductor_id_fkey" FOREIGN KEY ("reproductor_id") REFERENCES "reproductores"("reproductor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometrias" ADD CONSTRAINT "biometrias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biometrias" ADD CONSTRAINT "biometrias_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_alevines" ADD CONSTRAINT "inventario_alevines_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_alevines" ADD CONSTRAINT "inventario_alevines_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_alevines" ADD CONSTRAINT "inventario_alevines_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros" ADD CONSTRAINT "parametros_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros" ADD CONSTRAINT "parametros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros" ADD CONSTRAINT "parametros_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagas" ADD CONSTRAINT "plagas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagas" ADD CONSTRAINT "plagas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagas" ADD CONSTRAINT "plagas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recambios" ADD CONSTRAINT "recambios_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recambios" ADD CONSTRAINT "recambios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recambios" ADD CONSTRAINT "recambios_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_insumos" ADD CONSTRAINT "recepcion_insumos_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("ubicacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones"("observacion_id") ON DELETE SET NULL ON UPDATE CASCADE;


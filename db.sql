BEGIN;

-- ============================================================================
-- 1.  Funciones utilitarias de actualización
-- ============================================================================
CREATE OR REPLACE FUNCTION touch_fecha_actualizacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION touch_fecha_actualizacion() IS
    'Actualiza fecha_actualizacion en cada UPDATE (solo nomina y vacaciones).';

-- Variante para tablas con columna updated_at (proveedores)
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION touch_updated_at() IS
    'Actualiza updated_at en cada UPDATE (solo proveedores).';

-- Variante para caja_ahorro_resumen que usa la columna "actualizado"
CREATE OR REPLACE FUNCTION touch_actualizado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.actualizado := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION touch_actualizado() IS
    'Actualiza la columna "actualizado" en cada UPDATE (solo caja_ahorro_resumen).';


-- ============================================================================
-- 1.5  Dependencias: esquemas + tablas de apoyo (auth, RRHH, seguridad)
-- ----------------------------------------------------------------------------
-- Todo aquí es idempotente (CREATE ... IF NOT EXISTS). Si tu base ya tiene
-- estos objetos, no se tocan. Si está vacía, quedan creados para que los
-- FK del módulo Inventarios y los seeds finales puedan ejecutarse.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS rrhh;

-- ----------------------------------------------------------------------------
-- Roles y usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    rol_id   integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre   varchar(50)  NOT NULL,
    es_root  boolean      NOT NULL DEFAULT false,
    CONSTRAINT roles_nombre_uk UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id    integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        varchar(100)  NOT NULL,
    "contraseña"  varchar(255)  NOT NULL,
    rol_id        integer       NOT NULL,
    empresa_id    integer,
    activo        boolean       NOT NULL DEFAULT true,
    CONSTRAINT usuarios_nombre_uk UNIQUE (nombre),
    CONSTRAINT usuarios_rol_fk
        FOREIGN KEY (rol_id) REFERENCES roles (rol_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS usuarios_rol_idx ON usuarios (rol_id);

COMMENT ON TABLE roles    IS 'Roles del sistema. es_root = acceso a todos los módulos.';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema, vinculados a un rol.';

-- ----------------------------------------------------------------------------
-- Seguridad: módulos (menú), pivote roles×módulos y refresh tokens
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modulos (
    modulo_id integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre    varchar(50)   NOT NULL,
    ruta      varchar(100)  NOT NULL,
    activo    boolean       NOT NULL DEFAULT true,
    CONSTRAINT modulos_nombre_uk UNIQUE (nombre),
    CONSTRAINT modulos_ruta_uk   UNIQUE (ruta)
);

CREATE TABLE IF NOT EXISTS roles_modulos (
    rol_id    integer NOT NULL,
    modulo_id integer NOT NULL,
    CONSTRAINT roles_modulos_pk PRIMARY KEY (rol_id, modulo_id),
    CONSTRAINT roles_modulos_rol_fk
        FOREIGN KEY (rol_id) REFERENCES roles (rol_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT roles_modulos_modulo_fk
        FOREIGN KEY (modulo_id) REFERENCES modulos (modulo_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id    integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  integer       NOT NULL,
    token       varchar(255)  NOT NULL,
    expiracion  timestamp     NOT NULL,
    revocado    boolean       NOT NULL DEFAULT false,
    creacion    timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT refresh_tokens_token_uk UNIQUE (token),
    CONSTRAINT refresh_tokens_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx
    ON refresh_tokens (token) WHERE revocado = false;
CREATE INDEX IF NOT EXISTS refresh_tokens_usuario_idx
    ON refresh_tokens (usuario_id);

-- ----------------------------------------------------------------------------
-- RRHH: puestos, departamentos y tipos de documento
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puestos (
    puesto_id integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre    varchar(120)  NOT NULL,
    activo    boolean       NOT NULL DEFAULT true,
    CONSTRAINT puestos_nombre_uk UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS departamentos (
    departamento_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          varchar(80)  NOT NULL,
    activo          boolean      NOT NULL DEFAULT true,
    CONSTRAINT departamentos_nombre_uk UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS tipos_documento (
    tipo_documento_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre            varchar(80)  NOT NULL,
    obligatorio       boolean      NOT NULL DEFAULT false,
    activo            boolean      NOT NULL DEFAULT true,
    CONSTRAINT tipos_documento_nombre_uk UNIQUE (nombre)
);

COMMENT ON TABLE puestos         IS 'Catálogo de puestos organizacionales.';
COMMENT ON TABLE departamentos   IS 'Catálogo de departamentos.';
COMMENT ON TABLE tipos_documento IS 'Tipos de documento para expedientes de empleados.';

-- ----------------------------------------------------------------------------
-- Catálogo de unidades de negocio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidades_negocio (
    unidad_negocio_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre            varchar(100) NOT NULL,
    activo            boolean      NOT NULL DEFAULT true,
    CONSTRAINT unidades_negocio_nombre_uk UNIQUE (nombre)
);

COMMENT ON TABLE unidades_negocio IS 'Catálogo de unidades de negocio del grupo.';

-- ============================================================================
-- 1.6  OBSERVACIONES (tabla centralizada)
-- ----------------------------------------------------------------------------
-- Centraliza notas de texto y responsable de operación. Todas las entidades
-- operativas referencian esta tabla mediante observacion_id (FK nullable).
-- ============================================================================
CREATE TABLE observaciones (
    observacion_id  INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    observacion     VARCHAR(500),
    responsable     VARCHAR(100),
    usuario_id      INTEGER,
    fecha           DATE          NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT observaciones_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL
);

CREATE INDEX observaciones_usuario_idx ON observaciones (usuario_id);
CREATE INDEX observaciones_fecha_idx   ON observaciones (fecha DESC);

COMMENT ON TABLE observaciones IS

-- ============================================================================
-- 1.7  UBICACIONES (granjas fisicas)
-- ============================================================================
CREATE TABLE ubicaciones (
    ubicacion_id  INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(150)  NOT NULL,
    direccion     VARCHAR(300),
    descripcion   VARCHAR(500),
    activo        BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT ubicaciones_nombre_uk UNIQUE (nombre)
);

CREATE INDEX ubicaciones_activo_idx ON ubicaciones (activo);

COMMENT ON TABLE ubicaciones IS
'Granjas fisicas. Reemplaza los VARCHAR granja/ubicacion eliminando CHECK hardcodeados.';

'Tabla centralizada de notas y responsable de operación. Referenciada mediante
 observacion_id (FK nullable SET NULL) desde todas las entidades operativas.';



-- ============================================================================
-- 2.  INSTALACIONES
-- ----------------------------------------------------------------------------
-- Infraestructura física (tinas, piletas, estanques) donde se alojan los
-- organismos. Base del flujo de inventarios.
-- ============================================================================
CREATE TABLE instalaciones (
    instalacion_id       integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_instalacion      varchar(100)   NOT NULL,
    largo                   numeric(10,2)  NOT NULL,
    ancho                   numeric(10,2)  NOT NULL,
    altura                  numeric(10,2)  NOT NULL,
    material                varchar(100)   NOT NULL,
    metros_cubicos          numeric(12,2)  GENERATED ALWAYS AS (largo * ancho * altura) STORED,
    tipo_instalacion        varchar(20)    NOT NULL,
    estado                  varchar(20)    NOT NULL DEFAULT 'vacia',
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,

    CONSTRAINT instalaciones_largo_chk   CHECK (largo  > 0),
    CONSTRAINT instalaciones_ancho_chk   CHECK (ancho  > 0),
    CONSTRAINT instalaciones_altura_chk  CHECK (altura > 0),
    CONSTRAINT instalaciones_tipo_chk
        CHECK (tipo_instalacion IN ('Alevinaje', 'Reproductores', 'Engorda')),
    CONSTRAINT instalaciones_estado_chk
        CHECK (estado IN ('vacia', 'ocupada')),
    CONSTRAINT instalaciones_nombre_uk
        UNIQUE (nombre_instalacion, ubicacion_id),
    CONSTRAINT instalaciones_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT instalaciones_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX instalaciones_ubicacion_idx  ON instalaciones (ubicacion_id);
CREATE INDEX instalaciones_tipo_idx    ON instalaciones (tipo_instalacion);
CREATE INDEX instalaciones_usuario_idx ON instalaciones (usuario_id);

COMMENT ON TABLE  instalaciones IS
    'Infraestructura física por granja. Base del inventario.';
COMMENT ON COLUMN instalaciones.metros_cubicos IS
    'Volumen en m³ = largo * ancho * altura (columna calculada).';
COMMENT ON COLUMN instalaciones.tipo_instalacion IS
    'Enum: Alevinaje, Reproductores, Engorda.';
COMMENT ON COLUMN instalaciones.estado IS
    'Enum: vacia (inicial) | ocupada (al sembrar).';


-- ============================================================================
-- 3.  REPRODUCTORES
-- ----------------------------------------------------------------------------
-- Peces reproductores alojados en instalaciones de tipo Reproductores.
-- Generan los lotes de huevos que bajan a las piletas de alevinaje.
-- ============================================================================
CREATE TABLE reproductores (
    reproductor_id       integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instalacion_id       integer        NOT NULL,
    machos               integer        NOT NULL DEFAULT 0,
    hembras              integer        NOT NULL DEFAULT 0,
    cantidad             integer        GENERATED ALWAYS AS (machos + hembras) STORED,
    talla                numeric(10,2),
    ratio                varchar(10),
    linea                varchar(50),
    familia              varchar(20),
    fecha_siembra        date,
    fecha_biometria      date,
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,

    observacion_id    INTEGER,

    CONSTRAINT reproductores_machos_chk  CHECK (machos  >= 0),
    CONSTRAINT reproductores_hembras_chk CHECK (hembras >= 0),
    CONSTRAINT reproductores_talla_chk   CHECK (talla IS NULL OR talla > 0),
    CONSTRAINT reproductores_instalacion_fk
        FOREIGN KEY (instalacion_id) REFERENCES instalaciones (instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT reproductores_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT reproductores_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT reproductores_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX reproductores_instalacion_idx ON reproductores (instalacion_id);
CREATE INDEX reproductores_ubicacion_idx      ON reproductores (ubicacion_id);
CREATE INDEX reproductores_familia_idx     ON reproductores (familia);

COMMENT ON TABLE  reproductores IS
    'Stock de reproductores por instalación. cantidad es calculada.';
COMMENT ON COLUMN reproductores.instalacion_id IS
    'FK a instalaciones. Sustituye al antiguo instalacion VARCHAR(50).';
COMMENT ON COLUMN reproductores.cantidad IS
    'Total = machos + hembras (columna calculada).';


-- ============================================================================
-- 4.  LOTES
-- ----------------------------------------------------------------------------
-- Cada lote es una camada producida por los reproductores: ovadas, huevos
-- por ml, alevines disponibles y mortalidad acumulada.
-- ============================================================================
CREATE TABLE lotes (
    lote_id              integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instalacion_id       integer        NOT NULL,
    fecha                date           NOT NULL,
    familia                 varchar(50)    NOT NULL,
    no_lote                 varchar(50)    NOT NULL,
    huevos_ml               numeric(10,2),
    ovadas                  integer        NOT NULL DEFAULT 0,
    alevines_inicial        integer        NOT NULL,
    mortalidad              integer        NOT NULL DEFAULT 0,
    mortalidad_porcentaje   numeric(6,2)   GENERATED ALWAYS AS (
                                CASE
                                    WHEN alevines_inicial > 0
                                        THEN round(mortalidad::numeric * 100 / alevines_inicial, 2)
                                    ELSE 0
                                END
                            ) STORED,
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,

    observacion_id    INTEGER,

    CONSTRAINT lotes_ovadas_chk           CHECK (ovadas           >= 0),
    CONSTRAINT lotes_alevines_chk         CHECK (alevines_inicial >= 0),
    CONSTRAINT lotes_mortalidad_chk       CHECK (mortalidad       >= 0),
    CONSTRAINT lotes_mortalidad_limit_chk CHECK (mortalidad       <= alevines_inicial),
    CONSTRAINT lotes_no_lote_chk          CHECK (no_lote ~ '^[A-Z0-9-]+$'),
    CONSTRAINT lotes_no_lote_uk
        UNIQUE (no_lote),
    CONSTRAINT lotes_instalacion_fk
        FOREIGN KEY (instalacion_id) REFERENCES instalaciones (instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT lotes_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT lotes_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT lotes_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX lotes_instalacion_idx ON lotes (instalacion_id);
CREATE INDEX lotes_ubicacion_idx      ON lotes (ubicacion_id);
CREATE INDEX lotes_fecha_idx       ON lotes (fecha);

COMMENT ON TABLE  lotes IS
    'Camadas producidas por los reproductores. Origen de los alevines.';
COMMENT ON COLUMN lotes.instalacion_id IS
    'FK a instalaciones (de tipo Reproductores). Sustituye al antiguo instalacion_id VARCHAR(50).';
COMMENT ON COLUMN lotes.mortalidad_porcentaje IS
    'Porcentaje calculado = mortalidad * 100 / alevines_inicial (0 si alevines_inicial = 0).';


-- ============================================================================
-- 5.  PILETAS (Alevinaje)
-- ----------------------------------------------------------------------------
-- Inventario actual por instalación de tipo Alevinaje: cantidad de alevines,
-- lote de origen, talla. El histórico de movimientos vive en
-- trazabilidad_alevinaje.
-- ============================================================================
CREATE TABLE piletas (
    pileta_id            integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instalacion_id       integer        NOT NULL,
    lote_id              integer,
    cantidad                bigint         NOT NULL DEFAULT 0,
    talla_gr                numeric(14,2),
    fecha_siembra        date           NOT NULL DEFAULT CURRENT_DATE,
    fecha_ultima_biometria date         NOT NULL DEFAULT CURRENT_DATE,
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,

    observacion_id    INTEGER,

    CONSTRAINT piletas_cantidad_chk CHECK (cantidad >= 0),
    CONSTRAINT piletas_talla_chk    CHECK (talla_gr IS NULL OR talla_gr > 0),
    CONSTRAINT piletas_instalacion_uk
        UNIQUE (instalacion_id),
    CONSTRAINT piletas_instalacion_fk
        FOREIGN KEY (instalacion_id) REFERENCES instalaciones (instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT piletas_lote_fk
        FOREIGN KEY (lote_id) REFERENCES lotes (lote_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT piletas_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT piletas_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT piletas_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX piletas_lote_idx    ON piletas (lote_id);
CREATE INDEX piletas_ubicacion_idx  ON piletas (ubicacion_id);
CREATE INDEX piletas_usuario_idx ON piletas (usuario_id);

COMMENT ON TABLE  piletas IS
    'Estado vigente de cada instalación de alevinaje. El histórico de movimientos está en trazabilidad_alevinaje.';
COMMENT ON CONSTRAINT piletas_instalacion_uk ON piletas IS
    'Una pileta por instalación: los movimientos SUMAN a la pileta existente, no crean duplicados.';


-- ============================================================================
-- 6.  ENGORDA
-- ----------------------------------------------------------------------------
-- Traslado desde piletas de alevinaje hacia instalaciones de tipo Engorda.
-- lote_id indica el lote de origen directamente (ya no existe el campo
-- confuso origen_instalacion).
-- ============================================================================
CREATE TABLE engorda (
    engorda_id           integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instalacion_id       integer        NOT NULL,
    lote_id              integer        NOT NULL,
    cantidad                integer        NOT NULL,
    talla_gr                numeric(10,2),
    fecha_siembra        date,
    fecha_biometria      date,
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,

    observacion_id    INTEGER,

    CONSTRAINT engorda_cantidad_chk CHECK (cantidad > 0),
    CONSTRAINT engorda_talla_chk    CHECK (talla_gr IS NULL OR talla_gr > 0),
    CONSTRAINT engorda_instalacion_fk
        FOREIGN KEY (instalacion_id) REFERENCES instalaciones (instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT engorda_lote_fk
        FOREIGN KEY (lote_id) REFERENCES lotes (lote_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT engorda_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT engorda_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT engorda_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX engorda_instalacion_idx ON engorda (instalacion_id);
CREATE INDEX engorda_lote_idx        ON engorda (lote_id);
CREATE INDEX engorda_ubicacion_idx      ON engorda (ubicacion_id);

COMMENT ON TABLE  engorda IS
    'Estado vigente de cada instalación de engorda. El histórico está en trazabilidad_engorda.';
COMMENT ON COLUMN engorda.lote_id IS
    'FK directo al lote de origen. Sustituye al antiguo origen_instalacion integer.';


-- ============================================================================
-- 7.  EQUIPOS
-- ----------------------------------------------------------------------------
-- Inventario de equipos/herramientas por usuario (bombas, redes, sensores).
-- Independiente del flujo biológico.
-- ============================================================================
CREATE TABLE equipos (
    equipo_id                integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre                   varchar(150)   NOT NULL,
    marca                    varchar(100),
    modelo                   varchar(100),
    tipo                     varchar(100),
    fecha_compra             date,
    costo                    numeric(12,2),
    estado                   varchar(50)    NOT NULL DEFAULT 'Operativo',
    ubicacion                varchar(150),
    proximo_mantenimiento    date,
    notas                    text,
    usuario_id               integer        NOT NULL,

    observacion_id    INTEGER,

    CONSTRAINT equipos_costo_chk CHECK (costo IS NULL OR costo >= 0),
    CONSTRAINT equipos_estado_chk
        CHECK (estado IN ('Operativo', 'En mantenimiento', 'Dañado')),
    CONSTRAINT equipos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT equipos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX equipos_usuario_idx ON equipos (usuario_id);
CREATE INDEX equipos_estado_idx  ON equipos (estado);

COMMENT ON TABLE equipos IS
    'Equipos/herramientas del usuario (bombas, redes, sensores, etc.).';


-- ============================================================================
-- 8.  MANTENIMIENTOS
-- ----------------------------------------------------------------------------
-- Bitácora de mantenimientos aplicados a cada equipo.
-- ============================================================================
CREATE TABLE mantenimientos (
    mantenimiento_id         integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    equipo_id                integer        NOT NULL,
    fecha                    date           NOT NULL,
    tipo                     varchar(50)    NOT NULL DEFAULT 'Preventivo',
    descripcion              text,
    costo                    numeric(12,2)  NOT NULL DEFAULT 0,
    estado_post              varchar(50),
    proximo_mantenimiento    date,

    observacion_id    INTEGER,

    CONSTRAINT mantenimientos_costo_chk CHECK (costo >= 0),
    CONSTRAINT mantenimientos_tipo_chk
        CHECK (tipo IN ('Preventivo', 'Correctivo', 'Predictivo')),
    CONSTRAINT mantenimientos_equipo_fk
        FOREIGN KEY (equipo_id) REFERENCES equipos (equipo_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT mantenimientos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX mantenimientos_equipo_idx ON mantenimientos (equipo_id);
CREATE INDEX mantenimientos_fecha_idx  ON mantenimientos (fecha);

COMMENT ON TABLE mantenimientos IS
    'Histórico de visitas de mantenimiento por equipo. Cascade al borrar el equipo.';


-- ============================================================================
-- 9.  ALIMENTOS
-- ----------------------------------------------------------------------------
-- Registro diario de alimentación. Cada fila referencia exactamente UNA
-- unidad productiva: pileta, engorda o reproductor (nunca varias).
-- ============================================================================
CREATE TABLE alimentos (
    alimento_id          integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pileta_id            integer,
    engorda_id           integer,
    reproductor_id       integer,
    particula_mm            numeric(10,2),
    alimento_dia            numeric(10,3),
    porcion                 numeric(10,3),
    gasto_alimento          numeric(12,2),
    usuario_id           integer        NOT NULL,

    CONSTRAINT alimentos_unidad_chk CHECK (
        (CASE WHEN pileta_id      IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN engorda_id     IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN reproductor_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT alimentos_pileta_fk
        FOREIGN KEY (pileta_id) REFERENCES piletas (pileta_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_engorda_fk
        FOREIGN KEY (engorda_id) REFERENCES engorda (engorda_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_reproductor_fk
        FOREIGN KEY (reproductor_id) REFERENCES reproductores (reproductor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX alimentos_pileta_idx      ON alimentos (pileta_id);
CREATE INDEX alimentos_engorda_idx     ON alimentos (engorda_id);
CREATE INDEX alimentos_reproductor_idx ON alimentos (reproductor_id);
CREATE INDEX alimentos_usuario_idx     ON alimentos (usuario_id);

COMMENT ON TABLE alimentos IS
    'Bitácora de alimentación. Cada fila referencia exactamente una unidad productiva (pileta | engorda | reproductor).';
COMMENT ON CONSTRAINT alimentos_unidad_chk ON alimentos IS
    'Garantiza que exactamente una de las tres FKs (pileta/engorda/reproductor) esté poblada.';


-- ============================================================================
-- 10.  TRAZABILIDAD — ALEVINAJE
-- ----------------------------------------------------------------------------
-- Histórico de movimientos entre piletas / desde origen externo / bajas por
-- mortalidad. Se conserva aunque se borren piletas o lotes (SET NULL).
-- ============================================================================
CREATE TABLE trazabilidad_alevinaje (
    movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pileta_origen        integer,
    pileta_destino       integer,
    instalacion_origen   integer,
    instalacion_destino  integer,
    lote_id              integer,
    origen_externo          text,
    tipo_movimiento         varchar(20)    NOT NULL DEFAULT 'TRASLADO',
    cantidad                bigint         NOT NULL,
    ubicacion_id         INTEGER        NOT NULL,
    usuario_id           integer        NOT NULL,
    fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,

    observacion_id    INTEGER,

    CONSTRAINT traza_alev_cantidad_chk CHECK (cantidad > 0),
    CONSTRAINT traza_alev_tipo_chk
        CHECK (tipo_movimiento IN ('TRASLADO', 'SIEMBRA', 'MORTALIDAD')),
    CONSTRAINT traza_alev_origen_chk CHECK (
        pileta_origen     IS NOT NULL
     OR instalacion_origen IS NOT NULL
     OR origen_externo       IS NOT NULL
    ),
    CONSTRAINT traza_alev_origen_interno_externo_chk CHECK (
        NOT (origen_externo IS NOT NULL
             AND (pileta_origen IS NOT NULL OR instalacion_origen IS NOT NULL))
    ),
    CONSTRAINT traza_alev_pileta_origen_fk
        FOREIGN KEY (pileta_origen)  REFERENCES piletas (pileta_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_pileta_destino_fk
        FOREIGN KEY (pileta_destino) REFERENCES piletas (pileta_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_instalacion_origen_fk
        FOREIGN KEY (instalacion_origen)  REFERENCES instalaciones (instalacion_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_instalacion_destino_fk
        FOREIGN KEY (instalacion_destino) REFERENCES instalaciones (instalacion_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_lote_fk
        FOREIGN KEY (lote_id) REFERENCES lotes (lote_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT trazabilidad_alevinaje_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT trazabilidad_alevinaje_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX traza_alev_pileta_origen_idx       ON trazabilidad_alevinaje (pileta_origen);
CREATE INDEX traza_alev_pileta_destino_idx      ON trazabilidad_alevinaje (pileta_destino);
CREATE INDEX traza_alev_instalacion_origen_idx  ON trazabilidad_alevinaje (instalacion_origen);
CREATE INDEX traza_alev_instalacion_destino_idx ON trazabilidad_alevinaje (instalacion_destino);
CREATE INDEX traza_alev_lote_idx                ON trazabilidad_alevinaje (lote_id);
CREATE INDEX traza_alev_fecha_idx               ON trazabilidad_alevinaje (fecha_movimiento DESC);
CREATE INDEX traza_alev_ubicacion_idx              ON trazabilidad_alevinaje (ubicacion_id);

COMMENT ON TABLE trazabilidad_alevinaje IS
    'Histórico de movimientos de alevinaje (traslados, siembras, mortalidad).';
COMMENT ON CONSTRAINT traza_alev_origen_chk ON trazabilidad_alevinaje IS
    'Todo movimiento debe tener algún origen: pileta interna, instalación o texto externo.';
COMMENT ON CONSTRAINT traza_alev_origen_interno_externo_chk ON trazabilidad_alevinaje IS
    'origen_externo y origen interno son mutuamente excluyentes.';


-- ============================================================================
-- 11.  TRAZABILIDAD — ENGORDA
-- ----------------------------------------------------------------------------
-- Histórico de traslados entre instalaciones de engorda.
-- ============================================================================
CREATE TABLE trazabilidad_engorda (
    movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    engorda_origen       integer,
    engorda_destino      integer,
    cantidad_trasladada     integer        NOT NULL,
    usuario_id           integer        NOT NULL,
    fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,

    observacion_id    INTEGER,

    CONSTRAINT traza_eng_cantidad_chk CHECK (cantidad_trasladada > 0),
    CONSTRAINT traza_eng_distinto_chk
        CHECK (engorda_origen IS DISTINCT FROM engorda_destino),
    CONSTRAINT traza_eng_origen_fk
        FOREIGN KEY (engorda_origen)  REFERENCES engorda (engorda_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_eng_destino_fk
        FOREIGN KEY (engorda_destino) REFERENCES engorda (engorda_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_eng_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT trazabilidad_engorda_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX traza_eng_origen_idx  ON trazabilidad_engorda (engorda_origen);
CREATE INDEX traza_eng_destino_idx ON trazabilidad_engorda (engorda_destino);
CREATE INDEX traza_eng_fecha_idx   ON trazabilidad_engorda (fecha_movimiento DESC);

COMMENT ON TABLE trazabilidad_engorda IS
    'Histórico de traslados entre instalaciones de engorda.';


-- ============================================================================
-- 12.  TRAZABILIDAD — REPRODUCTORES
-- ----------------------------------------------------------------------------
-- Histórico de altas/traslados de reproductores. Origen puede ser interno
-- (otro reproductor registrado) o externo (texto libre: "proveedor X").
-- ============================================================================
CREATE TABLE trazabilidad_reproductores (
    movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    repro_origen         integer,
    repro_destino        integer,
    origen_texto            varchar(150),
    cantidad_trasladada     integer,
    usuario_id           integer        NOT NULL,
    fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,

    observacion_id    INTEGER,

    CONSTRAINT traza_repro_cantidad_chk
        CHECK (cantidad_trasladada IS NULL OR cantidad_trasladada > 0),
    CONSTRAINT traza_repro_origen_chk
        CHECK (origen_texto IS NOT NULL OR repro_origen IS NOT NULL),
    CONSTRAINT traza_repro_distinto_chk
        CHECK (repro_origen IS DISTINCT FROM repro_destino),
    CONSTRAINT traza_repro_origen_fk
        FOREIGN KEY (repro_origen)  REFERENCES reproductores (reproductor_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_repro_destino_fk
        FOREIGN KEY (repro_destino) REFERENCES reproductores (reproductor_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_repro_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT trazabilidad_reproductores_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX traza_repro_origen_idx  ON trazabilidad_reproductores (repro_origen);
CREATE INDEX traza_repro_destino_idx ON trazabilidad_reproductores (repro_destino);
CREATE INDEX traza_repro_fecha_idx   ON trazabilidad_reproductores (fecha_movimiento DESC);

COMMENT ON TABLE trazabilidad_reproductores IS
    'Histórico de altas/traslados de reproductores (interno o externo).';


-- ============================================================================
-- 13.  RRHH — TRANSACCIONAL  (empleados, documentos, nómina, vacaciones,
--                             caja de ahorro)
-- ----------------------------------------------------------------------------
-- Las tablas catálogo (puestos, departamentos, tipos_documento) ya quedaron
-- creadas en la sección 1.5. Aquí se definen las tablas que acumulan
-- movimientos diarios del área de Recursos Humanos.
-- ============================================================================

CREATE TABLE empleados (
    empleado_id           INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id            INTEGER,
    departamento_id       INTEGER         NOT NULL,
    puesto_id             INTEGER,
    unidad_negocio_id     INTEGER,

    nombre                VARCHAR(60)     NOT NULL,
    apellido_paterno      VARCHAR(60)     NOT NULL,
    apellido_materno      VARCHAR(60)     NOT NULL,
    genero                VARCHAR(20),
    fecha_nacimiento      DATE,

    estado                VARCHAR(50),
    ciudad                VARCHAR(60),
    calle                 VARCHAR(120),
    codigo_postal         VARCHAR(10),
    referencias           VARCHAR(255),
    comentarios_adicionales TEXT,

    fecha_contratacion    DATE,
    uniformes             INTEGER         NOT NULL DEFAULT 0,
    activo                BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_alta            DATE            NOT NULL DEFAULT CURRENT_DATE,
    fecha_baja            DATE,

    CONSTRAINT empleados_genero_check
        CHECK (genero IS NULL OR genero IN ('M','F','Masculino','Femenino','Otro')),
    CONSTRAINT empleados_uniformes_check
        CHECK (uniformes >= 0),
    CONSTRAINT empleados_codigo_postal_check
        CHECK (codigo_postal IS NULL OR codigo_postal ~ '^[0-9]{4,10}$'),

    CONSTRAINT empleados_usuario_fk
        FOREIGN KEY (usuario_id)      REFERENCES usuarios (usuario_id)      ON DELETE SET NULL,
    CONSTRAINT empleados_departamento_fk
        FOREIGN KEY (departamento_id) REFERENCES departamentos (departamento_id) ON DELETE RESTRICT,
    CONSTRAINT empleados_puesto_fk
        FOREIGN KEY (puesto_id)       REFERENCES puestos (puesto_id)           ON DELETE SET NULL,
    CONSTRAINT empleados_unidad_negocio_fk
        FOREIGN KEY (unidad_negocio_id) REFERENCES unidades_negocio (unidad_negocio_id) ON DELETE SET NULL
);

CREATE INDEX empleados_departamento_idx ON empleados (departamento_id);
CREATE INDEX empleados_puesto_idx       ON empleados (puesto_id);
CREATE INDEX empleados_unidad_negocio_idx ON empleados (unidad_negocio_id);
CREATE INDEX empleados_usuario_idx      ON empleados (usuario_id);
CREATE INDEX empleados_activo_idx       ON empleados (activo);
CREATE INDEX empleados_apellidos_idx    ON empleados (apellido_paterno, apellido_materno);

COMMENT ON TABLE empleados IS
'Expediente de empleados. usuario_id es opcional: no todo empleado
 tiene cuenta de acceso. Al borrar un usuario, el empleado conserva su
 historial (SET NULL).';


-- Documentos del expediente -------------------------------------------------

CREATE TABLE documentos_empleado (
    documento_id          INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empleado_id           INTEGER         NOT NULL,
    tipo_documento_id     INTEGER         NOT NULL,
    ruta_archivo          VARCHAR(500)    NOT NULL,
    nombre_original       VARCHAR(255)    NOT NULL,
    fecha_carga           DATE            NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT doc_emp_unico UNIQUE (empleado_id, tipo_documento_id),

    CONSTRAINT doc_emp_empleado_fk
        FOREIGN KEY (empleado_id)       REFERENCES empleados (empleado_id)       ON DELETE CASCADE,
    CONSTRAINT doc_emp_tipo_fk
        FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento (tipo_documento_id) ON DELETE RESTRICT
);

CREATE INDEX doc_emp_empleado_idx ON documentos_empleado (empleado_id);
CREATE INDEX doc_emp_tipo_idx     ON documentos_empleado (tipo_documento_id);

COMMENT ON TABLE documentos_empleado IS
'Archivos cargados al expediente (INE, RFC, CURP, etc.). Un empleado
 no puede tener dos documentos del mismo tipo: UNIQUE (empleado, tipo).';


-- Actas administrativas -----------------------------------------------------

CREATE TABLE actas_administrativas (
    acta_id               INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empleado_id           INTEGER         NOT NULL,
    motivo                TEXT            NOT NULL,
    fecha                 DATE            NOT NULL,
    ruta_archivo          VARCHAR(500)    NOT NULL,
    nombre_original       VARCHAR(255)    NOT NULL,

    CONSTRAINT actas_admin_empleado_fk
        FOREIGN KEY (empleado_id) REFERENCES empleados (empleado_id) ON DELETE CASCADE
);

CREATE INDEX actas_admin_empleado_idx ON actas_administrativas (empleado_id);
CREATE INDEX actas_admin_fecha_idx    ON actas_administrativas (fecha DESC);

COMMENT ON TABLE actas_administrativas IS
'Actas administrativas vinculadas al expediente de cada empleado.';


-- Nómina --------------------------------------------------------------------

CREATE TABLE nomina (
    nomina_id             INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empleado_id           INTEGER,
    nombre_empleado       VARCHAR(120)    NOT NULL,
    fecha_pago            DATE            NOT NULL DEFAULT CURRENT_DATE,
    total                 NUMERIC(10,2)   NOT NULL DEFAULT 0,
    bono                  NUMERIC(10,2)   NOT NULL DEFAULT 0,
    deuda                 NUMERIC(10,2)   NOT NULL DEFAULT 0,
    descuento             NUMERIC(10,2)   NOT NULL DEFAULT 0,
    anticipo              NUMERIC(10,2)   NOT NULL DEFAULT 0,
    usuario_id            INTEGER,
    fecha_actualizacion   TIMESTAMP(6)    NOT NULL DEFAULT NOW(),

    CONSTRAINT nomina_montos_no_negativos
        CHECK (total >= 0 AND bono >= 0 AND deuda >= 0
               AND descuento >= 0 AND anticipo >= 0),

    CONSTRAINT nomina_empleado_fk
        FOREIGN KEY (empleado_id) REFERENCES empleados (empleado_id) ON DELETE SET NULL,
    CONSTRAINT nomina_usuario_fk
        FOREIGN KEY (usuario_id)  REFERENCES usuarios (usuario_id)  ON DELETE SET NULL
);

CREATE INDEX nomina_empleado_idx    ON nomina (empleado_id);
CREATE INDEX nomina_fecha_pago_idx  ON nomina (fecha_pago DESC);
CREATE INDEX nomina_usuario_idx     ON nomina (usuario_id);

COMMENT ON TABLE nomina IS
'Pagos de nómina. Mantiene nombre_empleado para preservar el histórico
 aunque el empleado sea eliminado o renombrado. El trigger de auditoría
 mantiene fecha_actualizacion alineada con cualquier UPDATE.';


-- Vacaciones ----------------------------------------------------------------

CREATE TABLE vacaciones (
    vacacion_id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empleado_id              INTEGER,
    nombre_empleado          VARCHAR(120) NOT NULL,
    departamento             VARCHAR(80),

    inicio_periodo           DATE         NOT NULL,
    fin_periodo              DATE         NOT NULL,

    dias_trabajados          INTEGER      NOT NULL DEFAULT 0,
    vacaciones_v             INTEGER      NOT NULL DEFAULT 0,
    enfermedad_e             INTEGER      NOT NULL DEFAULT 0,
    maternidad_m             INTEGER      NOT NULL DEFAULT 0,
    permiso_parcial_pp       INTEGER      NOT NULL DEFAULT 0,
    permiso_total_pt         INTEGER      NOT NULL DEFAULT 0,
    inasistencias_i          INTEGER      NOT NULL DEFAULT 0,
    vacaciones_anio          INTEGER      NOT NULL DEFAULT 0,
    dias_previos             INTEGER      NOT NULL DEFAULT 0,
    vacaciones_disponibles   INTEGER      NOT NULL DEFAULT 0,
    vacaciones_disfrutadas   INTEGER      NOT NULL DEFAULT 0,

    asistencia               VARCHAR(50)  NOT NULL DEFAULT 'Asistió',
    fecha_actualizacion      TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT vacaciones_periodo_valido
        CHECK (inicio_periodo <= fin_periodo),
    CONSTRAINT vacaciones_contadores_no_negativos
        CHECK (dias_trabajados        >= 0
           AND vacaciones_v           >= 0
           AND enfermedad_e           >= 0
           AND maternidad_m           >= 0
           AND permiso_parcial_pp     >= 0
           AND permiso_total_pt       >= 0
           AND inasistencias_i        >= 0
           AND vacaciones_anio        >= 0
           AND dias_previos           >= 0
           AND vacaciones_disponibles >= 0
           AND vacaciones_disfrutadas >= 0),

    CONSTRAINT vacaciones_empleado_fk
        FOREIGN KEY (empleado_id) REFERENCES empleados (empleado_id) ON DELETE SET NULL
);

CREATE INDEX vacaciones_empleado_idx ON vacaciones (empleado_id);
CREATE INDEX vacaciones_periodo_idx  ON vacaciones (inicio_periodo, fin_periodo);

COMMENT ON TABLE vacaciones IS
'Registro semanal de días trabajados / ausencias / vacaciones por empleado.
 empleado_id es opcional para soportar periodos históricos previos a la
 creación formal del expediente.';


-- Caja de ahorro (resumen mensual) -----------------------------------------

CREATE TABLE caja_ahorro_resumen (
    caja_ahorro_id   INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    categoria        VARCHAR(100)   NOT NULL,
    ubicacion_id         INTEGER        NOT NULL,

    enero       NUMERIC(12,2) NOT NULL DEFAULT 0,
    febrero     NUMERIC(12,2) NOT NULL DEFAULT 0,
    marzo       NUMERIC(12,2) NOT NULL DEFAULT 0,
    abril       NUMERIC(12,2) NOT NULL DEFAULT 0,
    mayo        NUMERIC(12,2) NOT NULL DEFAULT 0,
    junio       NUMERIC(12,2) NOT NULL DEFAULT 0,
    julio       NUMERIC(12,2) NOT NULL DEFAULT 0,
    agosto      NUMERIC(12,2) NOT NULL DEFAULT 0,
    septiembre  NUMERIC(12,2) NOT NULL DEFAULT 0,
    octubre     NUMERIC(12,2) NOT NULL DEFAULT 0,
    noviembre   NUMERIC(12,2) NOT NULL DEFAULT 0,
    diciembre   NUMERIC(12,2) NOT NULL DEFAULT 0,

    total NUMERIC(14,2) GENERATED ALWAYS AS (
        COALESCE(enero,0)      + COALESCE(febrero,0)   + COALESCE(marzo,0)
      + COALESCE(abril,0)      + COALESCE(mayo,0)      + COALESCE(junio,0)
      + COALESCE(julio,0)      + COALESCE(agosto,0)    + COALESCE(septiembre,0)
      + COALESCE(octubre,0)    + COALESCE(noviembre,0) + COALESCE(diciembre,0)
    ) STORED,

    actualizado TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT caja_ahorro_categoria_ubicacion_uq UNIQUE (categoria, ubicacion_id),

    CONSTRAINT caja_ahorro_montos_no_negativos
        CHECK (enero>=0 AND febrero>=0 AND marzo>=0 AND abril>=0
           AND mayo>=0  AND junio>=0   AND julio>=0 AND agosto>=0
           AND septiembre>=0 AND octubre>=0 AND noviembre>=0 AND diciembre>=0),
    CONSTRAINT caja_ahorro_resumen_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX caja_ahorro_categoria_idx ON caja_ahorro_resumen (categoria);
CREATE INDEX caja_ahorro_ubicacion_idx    ON caja_ahorro_resumen (ubicacion_id);

COMMENT ON TABLE caja_ahorro_resumen IS
'Resumen anual (12 meses) del fondo de caja de ahorro. Una fila por
 categoría/granja. La columna total se calcula automáticamente (GENERATED).';

COMMENT ON COLUMN caja_ahorro_resumen.total IS
'Total anual calculado automáticamente como suma de los 12 meses.';


-- ============================================================================
-- 14.  VENTAS / CRM  (clientes, proveedores, ventas, lista_espera)
-- ============================================================================

CREATE TABLE clientes (
    cliente_id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon_social        VARCHAR(150) NOT NULL,
    rfc                 VARCHAR(20),
    unidad_negocio_id   INTEGER      NOT NULL,
    nombre_contacto     VARCHAR(150),
    telefono            VARCHAR(10),
    correo              VARCHAR(255),
    localidad           VARCHAR(100),
    estado              VARCHAR(100),
    ejecutivo_empleado_id INTEGER    NOT NULL,
    usuario_id          INTEGER      NOT NULL,

    CONSTRAINT clientes_telefono_check
        CHECK (telefono IS NULL OR telefono ~ '^[0-9]{1,10}$'),
    CONSTRAINT clientes_correo_check
        CHECK (correo IS NULL OR correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

    CONSTRAINT clientes_unidad_negocio_fk
        FOREIGN KEY (unidad_negocio_id) REFERENCES unidades_negocio (unidad_negocio_id) ON DELETE RESTRICT,
    CONSTRAINT clientes_ejecutivo_fk
        FOREIGN KEY (ejecutivo_empleado_id) REFERENCES empleados (empleado_id) ON DELETE RESTRICT,
    CONSTRAINT clientes_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE RESTRICT
);

CREATE INDEX clientes_razon_idx      ON clientes (razon_social);
CREATE INDEX clientes_rfc_idx        ON clientes (rfc);
CREATE INDEX clientes_localidad_idx  ON clientes (localidad);
CREATE INDEX clientes_udn_idx        ON clientes (unidad_negocio_id);
CREATE INDEX clientes_ejecutivo_idx  ON clientes (ejecutivo_empleado_id);
CREATE INDEX clientes_usuario_idx    ON clientes (usuario_id);

COMMENT ON TABLE clientes IS
'Catálogo de clientes. usuario_id registra quién dio de alta al cliente.';


-- Proveedores ---------------------------------------------------------------

CREATE TABLE proveedores (
    proveedor_id       INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon_social       VARCHAR(150) NOT NULL,
    rfc                VARCHAR(20)  NOT NULL,
    producto_servicio  VARCHAR(255) NOT NULL,
    unidad_negocio_id  INTEGER      NOT NULL,
    nombre_contacto    VARCHAR(150) NOT NULL,
    telefono           VARCHAR(10)  NOT NULL,
    correo             VARCHAR(255) NOT NULL,
    localidad          VARCHAR(100) NOT NULL,
    estado             VARCHAR(100) NOT NULL,
    created_at            TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT proveedores_telefono_check
        CHECK (telefono ~ '^[0-9]{1,10}$'),
    CONSTRAINT proveedores_correo_check
        CHECK (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

    CONSTRAINT proveedores_unidad_negocio_fk
        FOREIGN KEY (unidad_negocio_id) REFERENCES unidades_negocio (unidad_negocio_id) ON DELETE RESTRICT
);

CREATE INDEX proveedores_razon_social_idx ON proveedores (razon_social);
CREATE INDEX proveedores_rfc_idx          ON proveedores (rfc);
CREATE INDEX proveedores_localidad_idx    ON proveedores (localidad);
CREATE INDEX proveedores_udn_idx          ON proveedores (unidad_negocio_id);

COMMENT ON TABLE proveedores IS
'Catálogo de proveedores con unidad de negocio normalizada.';


-- Ventas --------------------------------------------------------------------
--
-- cliente y encargado_venta se conservan como texto para preservar el
-- historial aunque el cliente/usuario sea eliminado o renombrado.

CREATE TABLE ventas (
    venta_id           INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folio              VARCHAR(50),
    fecha_venta        DATE          NOT NULL,
    cliente            VARCHAR(150)  NOT NULL,
    tipo_venta         VARCHAR(50)   NOT NULL,
    cantidad_vendida   INTEGER       NOT NULL,
    precio_venta       NUMERIC(10,2) NOT NULL,
    monto_total        NUMERIC(12,2) NOT NULL,
    abonado            NUMERIC(12,2) NOT NULL DEFAULT 0,
    adeudo             NUMERIC(12,2) GENERATED ALWAYS AS (monto_total - abonado) STORED,
    estado_pago        VARCHAR(20)   NOT NULL DEFAULT 'ADEUDO',
    empresa            TEXT          NOT NULL,
    encargado_venta    TEXT,

    observacion_id    INTEGER,

    CONSTRAINT ventas_cantidad_positiva   CHECK (cantidad_vendida > 0),
    CONSTRAINT ventas_precio_no_negativo  CHECK (precio_venta    >= 0),
    CONSTRAINT ventas_monto_no_negativo   CHECK (monto_total     >= 0),
    CONSTRAINT ventas_abonado_no_negativo CHECK (abonado         >= 0),
    CONSTRAINT ventas_abonado_max         CHECK (abonado <= monto_total),
    CONSTRAINT ventas_estado_pago_check
        CHECK (estado_pago IN ('PAGADO','ADEUDO','PARCIAL','CANCELADO')),
    CONSTRAINT ventas_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX ventas_cliente_idx     ON ventas (cliente);
CREATE INDEX ventas_fecha_idx       ON ventas (fecha_venta DESC);
CREATE INDEX ventas_estado_pago_idx ON ventas (estado_pago);
CREATE INDEX ventas_empresa_idx     ON ventas (empresa);
CREATE INDEX ventas_folio_idx       ON ventas (folio) WHERE folio IS NOT NULL;

COMMENT ON TABLE ventas IS
'Ventas registradas. adeudo se calcula automáticamente como
 monto_total - abonado. El CHECK (abonado <= monto_total) evita
 pagos en exceso.';


-- Lista de espera (reservas pendientes) ------------------------------------

CREATE TABLE lista_espera (
    lista_id             INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_entrega        DATE         NOT NULL,
    talla                VARCHAR(50),
    cantidad             NUMERIC(12,2) NOT NULL,
    precio_venta         NUMERIC(12,2),
    cliente              VARCHAR(200),
    lugar_entrega        VARCHAR(200),
    encargado_venta      VARCHAR(200),
    unidad_produccion    VARCHAR(200),
    uap_asignada         VARCHAR(200),
    ubicacion_id         INTEGER,
    hora_embolsado       VARCHAR(20),
    hora_entrega         VARCHAR(20),

    CONSTRAINT lista_espera_cantidad_positiva   CHECK (cantidad > 0),
    CONSTRAINT lista_espera_precio_no_negativo
        CHECK (precio_venta IS NULL OR precio_venta >= 0),
    CONSTRAINT lista_espera_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE SET NULL
);

CREATE INDEX lista_espera_fecha_entrega_idx ON lista_espera (fecha_entrega);
CREATE INDEX lista_espera_cliente_idx       ON lista_espera (cliente);
CREATE INDEX lista_espera_granja_idx        ON lista_espera (ubicacion_id);

COMMENT ON TABLE lista_espera IS
'Pedidos confirmados pendientes de entrega. Al concretarse la entrega se
 convierten en filas de ventas (responsabilidad de la aplicación).';


-- ============================================================================
-- 15.  FINANZAS  (cuentas, flujo_caja)
-- ============================================================================

CREATE TABLE cuentas (
    cuenta_id        INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    udn              VARCHAR(100)   NOT NULL,
    nombre           VARCHAR(100)   NOT NULL,
    numero_cuenta    VARCHAR(50),
    banco            VARCHAR(150),
    tipo             VARCHAR(20)    NOT NULL,
    saldo_actual     NUMERIC(15,2)  NOT NULL DEFAULT 0,
    activo           BOOLEAN        NOT NULL DEFAULT TRUE,

    CONSTRAINT cuentas_tipo_check CHECK (tipo IN ('Cheques','Efectivo','Inversion','Ahorro')),
    CONSTRAINT cuentas_nombre_udn_uq UNIQUE (nombre, udn)
);

CREATE INDEX cuentas_udn_idx      ON cuentas (udn);
CREATE INDEX cuentas_activo_idx   ON cuentas (activo);
CREATE INDEX cuentas_nombre_idx   ON cuentas (nombre);

COMMENT ON TABLE cuentas IS
'Cuentas bancarias / cajas de efectivo del grupo. udn guarda el nombre
 de la unidad de negocio (referencia lógica al catálogo unidades_negocio).
 UNIQUE (nombre, udn) impide duplicados dentro de la misma UdN.';


-- Flujo de caja -------------------------------------------------------------
--
-- cuenta se mantiene como VARCHAR (referencia lógica por nombre) porque
-- el backend busca en cuentas por nombre; así la vista de tesorería y los
-- agrupamientos siguen funcionando.

CREATE TABLE flujo_caja (
    movimiento_id      INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha              DATE           NOT NULL,
    ingreso            NUMERIC(12,2)  NOT NULL DEFAULT 0,
    egreso             NUMERIC(12,2)  NOT NULL DEFAULT 0,
    descripcion        VARCHAR(200),
    cuenta             VARCHAR(50),
    categoria          VARCHAR(100),
    subcategoria       VARCHAR(100),
    beneficiario       VARCHAR(100),
    noproyecto         VARCHAR(50),
    factura            VARCHAR(50),
    estatus            VARCHAR(20),
    mes                VARCHAR(7),
    equilibrar         NUMERIC(12,2),

    CONSTRAINT flujo_caja_ingreso_no_negativo CHECK (ingreso >= 0),
    CONSTRAINT flujo_caja_egreso_no_negativo  CHECK (egreso  >= 0),
    CONSTRAINT flujo_caja_mov_valido          CHECK (ingreso > 0 OR egreso > 0),
    CONSTRAINT flujo_caja_estatus_check
        CHECK (estatus IS NULL
               OR estatus IN ('REPOSICION','LIQUIDADO','ADEUDO','PARCIAL')),
    CONSTRAINT flujo_caja_mes_formato
        CHECK (mes IS NULL OR mes ~ '^[0-9]{4}-[0-9]{2}$'),
    CONSTRAINT flujo_caja_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX flujo_caja_ubicacion_idx    ON flujo_caja (ubicacion_id);
CREATE INDEX flujo_caja_fecha_idx     ON flujo_caja (fecha DESC);
CREATE INDEX flujo_caja_cuenta_idx    ON flujo_caja (cuenta);
CREATE INDEX flujo_caja_categoria_idx ON flujo_caja (categoria);
CREATE INDEX flujo_caja_mes_idx       ON flujo_caja (mes);
CREATE INDEX flujo_caja_estatus_idx   ON flujo_caja (estatus);

COMMENT ON TABLE flujo_caja IS
'Movimientos de tesorería. CHECK (ingreso > 0 OR egreso > 0) obliga a que
 cada fila represente un movimiento real (sin ceros en ambos lados).';


-- Vista agregada usada por flujoCajaModel.getTesoreriaByGranja -------------

CREATE OR REPLACE VIEW vw_tesoreria_general AS
SELECT
    u.nombre                          AS granja,
    fc.mes,
    fc.categoria,
    SUM(fc.ingreso)                   AS total_ingreso,
    SUM(fc.egreso)                    AS total_egreso,
    SUM(fc.ingreso - fc.egreso)       AS saldo_neto
FROM flujo_caja fc
JOIN ubicaciones u ON u.ubicacion_id = fc.ubicacion_id
WHERE fc.ingreso IS NOT NULL OR fc.egreso IS NOT NULL
GROUP BY u.nombre, fc.mes, fc.categoria
ORDER BY u.nombre, fc.mes, fc.categoria;

COMMENT ON VIEW vw_tesoreria_general IS
'Agregado mensual de flujo_caja por granja y categoría. Consumido por
 flujoCajaModel.getTesoreriaByGranja.';


-- ============================================================================
-- 16.  LOTE MOVIMIENTOS  (historial de traslados/mermas por lote)
-- ============================================================================

CREATE TABLE lote_movimientos (
    mov_id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lote_id         INTEGER      NOT NULL,
    tipo_movimiento    VARCHAR(20)  NOT NULL,
    cantidad           INTEGER      NOT NULL,
    talla              NUMERIC(5,2),
    fecha              DATE         NOT NULL,
    destino            VARCHAR(100),
    usuario_id      INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT lote_mov_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT lote_mov_tipo_check
        CHECK (tipo_movimiento IN (
            'siembra','traslado','cosecha','venta','mortalidad','merma','ajuste'
        )),

    CONSTRAINT lote_mov_lote_fk
        FOREIGN KEY (lote_id)    REFERENCES lotes (lote_id)    ON DELETE CASCADE,
    CONSTRAINT lote_mov_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT lote_movimientos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL
);

CREATE INDEX lote_mov_lote_idx    ON lote_movimientos (lote_id);
CREATE INDEX lote_mov_fecha_idx   ON lote_movimientos (fecha DESC);
CREATE INDEX lote_mov_tipo_idx    ON lote_movimientos (tipo_movimiento);
CREATE INDEX lote_mov_usuario_idx ON lote_movimientos (usuario_id);

COMMENT ON TABLE lote_movimientos IS
'Bitácora de eventos por lote. Al borrar un lote se borra su historial
 (CASCADE). CHECK restringe tipo_movimiento a un conjunto cerrado.';


-- ============================================================================
-- 17.  BITÁCORAS — REGISTRO OPERATIVO
-- ----------------------------------------------------------------------------
-- Patrón común:
--   · Clave primaria  : id (IDENTITY)
--   · granja/ubicacion: texto libre que referencia a una instalación
--                          por nombre (se preservó como VARCHAR por
--                          compatibilidad con el backend actual)
--   · usuario_id   : FK blanda a usuarios (ON DELETE SET NULL)
-- ============================================================================

-- 17.1  Alimentación (consumo diario por estanque) -------------------------

CREATE TABLE alimentacion (
    id                      INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha                   DATE,
    mes                     VARCHAR(20),
    num_instalacion         INTEGER,
    fecha_siembra           DATE,
    origen_alevines         VARCHAR(200),
    peso_promedio_entrada   NUMERIC(12,3),
    total_alimento_kg       NUMERIC(12,3),
    mortalidad              INTEGER,
    recambio_agua           VARCHAR(50),
    temp_agua               NUMERIC(6,2),
    amonio                  NUMERIC(10,4),
    ph                      NUMERIC(5,2),
    usuario_id              INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT alimentacion_ph_check
        CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14)),
    CONSTRAINT alimentacion_alimento_no_negativo
        CHECK (total_alimento_kg IS NULL OR total_alimento_kg >= 0),
    CONSTRAINT alimentacion_mortalidad_no_negativa
        CHECK (mortalidad IS NULL OR mortalidad >= 0),

    CONSTRAINT alimentacion_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT alimentacion_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT alimentacion_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX alimentacion_ubicacion_idx ON alimentacion (ubicacion_id);
CREATE INDEX alimentacion_fecha_idx     ON alimentacion (fecha DESC);
CREATE INDEX alimentacion_usuario_idx   ON alimentacion (usuario_id);


-- 17.2  Baños (tratamientos de regadera) -----------------------------------

CREATE TABLE banos (
    id                  INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha               DATE         NOT NULL,
    tipo_banio          VARCHAR(20),
    regadera            VARCHAR(100),
    realizo             VARCHAR(100),
    usuario_id          INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT banos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT banos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT banos_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX banos_ubicacion_idx ON banos (ubicacion_id);
CREATE INDEX banos_fecha_idx     ON banos (fecha DESC);
CREATE INDEX banos_usuario_idx   ON banos (usuario_id);


-- 17.3  Biometrías ---------------------------------------------------------
--
-- Esta bitácora SÍ tiene FKs reales a instalaciones y reproductores porque
-- es la única que las necesita para discriminar el tipo de sujeto medido.

CREATE TABLE biometrias (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    instalacion_id        INTEGER,
    reproductor_id        INTEGER,
    tipo                     VARCHAR(20),
    fecha                 DATE          NOT NULL,
    peso_total_gramos     NUMERIC(12,3),
    organismos_muestreados INTEGER,
    peso_promedio         NUMERIC(10,3),
    encargado             VARCHAR(100),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT biometrias_tipo_check
        CHECK (tipo IS NULL
               OR tipo IN ('ALEVINAJE','ENGORDA','REPRODUCTORES')),
    CONSTRAINT biometrias_tipo_repro_coherente
        CHECK (tipo <> 'REPRODUCTORES' OR reproductor_id IS NOT NULL),
    CONSTRAINT biometrias_organismos_positivo
        CHECK (organismos_muestreados IS NULL OR organismos_muestreados > 0),
    CONSTRAINT biometrias_peso_no_negativo
        CHECK (peso_total_gramos IS NULL OR peso_total_gramos >= 0),

    CONSTRAINT biometrias_instalacion_fk
        FOREIGN KEY (instalacion_id) REFERENCES instalaciones (instalacion_id) ON DELETE SET NULL,
    CONSTRAINT biometrias_reproductor_fk
        FOREIGN KEY (reproductor_id) REFERENCES reproductores (reproductor_id) ON DELETE SET NULL,
    CONSTRAINT biometrias_usuario_fk
        FOREIGN KEY (usuario_id)     REFERENCES usuarios (usuario_id)          ON DELETE SET NULL,
    CONSTRAINT biometrias_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT biometrias_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE SET NULL
);

CREATE INDEX biometrias_ubicacion_idx    ON biometrias (ubicacion_id);
CREATE INDEX biometrias_instalacion_idx  ON biometrias (instalacion_id);
CREATE INDEX biometrias_reproductor_idx  ON biometrias (reproductor_id);
CREATE INDEX biometrias_fecha_idx        ON biometrias (fecha DESC);
CREATE INDEX biometrias_tipo_idx         ON biometrias (tipo);
CREATE INDEX biometrias_usuario_idx      ON biometrias (usuario_id);


-- 17.4  Insumos (uso diario) ----------------------------------------------

CREATE TABLE insumos (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha                 DATE          NOT NULL,
    cantidad_udm          VARCHAR(100),
    num_lote              VARCHAR(100),
    descripcion           VARCHAR(300),
    encargado_entrega     VARCHAR(100),
    encargado_recepcion   VARCHAR(100),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT insumos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT insumos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT insumos_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX insumos_ubicacion_idx ON insumos (ubicacion_id);
CREATE INDEX insumos_fecha_idx     ON insumos (fecha DESC);
CREATE INDEX insumos_usuario_idx   ON insumos (usuario_id);


-- 17.5  Inventario de alevines (conteos por lote) -------------------------

CREATE TABLE inventario_alevines (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    num_instalacion       INTEGER,
    lote                  VARCHAR(100),
    cantidad              INTEGER,
    talla                 NUMERIC(10,2),
    fecha_siembra         DATE,
    fecha_salida_hormonado DATE,
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT inv_alev_cantidad_no_negativa
        CHECK (cantidad IS NULL OR cantidad >= 0),
    CONSTRAINT inv_alev_fechas_coherentes
        CHECK (fecha_salida_hormonado IS NULL
               OR fecha_siembra IS NULL
               OR fecha_salida_hormonado >= fecha_siembra),

    CONSTRAINT inv_alev_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT inventario_alevines_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT inventario_alevines_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX inv_alev_ubicacion_idx ON inventario_alevines (ubicacion_id);
CREATE INDEX inv_alev_lote_idx      ON inventario_alevines (lote);
CREATE INDEX inv_alev_usuario_idx   ON inventario_alevines (usuario_id);


-- 17.6  Medicamentos ------------------------------------------------------

CREATE TABLE medicamentos (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha_hora            TIMESTAMP(6)  NOT NULL,
    num_estanque          INTEGER,
    diagnosis             VARCHAR(500),
    tratamiento           VARCHAR(500),
    dosis                 VARCHAR(100),
    forma_aplicacion      VARCHAR(100),
    fecha_ultima_dosis    DATE,
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT medicamentos_ultima_dosis_coherente
        CHECK (fecha_ultima_dosis IS NULL
               OR fecha_ultima_dosis >= fecha_hora::date),

    CONSTRAINT medicamentos_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT medicamentos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT medicamentos_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX medicamentos_ubicacion_idx ON medicamentos (ubicacion_id);
CREATE INDEX medicamentos_fecha_idx     ON medicamentos (fecha_hora DESC);
CREATE INDEX medicamentos_usuario_idx   ON medicamentos (usuario_id);


-- 17.7  Parámetros de agua ------------------------------------------------

CREATE TABLE parametros (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    fecha                 DATE          NOT NULL,
    num_estanque          INTEGER,
    oxigeno               NUMERIC(8,3),
    temperatura           NUMERIC(6,2),
    ph                    NUMERIC(5,2),
    amonio                NUMERIC(10,4),
    nitritos              NUMERIC(10,4),
    nitratos              NUMERIC(10,4),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT parametros_ph_range
        CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14)),
    CONSTRAINT parametros_oxigeno_no_negativo
        CHECK (oxigeno IS NULL OR oxigeno >= 0),
    CONSTRAINT parametros_amonio_no_negativo
        CHECK (amonio IS NULL OR amonio >= 0),
    CONSTRAINT parametros_nitritos_no_negativo
        CHECK (nitritos IS NULL OR nitritos >= 0),
    CONSTRAINT parametros_nitratos_no_negativo
        CHECK (nitratos IS NULL OR nitratos >= 0),

    CONSTRAINT parametros_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT parametros_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT parametros_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX parametros_ubicacion_idx ON parametros (ubicacion_id);
CREATE INDEX parametros_fecha_idx     ON parametros (fecha DESC);
CREATE INDEX parametros_usuario_idx   ON parametros (usuario_id);


-- 17.8  Plagas (trampas y control) ----------------------------------------

CREATE TABLE plagas (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER,
    unidad_produccion        VARCHAR(100),
    fecha                 DATE          NOT NULL,
    num_trampa            VARCHAR(100),
    tipo_trampa              VARCHAR(100),
    hallazgo              VARCHAR(500),
    malla                 VARCHAR(200),
    veneno                VARCHAR(100),
    verifico              VARCHAR(100),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT plagas_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT plagas_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT plagas_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE SET NULL
);

CREATE INDEX plagas_ubicacion_idx ON plagas (ubicacion_id);
CREATE INDEX plagas_fecha_idx     ON plagas (fecha DESC);
CREATE INDEX plagas_usuario_idx   ON plagas (usuario_id);


-- 17.9  Recambios de agua (calendarizado mensual) -------------------------
--
-- La tabla almacena hasta 6 recambios por mes como columnas separadas
-- (fecha1..fecha6, tipo1..tipo6). Se conserva así por
-- compatibilidad con el backend existente.

CREATE TABLE recambios (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER        NOT NULL,
    mes                   VARCHAR(20),
    num_instalacion       INTEGER,
    fecha1                DATE,
    tipo1                 VARCHAR(30),
    fecha2                DATE,
    tipo2                 VARCHAR(30),
    fecha3                DATE,
    tipo3                 VARCHAR(30),
    fecha4                DATE,
    tipo4                 VARCHAR(30),
    fecha5                DATE,
    tipo5                 VARCHAR(30),
    fecha6                DATE,
    tipo6                 VARCHAR(30),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT recambios_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT recambios_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT recambios_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE RESTRICT
);

CREATE INDEX recambios_ubicacion_idx ON recambios (ubicacion_id);
CREATE INDEX recambios_mes_idx       ON recambios (mes);
CREATE INDEX recambios_usuario_idx   ON recambios (usuario_id);


-- 17.10  Recepción de insumos (entrada desde proveedor) -------------------

CREATE TABLE recepcion_insumos (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER,
    fecha                 DATE          NOT NULL,
    proveedor             VARCHAR(100),
    producto              VARCHAR(255),
    unidad_medida         VARCHAR(255),
    cantidad              NUMERIC(15,2),
    lote                  VARCHAR(100),
    condiciones_entrega   VARCHAR(150),
    encargado_entrega     VARCHAR(100),
    verifico              VARCHAR(100),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT recepcion_cantidad_no_negativa
        CHECK (cantidad IS NULL OR cantidad >= 0),

    CONSTRAINT recepcion_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT recepcion_insumos_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT recepcion_insumos_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE SET NULL
);

CREATE INDEX recepcion_ubicacion_idx  ON recepcion_insumos (ubicacion_id);
CREATE INDEX recepcion_fecha_idx      ON recepcion_insumos (fecha DESC);
CREATE INDEX recepcion_proveedor_idx  ON recepcion_insumos (proveedor);
CREATE INDEX recepcion_usuario_idx    ON recepcion_insumos (usuario_id);


-- 17.11  Visitas (registro de entrada/salida de personas externas) --------

CREATE TABLE visitas (
    id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion_id         INTEGER,
    fecha                 DATE          NOT NULL,
    entrada               TIME(6),
    salida                TIME(6),
    nombre_completo       VARCHAR(200),
    origen                VARCHAR(200),
    motivo                VARCHAR(300),
    foto_identificacion   VARCHAR(200),
    usuario_id            INTEGER,

    observacion_id    INTEGER,

    CONSTRAINT visitas_horario_coherente
        CHECK (entrada IS NULL OR salida IS NULL OR salida >= entrada),

    CONSTRAINT visitas_usuario_fk
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id) ON DELETE SET NULL,
    CONSTRAINT visitas_observacion_fk
        FOREIGN KEY (observacion_id) REFERENCES observaciones (observacion_id)
        ON DELETE SET NULL,
    CONSTRAINT visitas_ubicacion_fk
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (ubicacion_id)
        ON DELETE SET NULL
);

CREATE INDEX visitas_ubicacion_idx ON visitas (ubicacion_id);
CREATE INDEX visitas_fecha_idx     ON visitas (fecha DESC);
CREATE INDEX visitas_usuario_idx   ON visitas (usuario_id);


-- ============================================================================
-- 17.X  TRIGGERS con columnas de actualización funcionales
-- ============================================================================

CREATE TRIGGER trg_nomina_touch_actualiz            BEFORE UPDATE ON nomina             FOR EACH ROW EXECUTE FUNCTION touch_fecha_actualizacion();
CREATE TRIGGER trg_vacaciones_touch_actualiz        BEFORE UPDATE ON vacaciones         FOR EACH ROW EXECUTE FUNCTION touch_fecha_actualizacion();
CREATE TRIGGER trg_proveedores_touch_updated_at     BEFORE UPDATE ON proveedores        FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_caja_ahorro_touch_actualizado    BEFORE UPDATE ON caja_ahorro_resumen FOR EACH ROW EXECUTE FUNCTION touch_actualizado();


-- ============================================================================
-- 18.  SEEDS (idempotentes)
-- ----------------------------------------------------------------------------
-- Seguros de re-ejecutar: todos los INSERT usan ON CONFLICT DO NOTHING/UPDATE.
-- Al final se sincronizan las secuencias de identidad con el máximo insertado.
-- ============================================================================


-- Ubicaciones (granjas fisicas)
INSERT INTO ubicaciones (nombre, descripcion) VALUES
    ('Granja Acuicola Medellin', 'Granja acuicola ubicada en Medellin'),
    ('Granja Acuicola La Ceiba',  'Granja acuicola ubicada en La Ceiba')
ON CONFLICT (nombre) DO NOTHING;

-- Rol raíz
INSERT INTO roles (rol_id, nombre, es_root)
OVERRIDING SYSTEM VALUE
VALUES (1, 'Administrador', true)
ON CONFLICT (rol_id) DO UPDATE
    SET nombre  = EXCLUDED.nombre,
        es_root = EXCLUDED.es_root;

-- Usuario admin por defecto (recordar cambiar la contraseña en producción)
INSERT INTO usuarios (nombre, "contraseña", rol_id)
VALUES ('admin', '$2b$10$MAj2BLZF7j2s2Ors05KVfeASNl1m7IXUhnfzjzxe8MOJpj/KgYXP.', 1)
ON CONFLICT (nombre) DO NOTHING;

-- Módulos base del menú
WITH modulos_base (nombre, ruta, activo) AS (
    VALUES
        ('Dashboard',         '/',                  true),
        ('Operaciones',       '/operaciones',       true),
        ('Inventarios',       '/inventarios',       true),
        ('Finanzas',          '/finanzas',          true),
        ('RRHH',              '/rrhh',              true),
        ('Catálogos',         '/catalogos',         true),
        ('Seguridad',         '/seguridad',         true),
        ('Roles',             '/roles',             true),
        ('Usuarios',          '/usuarios',          true),
        ('Piletas',           '/piletas',           true),
        ('Instalaciones',     '/instalaciones',     true),
        ('Lotes',             '/lotes',             true),
        ('Reproductores',     '/reproductores',     true),
        ('Engorda',           '/engorda',           true),
        ('Clientes',          '/clientes',          true),
        ('Ventas',            '/ventas',            true),
        ('Alimentos',         '/alimentos',         true),
        ('Lista de Espera',   '/lista-espera',      true),
        ('Equipos',           '/equipos',           true),
        ('Nomina',            '/nomina',            true),
        ('Vacaciones',        '/vacaciones',        true),
        ('Caja de Ahorro',    '/caja-ahorro',       true),
        ('Proveedores',       '/proveedores',       true),
        ('Flujo de Caja',     '/flujo-caja',        true),
        ('Tesoreria',         '/tesoreria',         true),
        ('Cuentas',           '/cuentas',           true),
        ('Biometrias',        '/biometrias',        true),
        ('Plagas',            '/plagas',            true),
        ('Alimentacion',      '/alimentacion',      true),
        ('Insumos',           '/insumos',           true),
        ('Recepcion Insumos', '/recepcion_insumos', true),
        ('Visitas',           '/visitas',           true),
        ('Banos',             '/banos',             true),
        ('Parametros',        '/parametros',        true),
        ('Medicamentos',      '/medicamentos',      true),
        ('Recambios',         '/recambios',         true),
        ('Inventario',        '/inventario',        true),
        ('Catalogo Estados',  '/estados',           false),
        ('Expedientes',       '/expedientes',       false),
        ('Puestos',           '/puestos',           true),
        ('Empleados',         '/empleados',         true),
        ('Departamentos',     '/departamentos',     true),
        ('Modulos',           '/modulos',           true),
        ('Roles Modulos',     '/roles-modulos',     true),
        ('Unidades de Negocio', '/unidades-negocio', true),
        ('Ubicaciones',         '/ubicaciones',      true)
)
INSERT INTO modulos (nombre, ruta, activo)
SELECT nombre, ruta, activo FROM modulos_base
ON CONFLICT (ruta) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        activo = EXCLUDED.activo;

-- Todos los roles root reciben acceso a todos los módulos
INSERT INTO roles_modulos (rol_id, modulo_id)
SELECT r.rol_id, m.modulo_id
FROM roles r
CROSS JOIN modulos m
WHERE r.es_root = true
ON CONFLICT (rol_id, modulo_id) DO NOTHING;

-- Puestos organizacionales
INSERT INTO puestos (nombre) VALUES
    ('Director General'),
    ('Director de Administracion, Finanzas y RRHH'),
    ('Encargado de Marketing'),
    ('Encargado de Contabilidad'),
    ('Encargado Legal'),
    ('Encargado de Laboratorio'),
    ('Encargado de Bienestar Animal y Control de Patologias'),
    ('Auxiliar de Laboratorio'),
    ('Encargado de Taller'),
    ('Auxiliar de Taller'),
    ('Becario')
ON CONFLICT (nombre) DO NOTHING;

-- Departamentos
INSERT INTO departamentos (nombre) VALUES
    ('Direccion General'),
    ('Administracion, Finanzas y RRHH'),
    ('Marketing'),
    ('Contabilidad'),
    ('Legal'),
    ('Laboratorio'),
    ('Bienestar Animal y Control de Patologias'),
    ('Taller')
ON CONFLICT (nombre) DO NOTHING;

-- Unidades de negocio
INSERT INTO unidades_negocio (nombre) VALUES
    ('Granja Acuicola Medellin'),
    ('Granja Acuicola Ceiba'),
    ('Quality Technology')
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de documento para expedientes
INSERT INTO tipos_documento (nombre, obligatorio) VALUES
    ('Credencial',                  true),
    ('Fotografia',                  true),
    ('Acta de Nacimiento',          true),
    ('INE',                         true),
    ('Licencia de Conducir',        false),
    ('Comprobante de Domicilio',    true),
    ('RFC',                         true),
    ('CURP',                        true),
    ('Comprobante de Estudios',     false),
    ('CV',                          false),
    ('Carta de Recomendacion',      false),
    ('Acuerdo de Confidencialidad', true),
    ('Codigo de Etica',             true),
    ('Codigo de Conducta',          true),
    ('Solicitud de Empleo',         true)
ON CONFLICT (nombre) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Sincronizar secuencias de identidad con los datos sembrados
-- ----------------------------------------------------------------------------
-- Usamos pg_get_serial_sequence para no depender del nombre exacto de la
-- secuencia (sea _seq, _seq1, etc. según versión de pg_dump previa).
SELECT setval(
    pg_get_serial_sequence('roles', 'rol_id'),
    GREATEST(COALESCE((SELECT MAX(rol_id) FROM roles), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('usuarios', 'usuario_id'),
    GREATEST(COALESCE((SELECT MAX(usuario_id) FROM usuarios), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('modulos', 'modulo_id'),
    GREATEST(COALESCE((SELECT MAX(modulo_id) FROM modulos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('puestos', 'puesto_id'),
    GREATEST(COALESCE((SELECT MAX(puesto_id) FROM puestos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('departamentos', 'departamento_id'),
    GREATEST(COALESCE((SELECT MAX(departamento_id) FROM departamentos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('tipos_documento', 'tipo_documento_id'),
    GREATEST(COALESCE((SELECT MAX(tipo_documento_id) FROM tipos_documento), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('unidades_negocio', 'unidad_negocio_id'),
    GREATEST(COALESCE((SELECT MAX(unidad_negocio_id) FROM unidades_negocio), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('actas_administrativas', 'acta_id'),
    GREATEST(COALESCE((SELECT MAX(acta_id) FROM actas_administrativas), 0), 1)
);


COMMIT;
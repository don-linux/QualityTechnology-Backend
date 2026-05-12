# Legacy Database Reset Notes

> Warning: The procedures below are destructive. They can permanently delete schemas, tables, data, functions, and identity counters. Use them only when you explicitly want to reset a local or disposable PostgreSQL database.

These notes are kept as legacy maintenance guidance. The currently tracked schema file in this repository is `db.sql`.

## Option 1: Drop and Recreate the Database

If you have administrative access, this is the cleanest reset path:

```bash
dropdb <database_name>
createdb <database_name>
psql <database_name> < db.sql
```

If you need to import a different legacy SQL dump instead of `db.sql`, replace the file path accordingly.

## Option 2: Reset Schemas In Place

If you cannot drop the full database, remove the existing schemas and then re-import your target SQL file:

```sql
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
DROP SCHEMA IF EXISTS catalogos CASCADE;
DROP SCHEMA IF EXISTS rrhh CASCADE;
DROP SCHEMA IF EXISTS seguridad CASCADE;
ALTER SCHEMA public OWNER TO postgres;
```

After this reset, re-import `db.sql` or the legacy SQL file you intend to use.

## Why Do This
- Avoid "already exists" conflicts when importing an existing schema dump.
- Remove foreign key and dependency chains before re-importing.
- Reset identity and auto-increment counters along with the old schema.

## Optional Follow-Up

If you need to reseed security modules and root-role module assignments after the schema is present and the database is reachable through the configured `PG*` variables, run:

```bash
node seed.js
```

## Unverified Historical Context

Earlier notes referenced a separate file named `carlos.sql`. That file is not part of the current verified repository state, so treat it as historical or external input rather than the default schema source.

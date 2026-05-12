-- Wipes Prisma's migration history without touching application data.
-- Used by the `prisma:repair-migration-history` npm script when the local
-- migrations folder and the `_prisma_migrations` table fall out of sync.
TRUNCATE TABLE "_prisma_migrations";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "guest_count" INTEGER NOT NULL DEFAULT 1;

-- Remove default after backfilling existing rows so future writes must provide it.
ALTER TABLE "Reservation" ALTER COLUMN "guest_count" DROP DEFAULT;

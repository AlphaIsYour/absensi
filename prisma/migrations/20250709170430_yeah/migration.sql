-- AlterEnum
ALTER TYPE "StatusAbsensi" ADD VALUE 'DINAS_LUAR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jatahCuti" INTEGER NOT NULL DEFAULT 12;

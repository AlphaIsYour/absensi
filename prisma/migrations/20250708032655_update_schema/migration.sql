-- CreateEnum
CREATE TYPE "StatusAbsensi" AS ENUM ('HADIR', 'IZIN', 'GAGAL_LOKASI');

-- DropForeignKey
ALTER TABLE "Absensi" DROP CONSTRAINT "Absensi_userId_fkey";

-- AlterTable
ALTER TABLE "Absensi" ADD COLUMN     "isAnomali" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keterangan" TEXT,
ADD COLUMN     "status" "StatusAbsensi" NOT NULL DEFAULT 'HADIR',
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "photoUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Absensi" ADD CONSTRAINT "Absensi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

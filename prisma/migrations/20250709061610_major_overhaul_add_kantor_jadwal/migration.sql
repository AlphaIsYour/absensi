/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `Absensi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Absensi` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- AlterTable
ALTER TABLE "Absensi" DROP COLUMN "checkInTime",
DROP COLUMN "createdAt",
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "editReason" TEXT,
ADD COLUMN     "editedBy" TEXT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jadwalKerjaId" TEXT,
ADD COLUMN     "kantorId" TEXT;

-- CreateTable
CREATE TABLE "Kantor" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "regional" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 15,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "Kantor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalKerja" (
    "id" TEXT NOT NULL,
    "namaJadwal" TEXT NOT NULL,
    "hariKerja" INTEGER[],
    "jamMasuk" TEXT NOT NULL,
    "jamPulang" TEXT NOT NULL,

    CONSTRAINT "JadwalKerja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kantor_regional_key" ON "Kantor"("regional");

-- CreateIndex
CREATE INDEX "Kantor_regional_idx" ON "Kantor"("regional");

-- CreateIndex
CREATE UNIQUE INDEX "JadwalKerja_namaJadwal_key" ON "JadwalKerja"("namaJadwal");

-- CreateIndex
CREATE INDEX "Absensi_userId_timestamp_idx" ON "Absensi"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kantorId_fkey" FOREIGN KEY ("kantorId") REFERENCES "Kantor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jadwalKerjaId_fkey" FOREIGN KEY ("jadwalKerjaId") REFERENCES "JadwalKerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

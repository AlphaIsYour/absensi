// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Buat Jadwal Kerja default
  const jadwalDefault = await prisma.jadwalKerja.upsert({
    where: { namaJadwal: "Office Hour (Senin-Jumat)" },
    update: {},
    create: {
      namaJadwal: "Office Hour (Senin-Jumat)",
      hariKerja: [1, 2, 3, 4, 5],
      jamMasuk: "08:30",
      jamPulang: "17:30",
    },
  });
  console.log(`Created default schedule: ${jadwalDefault.namaJadwal}`);

  // 2. Buat Kantor Pusat default
  const kantorPusat = await prisma.kantor.upsert({
    where: { regional: "Kantor Pusat" },
    update: {},
    create: {
      nama: "Kantor Pusat Jakarta",
      regional: "Kantor Pusat",
      latitude: -6.2088,
      longitude: 106.8456,
      timezone: "Asia/Jakarta",
      radius: 50,
    },
  });
  console.log(`Created default office: ${kantorPusat.nama}`);

  // 3. Buat SUPER_ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      role: Role.SUPERADMIN, // Ini sudah benar
      password: await hash("password123", 10), // Akan dikenali setelah install @types/bcrypt
      kantorId: kantorPusat.id,
      jadwalKerjaId: jadwalDefault.id,
    },
  });
  console.log(`Created Super Admin: ${superAdmin.name}`);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

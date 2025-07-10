// app/(dashboard)/page.tsx (Sudah Diperbaiki)

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CameraComponent from "./components/CameraComponent"; // Nama komponen bisa diganti jika mau

const DashboardPage = async () => {
  // 1. Ambil sesi otentikasi
  const session = await getAuthSession();
  if (!session?.user) {
    // Jika tidak ada sesi, langsung tendang ke halaman login
    redirect("/sign-in");
  }

  // 2. Ambil data LENGKAP user dari database, termasuk relasi ke Kantor dan Jadwal
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      kantor: true, // Sertakan data kantor tempat user bekerja
      jadwalKerja: true, // Sertakan data jadwal kerja user
    },
  });

  // 3. Tangani kasus jika profil user belum lengkap (belum punya kantor/jadwal)
  if (!currentUser?.kantor || !currentUser?.jadwalKerja) {
    return (
      <div className="container mx-auto p-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md max-w-lg">
          <h1 className="text-xl font-bold">Profil Anda Belum Lengkap</h1>
          <p className="mt-2">
            Anda belum terdaftar di sebuah kantor atau belum memiliki jadwal
            kerja. Absensi tidak dapat dilakukan.
          </p>
          <p className="mt-1">
            Silakan hubungi Administrator untuk melengkapi data Anda.
          </p>
          {/* Opsional: Beri link ke halaman profil jika ada */}
          <Link
            href="/profil"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Lengkapi Profil Sekarang
          </Link>
        </div>
      </div>
    );
  }

  // 4. Jika semua data lengkap, render halaman utama
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Halo, {currentUser.name}!</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di kantor{" "}
          <span className="font-semibold">{currentUser.kantor.nama}</span>.
          <br />
          Silakan pilih jenis kehadiran dan lakukan absensi Anda.
        </p>
      </div>

      {/* 5. Kirim data `kantor` dan `jadwalKerja` sebagai props ke komponen client */}
      <CameraComponent
        userKantor={currentUser.kantor}
        userJadwal={currentUser.jadwalKerja}
      />
    </div>
  );
};

export default DashboardPage;

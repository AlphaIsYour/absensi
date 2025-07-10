/* eslint-disable @typescript-eslint/no-unused-vars */
// app/profil/page.tsx (SOLUSI SUPER AMPUH)

import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/app/profil/components/ProfileClient";
import Link from "next/link";
import { StatusAbsensi } from "@prisma/client";
import { UserProfileWithRelations } from "@/types"; // <-- IMPORT TIPE BARU KITA

const ProfilePage = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  // --- QUERY YANG PALING SEDERHANA & EKSPLISIT ---
  // Kita tidak pakai select atau include yang rumit. Ambil semua field dari User.
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      kantor: true,
      jadwalKerja: true,
    },
  });

  if (!currentUser) {
    return redirect("/sign-in");
  }

  // --- MEMAKSA TIPE DATA ---
  // Kita beritahu TypeScript: "PERCAYA SAMA SAYA, currentUser ini tipenya UserProfileWithRelations!"
  const typedCurrentUser: UserProfileWithRelations = currentUser;

  if (!typedCurrentUser.kantor || !typedCurrentUser.jadwalKerja) {
    return (
      <div className="container mx-auto p-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md max-w-lg">
          <h1 className="text-xl font-bold">Profil Anda Belum Lengkap</h1>
          <p className="mt-2">
            Anda belum terdaftar di sebuah kantor atau belum memiliki jadwal
            kerja.
          </p>
          <p className="mt-1">
            Silakan hubungi Administrator untuk melengkapi data Anda.
          </p>
        </div>
      </div>
    );
  }

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  const startDateMonth = new Date(thisYear, thisMonth, 1);
  const endDateMonth = new Date(thisYear, thisMonth + 1, 0);

  const izinSakitCount = await prisma.absensi.count({
    where: {
      userId: typedCurrentUser.id,
      status: StatusAbsensi.SAKIT,
      timestamp: { gte: startDateMonth, lte: endDateMonth },
    },
  });

  const dinasLuarCount = await prisma.absensi.count({
    where: {
      userId: typedCurrentUser.id,
      status: StatusAbsensi.DINAS_LUAR,
      timestamp: { gte: startDateMonth, lte: endDateMonth },
    },
  });

  const summary = {
    sisaCuti: typedCurrentUser.jatahCuti,
    izinSakitBulanIni: izinSakitCount,
    dinasLuarBulanIni: dinasLuarCount,
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-gray-600">
          Kelola informasi pribadi dan lihat ringkasan kehadiran Anda.
        </p>
      </div>
      <ProfileClient user={typedCurrentUser} summary={summary} />
    </div>
  );
};

export default ProfilePage;

/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/dashboard/page.tsx (FINAL & SEMPURNA)

import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { User, Kantor, Absensi, StatusAbsensi } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import AdminDashboardClient from "./components/AdminDashboardClient";
import FilterDropdown from "./components/FilterDropDown";

// Interface ini menggabungkan detail terbaik dari kedua versi
// Menyertakan 'kantor' untuk tampilan dan 'absensiDetail' yang lengkap.
export interface UserWithAbsensiStatus extends User {
  kantor: Kantor | null;
  absensiStatus: StatusAbsensi | "TANPA_KETERANGAN";
  absensiDetail: Absensi | null;
}

// Interface untuk statistik ringkasan
export interface SummaryStats {
  persentaseKehadiran: number;
  totalKaryawan: number;
  hadir: number;
  izin: number;
  sakit: number;
  cuti: number;
  dinas_luar: number;
  tanpaKeterangan: number;
  gagalLokasi: number;
}

const AdminDashboardPage = async ({
  searchParams,
}: {
  // Tipe searchParams yang lebih sederhana dan umum
  searchParams: { [key: string]: string | undefined };
}) => {
  // 1. Autentikasi dan Otorisasi Session
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    return redirect("/sign-in");
  }

  // 2. Pengambilan Parameter dan Data Awal
  const selectedKantorId = searchParams.kantorId;
  const allKantor = await prisma.kantor.findMany({
    orderBy: { regional: "asc" },
  });

  // 3. Ambil Pengguna Berdasarkan Filter
  // Ini adalah langkah efisien: filter pengguna terlebih dahulu.
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      kantorId: selectedKantorId || undefined,
    },
    include: {
      kantor: true, // Sertakan data kantor untuk ditampilkan
    },
  });

  if (users.length === 0) {
    // Jika tidak ada user (misal filter kantor yang tidak punya user), tampilkan halaman kosong
    // dengan statistik nol agar tidak terjadi error.
    const emptyStats: SummaryStats = {
      persentaseKehadiran: 0,
      totalKaryawan: 0,
      hadir: 0,
      izin: 0,
      sakit: 0,
      cuti: 0,
      dinas_luar: 0,
      tanpaKeterangan: 0,
      gagalLokasi: 0,
    };
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Kehadiran</h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
            </p>
          </div>
          <FilterDropdown
            kantorList={allKantor}
            selectedKantorId={selectedKantorId}
          />
        </div>
        <AdminDashboardClient usersData={[]} summaryData={emptyStats} />
      </div>
    );
  }

  // 4. LOGIKA PENGAMBILAN DATA ABSENSI YANG DISEMPURNAKAN
  const userIds = users.map((user) => user.id);
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const relevantAbsensi = await prisma.absensi.findMany({
    where: {
      userId: { in: userIds },

      // Opsi 1: Absensi dengan timestamp hari ini (untuk Hadir, Gagal, dll.)
      timestamp: {
        gte: new Date(new Date().setDate(todayStart.getDate() - 7)),
        lte: new Date(new Date().setDate(todayStart.getDate() + 30)),
      },
    },
    // Urutkan berdasarkan timestamp terbaru, ini penting untuk menangani duplikasi
    orderBy: { timestamp: "desc" },
  });

  // 5. Pemetaan Status ke Setiap Pengguna dengan Logika Prioritas
  const statusPriority: Record<StatusAbsensi, number> = {
    CUTI: 1,
    SAKIT: 2,
    IZIN: 3,
    HADIR: 4,
    GAGAL_LOKASI: 5,
    DINAS_LUAR: 6,
    // Status lain bisa ditambahkan di sini
  };

  const usersWithStatus: UserWithAbsensiStatus[] = users.map((user) => {
    // Temukan SEMUA absensi relevan untuk user ini
    const userAbsensiRecords = relevantAbsensi.filter(
      (absen) => absen.userId === user.id
    );

    if (userAbsensiRecords.length === 0) {
      return {
        ...user,
        absensiStatus: "TANPA_KETERANGAN",
        absensiDetail: null,
      };
    }

    // Urutkan absensi berdasarkan prioritas (Cuti paling tinggi)
    userAbsensiRecords.sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 99;
      const priorityB = statusPriority[b.status] ?? 99;
      return priorityA - priorityB;
    });

    // Ambil absensi dengan prioritas tertinggi sebagai status final hari ini
    const finalAbsensi = userAbsensiRecords[0];

    return {
      ...user,
      absensiStatus: finalAbsensi.status,
      absensiDetail: finalAbsensi,
    };
  });

  // 6. Perhitungan Statistik yang Akurat Berdasarkan Hasil Pemetaan
  const totalKaryawan = users.length;
  let hadirCount = 0,
    izinCount = 0,
    sakitCount = 0,
    cutiCount = 0,
    gagalLokasiCount = 0,
    tanpaKeteranganCount = 0,
    dinas_luarCount = 0;

  usersWithStatus.forEach((u) => {
    switch (u.absensiStatus) {
      case "HADIR":
        hadirCount++;
        break;
      case "IZIN":
        izinCount++;
        break;
      case "SAKIT":
        sakitCount++;
        break;
      case "CUTI":
        cutiCount++;
        break;
      case "GAGAL_LOKASI":
        gagalLokasiCount++;
        break;
      case "DINAS_LUAR":
        dinas_luarCount++;
        break;
      case "TANPA_KETERANGAN":
        tanpaKeteranganCount++;
        break;
    }
  });

  const summaryStats: SummaryStats = {
    persentaseKehadiran:
      totalKaryawan > 0 ? (hadirCount / totalKaryawan) * 100 : 0,
    totalKaryawan: totalKaryawan,
    hadir: hadirCount,
    izin: izinCount,
    sakit: sakitCount,
    cuti: cutiCount,
    dinas_luar: dinas_luarCount,
    tanpaKeterangan: tanpaKeteranganCount,
    gagalLokasi: gagalLokasiCount,
  };

  // 7. Render Halaman dengan Data yang Sudah Diproses
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Kehadiran</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
          </p>
        </div>
        <FilterDropdown
          kantorList={allKantor}
          selectedKantorId={selectedKantorId}
        />
      </div>

      {/* Komponen Client menerima semua data yang diperlukan */}
      <AdminDashboardClient
        usersData={usersWithStatus}
        summaryData={summaryStats}
      />
    </div>
  );
};

export default AdminDashboardPage;

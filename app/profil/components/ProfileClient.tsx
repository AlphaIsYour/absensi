// app/profil/components/ProfileClient.tsx
"use client";

// Hapus import User, Kantor, JadwalKerja dari prisma client
// import { User, Kantor, JadwalKerja } from "@prisma/client";
// Ganti dengan tipe baru kita
import { UserProfileWithRelations } from "@/types";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Edit3 } from "lucide-react";
import { updateProfile } from "@/lib/actions"; // Import Server Action
import Swal from "sweetalert2"; // Import untuk notifikasi

// Hapus tipe data lama
/*
type UserProfile = User & {
  kantor: Kantor | null;
  jadwalKerja: JadwalKerja | null;
};
*/

// Ganti props dengan tipe baru kita
interface ProfileClientProps {
  user: UserProfileWithRelations;
  summary: {
    sisaCuti: number;
    izinSakitBulanIni: number;
    dinasLuarBulanIni: number;
  };
}

const ProfileClient = ({ user, summary }: ProfileClientProps) => {
  // State untuk mengontrol input form
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");

  // useTransition untuk menangani state pending dari Server Action
  const [isPending, startTransition] = useTransition();

  // --- DIPERBAIKI: Handler yang memanggil Server Action ---
  const handleUpdateProfile = async (formData: FormData) => {
    // Memastikan input memiliki nilai sebelum dikirim
    if (!name.trim() || !phone.trim()) {
      Swal.fire("Error", "Nama dan No. Telepon tidak boleh kosong.", "error");
      return;
    }

    startTransition(async () => {
      // Memanggil server action yang diimpor dari lib/actions
      const result = await updateProfile(formData);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: result.message,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: result.message,
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Info Pribadi & Edit */}
      <div className="lg:col-span-1 space-y-6">
        {/* Bagian foto profil tidak berubah */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src={user.image || "/default-avatar.png"}
              alt="Foto Profil"
              width={128}
              height={128}
              className="rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
              <Edit3 size={16} />
            </button>
          </div>
          {/* Menampilkan nama dari state, agar bisa diperbarui secara optimis (jika diperlukan) */}
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* --- DIPERBAIKI: Form sekarang memanggil Server Action --- */}
        <form
          action={handleUpdateProfile}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="font-bold mb-4">Edit Informasi Pribadi</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name" // Atribut 'name' wajib untuk FormData
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                No. Telepon
              </label>
              <input
                type="tel"
                id="phone"
                name="phone" // Atribut 'name' wajib untuk FormData
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                disabled={isPending} // Tombol dinonaktifkan saat proses berjalan
              >
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Kolom Kanan: Info Pekerjaan & Ringkasan */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Informasi Pekerjaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Kantor:</span>{" "}
              {user.kantor?.nama || (
                <span className="text-red-500">Belum diatur</span>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-600">Regional:</span>{" "}
              {user.kantor?.regional || (
                <span className="text-red-500">Belum diatur</span>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-600">Jadwal:</span>{" "}
              {user.jadwalKerja?.namaJadwal || (
                <span className="text-red-500">Belum diatur</span>
              )}
            </div>
            <div>
              <span className="font-medium text-gray-600">Role:</span>{" "}
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Ringkasan Kehadiran Anda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {summary.sisaCuti}
              </p>
              <p className="text-sm text-gray-600">Sisa Jatah Cuti</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">
                {summary.izinSakitBulanIni}
              </p>
              <p className="text-sm text-gray-600">Izin Sakit Bulan Ini</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {summary.dinasLuarBulanIni}
              </p>
              <p className="text-sm text-gray-600">Dinas Luar Bulan Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold mb-4">Riwayat Absensi (Segera Hadir)</h3>
          <p className="text-gray-500">
            Tabel atau kalender riwayat absensi Anda akan ditampilkan di sini.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;

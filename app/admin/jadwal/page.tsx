// app/admin/jadwal/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteJadwalButton from "./DeleteJadwalButton"; // Import komponen client

// Helper sederhana untuk mengubah angka hari menjadi nama hari
const dayMap: { [key: number]: string } = {
  0: "Min",
  1: "Sen",
  2: "Sel",
  3: "Rab",
  4: "Kam",
  5: "Jum",
  6: "Sab",
};

const JadwalPage = async () => {
  const daftarJadwal = await prisma.jadwalKerja.findMany({
    orderBy: { namaJadwal: "asc" },
  });

  // Server Action untuk Hapus
  async function deleteJadwal(id: string) {
    "use server";

    try {
      await prisma.jadwalKerja.delete({
        where: { id },
      });
      revalidatePath("/admin/jadwal");
    } catch (error) {
      console.error("Gagal menghapus jadwal:", error);
      // Di dunia nyata, kita akan mengembalikan pesan error ke UI
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Jadwal Kerja</h2>
        <Link
          href="/admin/jadwal/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Tambah Jadwal Baru
        </Link>
      </div>

      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Nama Jadwal</th>
              <th className="px-6 py-3 text-left">Hari Kerja</th>
              <th className="px-6 py-3 text-left">Jam Masuk</th>
              <th className="px-6 py-3 text-left">Jam Pulang</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarJadwal.map((jadwal) => (
              <tr key={jadwal.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{jadwal.namaJadwal}</td>
                <td className="px-6 py-4">
                  {jadwal.hariKerja
                    .map((dayIndex) => dayMap[dayIndex] || "?")
                    .join(", ")}
                </td>
                <td className="px-6 py-4">{jadwal.jamMasuk}</td>
                <td className="px-6 py-4">{jadwal.jamPulang}</td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/admin/jadwal/edit/${jadwal.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <DeleteJadwalButton
                    id={jadwal.id}
                    deleteAction={deleteJadwal}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JadwalPage;

// app/admin/kantor/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";

// Ini adalah Server Component, jadi kita bisa langsung query database
const KantorPage = async () => {
  // Ambil semua data kantor dari database
  const daftarKantor = await prisma.kantor.findMany({
    orderBy: {
      regional: "asc", // Urutkan berdasarkan nama regional
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Kantor</h2>
        <Link
          href="/admin/kantor/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Tambah Kantor Baru
        </Link>
      </div>

      {/* Tabel untuk menampilkan data */}
      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Regional</th>
              <th className="px-6 py-3 text-left">Nama Kantor</th>
              <th className="px-6 py-3 text-left">Timezone</th>
              <th className="px-6 py-3 text-left">Koordinat</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarKantor.map((kantor) => (
              <tr key={kantor.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{kantor.regional}</td>
                <td className="px-6 py-4">{kantor.nama}</td>
                <td className="px-6 py-4">{kantor.timezone}</td>
                <td className="px-6 py-4 font-mono text-sm">
                  {kantor.latitude.toFixed(4)}, {kantor.longitude.toFixed(4)}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/admin/kantor/edit/${kantor.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  {/* Tombol Hapus akan kita buat fungsional nanti */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KantorPage;

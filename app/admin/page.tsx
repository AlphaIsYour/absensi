// app/admin/kantor/page.tsx

import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteKantorButton from "@/app/admin/kantor/DeleteKantorButton"; // Import komponen baru

const KantorPage = async () => {
  const daftarKantor = await prisma.kantor.findMany({
    orderBy: { regional: "asc" },
  });

  // SERVER ACTION untuk menghapus. Dibuat di sini agar bisa di-pass ke komponen client.
  async function deleteKantor(id: string) {
    "use server";

    try {
      // Hati-hati: Pastikan tidak ada user yang terhubung dengan kantor ini
      // sebelum menghapusnya untuk menghindari error foreign key.
      // (Ini adalah validasi tingkat lanjut yang bisa ditambahkan nanti)
      await prisma.kantor.delete({
        where: { id },
      });
      revalidatePath("/admin/kantor");
    } catch (error) {
      // Handle error, misal jika kantor masih punya user
      console.error("Gagal menghapus kantor:", error);
      // return { error: "Gagal menghapus, pastikan tidak ada user di kantor ini." }
    }
  }

  return (
    <div>
      {/* ... (bagian judul dan tombol tambah) ... */}
      <div className="bg-white shadow-md rounded">
        <table className="min-w-full table-auto">
          {/* ... (thead) ... */}
          <tbody>
            {daftarKantor.map((kantor) => (
              <tr key={kantor.id} className="border-b hover:bg-gray-50">
                {/* ... (kolom data lainnya) ... */}
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/admin/kantor/edit/${kantor.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  {/* Gunakan komponen client di sini */}
                  <DeleteKantorButton
                    id={kantor.id}
                    deleteAction={deleteKantor}
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

export default KantorPage;

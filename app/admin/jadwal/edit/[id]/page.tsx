// app/admin/jadwal/edit/[id]/page.tsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// FIXED: Define proper PageProps interface for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

const EditJadwalPage = async ({ params }: PageProps) => {
  // FIXED: Await params for Next.js 15
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const jadwal = await prisma.jadwalKerja.findUnique({
    where: { id },
  });

  if (!jadwal) {
    notFound();
  }

  async function updateJadwal(formData: FormData) {
    "use server";

    const namaJadwal = formData.get("namaJadwal")?.toString();
    const jamMasuk = formData.get("jamMasuk")?.toString();
    const jamPulang = formData.get("jamPulang")?.toString();
    const hariKerja = formData.getAll("hariKerja").map(Number);

    if (!namaJadwal || !jamMasuk || !jamPulang || hariKerja.length === 0) {
      throw new Error("Data tidak lengkap");
    }

    await prisma.jadwalKerja.update({
      where: { id },
      data: {
        namaJadwal,
        jamMasuk,
        jamPulang,
        hariKerja,
      },
    });

    revalidatePath("/admin/jadwal");
    redirect("/admin/jadwal");
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Edit Jadwal: {jadwal.namaJadwal}
      </h2>
      <form
        action={updateJadwal}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="namaJadwal" className="block font-medium">
              Nama Jadwal
            </label>
            <input
              type="text"
              name="namaJadwal"
              id="namaJadwal"
              defaultValue={jadwal.namaJadwal}
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="jamMasuk" className="block font-medium">
                Jam Masuk
              </label>
              <input
                type="time"
                name="jamMasuk"
                id="jamMasuk"
                defaultValue={jadwal.jamMasuk}
                required
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="jamPulang" className="block font-medium">
                Jam Pulang
              </label>
              <input
                type="time"
                name="jamPulang"
                id="jamPulang"
                defaultValue={jadwal.jamPulang}
                required
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium">Hari Kerja</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {days.map((day, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-2 p-2 border rounded-md"
                >
                  <input
                    type="checkbox"
                    name="hariKerja"
                    value={index}
                    // KUNCI UTAMA: Cek apakah hari ini ada di dalam array `jadwal.hariKerja`
                    defaultChecked={jadwal.hariKerja.includes(index)}
                    className="rounded"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJadwalPage;

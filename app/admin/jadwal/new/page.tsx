// app/admin/jadwal/new/page.tsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

const NewJadwalPage = () => {
  async function createJadwal(formData: FormData) {
    "use server";

    const namaJadwal = formData.get("namaJadwal")?.toString();
    const jamMasuk = formData.get("jamMasuk")?.toString();
    const jamPulang = formData.get("jamPulang")?.toString();
    // Ambil semua checkbox 'hariKerja' yang dicentang
    const hariKerja = formData.getAll("hariKerja").map(Number);

    if (!namaJadwal || !jamMasuk || !jamPulang || hariKerja.length === 0) {
      throw new Error("Data tidak lengkap");
    }

    await prisma.jadwalKerja.create({
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
      <h2 className="text-2xl font-bold mb-6">Tambah Jadwal Kerja Baru</h2>
      <form
        action={createJadwal}
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
              required
              placeholder="e.g., Office Hours, Shift Malam"
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
                    value={index} // 0 untuk Minggu, 1 untuk Senin, dst.
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJadwalPage;

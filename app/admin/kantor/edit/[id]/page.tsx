// app/admin/kantor/edit/[id]/page.tsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

// Komponen ini menerima `params` yang berisi `id` dari URL
const EditKantorPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  // 1. Ambil data kantor yang mau diedit dari database
  const kantor = await prisma.kantor.findUnique({
    where: { id },
  });

  // Jika kantor dengan ID tersebut tidak ditemukan, tampilkan halaman 404
  if (!kantor) {
    notFound();
  }

  // 2. SERVER ACTION untuk proses UPDATE
  async function updateKantor(formData: FormData) {
    "use server";

    // Ambil data dari form
    const nama = formData.get("nama")?.toString();
    const regional = formData.get("regional")?.toString();
    const timezone = formData.get("timezone")?.toString();
    const latitude = parseFloat(formData.get("latitude")?.toString() || "0");
    const longitude = parseFloat(formData.get("longitude")?.toString() || "0");
    const radius = parseInt(formData.get("radius")?.toString() || "15", 10);

    // Validasi
    if (!nama || !regional || !timezone) {
      throw new Error("Data tidak lengkap");
    }

    // Update data di database
    await prisma.kantor.update({
      where: { id },
      data: {
        nama,
        regional,
        timezone,
        latitude,
        longitude,
        radius,
      },
    });

    // Invalidate cache & redirect
    revalidatePath("/admin/kantor");
    redirect("/admin/kantor");
  }

  // 3. Render Form dengan data yang sudah ada (defaultValue)
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Kantor: {kantor.nama}</h2>
      {/* Form ini sama persis dengan form 'new', tapi ada `defaultValue` */}
      <form
        action={updateKantor}
        className="bg-white p-6 rounded-lg shadow-md max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="nama" className="block font-medium">
              Nama Kantor
            </label>
            <input
              type="text"
              name="nama"
              id="nama"
              defaultValue={kantor.nama}
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="regional" className="block font-medium">
              Regional
            </label>
            <input
              type="text"
              name="regional"
              id="regional"
              defaultValue={kantor.regional}
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="timezone" className="block font-medium">
              Timezone
            </label>
            <select
              name="timezone"
              id="timezone"
              defaultValue={kantor.timezone}
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="block font-medium">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                id="latitude"
                defaultValue={kantor.latitude}
                required
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="block font-medium">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                id="longitude"
                defaultValue={kantor.longitude}
                required
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="radius" className="block font-medium">
              Radius Absen (meter)
            </label>
            <input
              type="number"
              name="radius"
              id="radius"
              defaultValue={kantor.radius}
              required
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
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

export default EditKantorPage;

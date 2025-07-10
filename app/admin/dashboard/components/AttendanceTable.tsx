/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/dashboard/components/AttendanceTable.tsx
import Image from "next/image";
// Tipe data ini diimpor dari page.tsx dan sudah kita perbarui di sana
// untuk menyertakan `kantor: Kantor | null;`
import { UserWithAbsensiStatus } from "../page";
import { Kantor } from "@prisma/client"; // Sebaiknya import tipe Kantor juga

// Komponen StatusBadge - ditambahkan DINAS_LUAR
const StatusBadge = ({
  status,
}: {
  status: UserWithAbsensiStatus["absensiStatus"];
}) => {
  const styles = {
    HADIR: "bg-green-100 text-green-800",
    IZIN: "bg-blue-100 text-blue-800",
    SAKIT: "bg-yellow-100 text-yellow-800",
    CUTI: "bg-purple-100 text-purple-800",
    GAGAL_LOKASI: "bg-orange-100 text-orange-800",
    TANPA_KETERANGAN: "bg-gray-200 text-gray-800",
    DINAS_LUAR: "bg-teal-100 text-teal-800",
  };
  const text = {
    HADIR: "Hadir",
    IZIN: "Izin",
    SAKIT: "Sakit",
    CUTI: "Cuti",
    GAGAL_LOKASI: "Gagal Lokasi",
    TANPA_KETERANGAN: "Tanpa Keterangan",
    DINAS_LUAR: "Dinas Luar",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
    >
      {text[status]}
    </span>
  );
};

// Komponen AccuracyBadge tidak perlu diubah
const AccuracyBadge = ({
  detail,
}: {
  detail: UserWithAbsensiStatus["absensiDetail"];
}) => {
  if (!detail) return <span className="text-gray-400">-</span>;
  if (detail.isAnomali)
    return (
      <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
        Anomali
      </span>
    );
  if (detail.status === "GAGAL_LOKASI")
    return (
      <span className="px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded">
        Tidak Valid
      </span>
    );
  if (detail.status === "HADIR")
    return (
      <span className="px-2 py-1 text-xs font-bold text-white bg-green-600 rounded">
        Valid
      </span>
    );
  return <span className="text-gray-400">-</span>;
};

const AttendanceTable = ({
  users,
  onViewDetail,
}: {
  users: UserWithAbsensiStatus[];
  onViewDetail: (user: UserWithAbsensiStatus) => void;
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama Pengguna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Akurasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Waktu
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Detail</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Image
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.image || "/default-avatar.png"} // Tambahkan fallback avatar
                      alt={`Foto profil ${user.name}`}
                      width={40}
                      height={40}
                    />
                    {/* --- BLOK INI YANG DIPERBARUI --- */}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {/* Menampilkan nama regional kantor dengan fallback */}
                        {user.kantor?.regional || "Belum ada kantor"}
                      </div>
                    </div>
                    {/* ------------------------------- */}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.absensiStatus} />
                </td>
                <td className="px-6 py-4">
                  <AccuracyBadge detail={user.absensiDetail} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.absensiDetail
                    ? new Date(user.absensiDetail.timestamp).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "-"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {user.absensiDetail ? (
                    <button
                      onClick={() => onViewDetail(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Lihat Detail
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;

/* eslint-disable @typescript-eslint/no-unused-vars */
// app/admin/dashboard/components/DetailModal.tsx
import { UserWithAbsensiStatus } from "../page";
import Image from "next/image";
import {
  FiX,
  FiClock,
  FiMapPin,
  FiCamera,
  FiAlertTriangle,
} from "react-icons/fi";

const DetailModal = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithAbsensiStatus;
}) => {
  if (!isOpen || !user.absensiDetail) return null;

  const detail = user.absensiDetail;
  const gmapsUrl = `https://www.google.com/maps?q=${detail.latitude},${detail.longitude}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            Detail Absensi: {user.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6">
          <div className="mb-4">
            <Image
              src={detail.photoUrl || ""}
              alt={`Foto absen ${user.name}`}
              width={600}
              height={450}
              className="rounded-md w-full object-cover"
            />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <FiClock className="mr-2 text-gray-500" /> Waktu:{" "}
              <span className="font-semibold ml-2">
                {new Date(detail.timestamp).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-2 text-gray-500" /> Lokasi:{" "}
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold ml-2 text-blue-600 hover:underline"
              >
                {detail.latitude?.toFixed(5)}, {detail.longitude?.toFixed(5)}
              </a>
            </div>
            {detail.keterangan && (
              <div className="flex items-start">
                <FiAlertTriangle className="mr-2 text-gray-500 mt-1" />{" "}
                Keterangan:{" "}
                <span className="font-semibold ml-2">{detail.keterangan}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

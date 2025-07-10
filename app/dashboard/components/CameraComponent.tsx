/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(dashboard)/components/CameraComponent.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Kantor, JadwalKerja, StatusAbsensi } from "@prisma/client";
import haversine from "haversine-distance";
import imageCompression from "browser-image-compression";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

// --- BARU: Tipe data props yang diterima dari page.tsx ---
interface CameraComponentProps {
  userKantor: Kantor;
  userJadwal: JadwalKerja; // Mungkin akan digunakan untuk validasi jam kerja di masa depan
}

// Tipe untuk data lokasi
interface Location {
  latitude: number;
  longitude: number;
}

const MySwal = withReactContent(Swal);

const CameraComponent = ({ userKantor, userJadwal }: CameraComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- State yang lebih terstruktur ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isWithinArea, setIsWithinArea] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // --- BARU: State untuk dropdown status dan keterangan ---
  const [selectedStatus, setSelectedStatus] = useState<StatusAbsensi>("HADIR");
  const [keterangan, setKeterangan] = useState("");

  // --- DIPERBAIKI: Logika dipecah menjadi fungsi dengan useCallback ---
  const getCameraAccess = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError(
          "Gagal mengakses kamera. Mohon izinkan akses di browser Anda."
        );
      }
    } else {
      setError("Browser tidak mendukung akses kamera.");
    }
  }, []);

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { latitude, longitude };
          setUserLocation(currentLocation);

          // Menggunakan data dinamis dari props
          const dist = haversine(
            { latitude: userKantor.latitude, longitude: userKantor.longitude },
            currentLocation
          );
          setDistance(Math.round(dist));
          setIsWithinArea(dist <= userKantor.radius);
          setIsLoading(false);
        },
        (err) => {
          console.error("Location Error:", err);
          setError(
            "Gagal mendapatkan lokasi. Pastikan GPS atau layanan lokasi Anda aktif."
          );
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Browser tidak mendukung Geolocation.");
      setIsLoading(false);
    }
  }, [userKantor.latitude, userKantor.longitude, userKantor.radius]);

  // --- DIPERBAIKI: useEffect yang lebih bersih dan aman ---
  useEffect(() => {
    // Hanya jalankan jika status yang dipilih adalah HADIR
    if (selectedStatus === "HADIR") {
      getCameraAccess();
      getLocation();
    } else {
      // Jika status bukan hadir, hentikan loading dan reset error
      setIsLoading(false);
      setError(null);
      // Hentikan stream kamera jika ada
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Cleanup function - FIXED: Copy ref to variable to avoid stale closure
    return () => {
      const currentVideo = videoRef.current;
      if (currentVideo?.srcObject) {
        (currentVideo.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
      clearInterval(timer);
    };
  }, [selectedStatus, getCameraAccess, getLocation]); // Re-run jika status berubah

  // --- DIPERBAIKI: Logika submit dengan kompresi gambar dan status dinamis ---
  const handleSubmit = async () => {
    setIsSubmitting(true);

    let photoPayload: string | null = null;
    let locationPayload: Location | null = userLocation;

    if (selectedStatus === "HADIR") {
      if (!videoRef.current || !userLocation || !isWithinArea) {
        MySwal.fire(
          "Error",
          "Anda harus berada di dalam area kantor dan kamera harus aktif untuk absen Hadir.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      // Ambil gambar dan lakukan kompresi
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        // Mirroring the image to match the preview
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      const originalBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      if (!originalBlob) {
        MySwal.fire("Error", "Gagal mengambil gambar dari kamera.", "error");
        setIsSubmitting(false);
        return;
      }

      try {
        // Kompresi gambar untuk ukuran lebih kecil
        const compressedFile = await imageCompression(originalBlob as File, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
        });
        photoPayload = await imageCompression.getDataUrlFromFile(
          compressedFile
        );
      } catch (error) {
        console.error("Image Compression Error:", error);
        MySwal.fire("Error", "Gagal melakukan kompresi gambar.", "error");
        setIsSubmitting(false);
        return;
      }
    } else {
      // Untuk Izin, Cuti, dll., lokasi dan foto tidak wajib (bisa null)
      locationPayload = null;
      if (!keterangan.trim()) {
        MySwal.fire(
          "Error",
          "Keterangan wajib diisi untuk pengajuan Izin, Sakit, atau Cuti.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/absensi/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoPayload,
          location: locationPayload,
          status: selectedStatus,
          keterangan: keterangan,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal melakukan absensi");

      // Pesan sukses yang berbeda tergantung status
      const successTitle = result.status === "HADIR" ? "Berhasil!" : "Terekam!";
      const successIcon = result.status === "HADIR" ? "success" : "info";
      MySwal.fire(successTitle, result.message, successIcon);

      // Reset form setelah berhasil
      setSelectedStatus("HADIR");
      setKeterangan("");
    } catch (err) {
      const error = err as Error;
      MySwal.fire("Oops...", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI dan Logika Tombol yang Ditingkatkan ---
  const isHadirSelected = selectedStatus === "HADIR";
  const submitButtonDisabled =
    isSubmitting || (isHadirSelected && (isLoading || !isWithinArea));

  const getButtonText = () => {
    if (isSubmitting) return "Mengirim...";
    if (isHadirSelected) {
      if (isLoading) return "Mendapatkan Lokasi...";
      if (error) return "Periksa Error di Atas";
      if (!isWithinArea) return "Anda Berada di Luar Area Kantor";
      return "Kirim Absen Hadir";
    }
    return `Kirim Pengajuan ${selectedStatus.replace("_", " ")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full px-4">
      {/* Dropdown Status Absensi */}
      <div className="w-full max-w-lg">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Jenis Kehadiran
        </label>
        <select
          id="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as StatusAbsensi)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting}
        >
          <option value="HADIR">Hadir (Ambil Foto)</option>
          <option value="SAKIT">Sakit</option>
          <option value="IZIN">Izin</option>
          <option value="CUTI">Cuti</option>
          {/* Tambahkan opsi lain jika perlu */}
        </select>
      </div>

      {isHadirSelected ? (
        // --- Tampilan untuk Absen Hadir, menggabungkan Video dan Info Card ---
        <>
          <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-lg bg-gray-900">
            {error ? (
              <div className="h-96 flex items-center justify-center text-white bg-red-500 p-4 text-center">
                <p>{error}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
                style={{ transform: "scaleX(-1)" }}
              />
            )}
          </div>
          <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">
              Informasi Anda
            </h3>
            <div className="space-y-2 text-sm">
              {/* Info waktu & tanggal */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Waktu:</span>
                <span>{currentTime.toLocaleTimeString("id-ID")}</span>
              </div>
              {/* Info status lokasi */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">
                  Status Lokasi:
                </span>
                {isLoading ? (
                  <span>Mengecek...</span>
                ) : isWithinArea ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Di Dalam Area Kantor ({distance}m)
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    Di Luar Area Kantor ({distance}m)
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        // --- Tampilan untuk Izin, Cuti, dll. ---
        <div className="w-full max-w-lg">
          <label
            htmlFor="keterangan"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Keterangan (Wajib diisi)
          </label>
          <textarea
            id="keterangan"
            rows={4}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Contoh: Sakit demam, perlu istirahat."
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Tombol Aksi & Logout */}
      <div className="w-full max-w-lg">
        <button
          onClick={handleSubmit}
          disabled={submitButtonDisabled}
          className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {getButtonText()}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="group flex items-center justify-center gap-2 w-full mt-4 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut
            size={16}
            className="text-gray-400 group-hover:text-red-500"
          />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default CameraComponent;

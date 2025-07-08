/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/components/CameraComponent.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import haversine from "haversine-distance";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Tipe untuk data lokasi
interface Location {
  latitude: number;
  longitude: number;
}

const MySwal = withReactContent(Swal);

const OFFICE_COORDINATES: Location = {
  latitude: -7.33535,
  longitude: 112.800833,
};
const MAX_DISTANCE_METERS = 15;

const CameraComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isWithinArea, setIsWithinArea] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Camera Error:", err);
        setCameraError(
          "Gagal mengakses kamera. Mohon izinkan akses di browser Anda."
        );
      });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = { latitude, longitude };
        setUserLocation(currentLocation);

        const dist = haversine(OFFICE_COORDINATES, currentLocation);
        setDistance(Math.round(dist));

        if (dist <= MAX_DISTANCE_METERS) {
          setIsWithinArea(true);
        } else {
          setIsWithinArea(false);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Location Error:", error);
        MySwal.fire(
          "Error Lokasi",
          "Gagal mendapatkan lokasi. Pastikan GPS atau layanan lokasi Anda aktif.",
          "error"
        );
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
      clearInterval(timer);
    };
  }, []);

  const handleSubmit = async () => {
    if (!videoRef.current || !userLocation) {
      MySwal.fire("Error", "Kamera atau lokasi belum siap.", "error");
      return;
    }

    setIsSubmitting(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    const photoDataUrl = canvas.toDataURL("image/jpeg");

    try {
      // 2. Kirim data ke API endpoint
      const response = await fetch("/api/absensi/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoDataUrl,
          location: userLocation,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal melakukan absensi");
      }

      MySwal.fire("Berhasil!", "Absensi kamu telah terekam.", "success");
    } catch (error: any) {
      MySwal.fire("Oops...", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Container untuk Video */}
      <div className="sm:w-full max-w-lg rounded-lg overflow-hidden shadow-lg bg-gray-900">
        {cameraError ? (
          <div className="h-140 sm:h-96 flex items-center justify-center text-white bg-red-500 p-4">
            <p>{cameraError}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-140 sm:h-96"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
      </div>

      {/* Tombol Aksi */}
      <div className="w-full max-w-lg">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !isWithinArea || isSubmitting}
          className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          bg-blue-600 hover:bg-blue-700
          disabled:bg-gray-400"
        >
          {isLoading
            ? "Mendapatkan Lokasi..."
            : !isWithinArea
            ? "Anda Berada di Luar Area Kantor"
            : isSubmitting
            ? "Mengirim..."
            : "Kirim Absen Sekarang"}
        </button>
      </div>

      {/* Card Informasi */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">
          Informasi Anda
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Waktu:</span>
            <span>{currentTime.toLocaleTimeString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Tanggal:</span>
            <span>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Koordinat:</span>
            {userLocation ? (
              <span className="font-mono">
                {userLocation.latitude.toFixed(5)},{" "}
                {userLocation.longitude.toFixed(5)}
              </span>
            ) : (
              <span>Mencari...</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Status Lokasi:</span>
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
    </div>
  );
};

export default CameraComponent;

// app/api/absensi/submit/route.ts

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import haversine from "haversine-distance";
import { put } from "@vercel/blob"; // Import fungsi `put` dari Vercel Blob

// --- KONFIGURASI (Harus sama dengan di frontend) ---
interface Location {
  latitude: number;
  longitude: number;
}
const OFFICE_COORDINATES: Location = {
  latitude: -7.33535,
  longitude: 112.800833,
};
const MAX_DISTANCE_METERS = 15;
// ---------------------------------------------------

export async function POST(req: Request) {
  try {
    // 1. Cek Sesi User
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { photo, location } = body;

    // 2. Validasi Input Dasar
    if (!photo || !location?.latitude || !location?.longitude) {
      return NextResponse.json(
        { message: "Data foto atau lokasi tidak lengkap" },
        { status: 400 }
      );
    }

    // 3. Validasi Lokasi dan Tentukan Status
    const distance = haversine(OFFICE_COORDINATES, location);
    const isInArea = distance <= MAX_DISTANCE_METERS;

    // Tentukan status berdasarkan lokasi
    const statusAbsensi = isInArea ? "HADIR" : "GAGAL_LOKASI";
    const responseMessage = isInArea
      ? "Absensi berhasil direkam"
      : `Upaya absensi terekam, namun Anda berada di luar area kantor (${Math.round(
          distance
        )}m).`;

    // 4. Upload Foto ke Vercel Blob
    // Konversi Data URL (base64) ke Buffer agar bisa di-upload
    const photoBuffer = Buffer.from(
      photo.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    // Buat nama file yang unik untuk mencegah konflik
    const filename = `absen-${session.user.id}-${Date.now()}.jpg`;

    const blob = await put(filename, photoBuffer, {
      access: "public", // Foto bisa diakses publik melalui URL-nya
      contentType: "image/jpeg",
    });

    // URL foto dari Vercel Blob akan ada di `blob.url`
    const photoUrl = blob.url;

    // 5. Simpan Data ke Database dengan Status yang Tepat
    await prisma.absensi.create({
      data: {
        userId: session.user.id,
        status: statusAbsensi, // Menggunakan status yang sudah kita tentukan
        latitude: location.latitude,
        longitude: location.longitude,
        photoUrl: photoUrl, // Simpan URL dari Vercel Blob
        // 'keterangan' dan 'isAnomali' akan menggunakan nilai default
      },
    });

    // 6. Kirim Respon Sukses
    // Kirim status 201 (Created) jika hadir, dan 200 (OK) jika gagal lokasi tapi terekam
    const responseStatus = isInArea ? 201 : 200;

    return NextResponse.json(
      { message: responseMessage, data: { photoUrl, status: statusAbsensi } },
      { status: responseStatus }
    );
  } catch (error) {
    console.error("Submit Absensi Error:", error);
    // Jika error berasal dari Vercel Blob, mungkin ada pesan spesifik
    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Terjadi kesalahan pada server: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan tidak diketahui pada server" },
      { status: 500 }
    );
  }
}

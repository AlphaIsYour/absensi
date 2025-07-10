/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/absensi/submit/route.ts (SUDAH DIPERBAIKI)

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import haversine from "haversine-distance";
import { put } from "@vercel/blob";
import { Kantor, StatusAbsensi } from "@prisma/client";

// Tipe data yang diharapkan dari body request
interface SubmitBody {
  photo: string | null;
  location: { latitude: number; longitude: number } | null;
  status: StatusAbsensi;
  keterangan: string | null;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: SubmitBody = await req.json();
    const { status, photo, location, keterangan } = body;

    // Ambil data kantor user untuk validasi
    const userWithKantor = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { kantor: true },
    });

    if (!userWithKantor?.kantor) {
      return NextResponse.json(
        { message: "User tidak terdaftar di kantor manapun." },
        { status: 400 }
      );
    }

    // --- LOGIKA BARU YANG LEBIH PINTAR ---

    const dataToCreate: any = {
      userId: session.user.id,
      status: status,
      keterangan: keterangan,
      timestamp: new Date(),
    };
    let responseMessage = "Pengajuan Anda telah berhasil direkam.";
    let responseStatus = 201;

    // Jika statusnya adalah HADIR, lakukan semua validasi lama
    if (status === "HADIR") {
      // Validasi input khusus untuk HADIR
      if (!photo || !location?.latitude || !location?.longitude) {
        return NextResponse.json(
          { message: "Data foto atau lokasi tidak lengkap untuk absen Hadir." },
          { status: 400 }
        );
      }

      // Validasi lokasi & tentukan status sebenarnya (bisa jadi GAGAL_LOKASI)
      const officeCoords = {
        latitude: userWithKantor.kantor.latitude,
        longitude: userWithKantor.kantor.longitude,
      };
      const maxDistance = userWithKantor.kantor.radius;
      const distance = haversine(officeCoords, location);
      const isInArea = distance <= maxDistance;

      dataToCreate.status = isInArea ? "HADIR" : "GAGAL_LOKASI";
      responseMessage = isInArea
        ? "Absensi berhasil direkam"
        : `Upaya absensi terekam, namun Anda berada di luar area kantor (${Math.round(
            distance
          )}m).`;
      responseStatus = isInArea ? 201 : 200;

      // Upload foto ke Vercel Blob
      const photoBuffer = Buffer.from(
        photo.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const filename = `absen-${session.user.id}-${Date.now()}.jpg`;
      const blob = await put(filename, photoBuffer, {
        access: "public",
        contentType: "image/jpeg",
      });

      dataToCreate.photoUrl = blob.url;
      dataToCreate.latitude = location.latitude;
      dataToCreate.longitude = location.longitude;
    } else if (status === "CUTI") {
      // Logika tambahan untuk CUTI (jika perlu)
      // Misalnya, cek sisa jatah cuti
      // (Untuk sekarang kita biarkan lolos dulu)
      if (userWithKantor.jatahCuti <= 0) {
        return NextResponse.json(
          { message: "Jatah cuti Anda sudah habis." },
          { status: 400 }
        );
      }
      // Kurangi jatah cuti dalam transaksi
      await prisma.$transaction([
        prisma.absensi.create({ data: dataToCreate }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { jatahCuti: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json(
        { message: responseMessage },
        { status: responseStatus }
      );
    }

    // Untuk status lain seperti IZIN_SAKIT, DINAS_LUAR, cukup simpan saja
    await prisma.absensi.create({
      data: dataToCreate,
    });

    return NextResponse.json(
      { message: responseMessage },
      { status: responseStatus }
    );
  } catch (error) {
    console.error("Submit Absensi Error:", error);
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

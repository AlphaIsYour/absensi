// app/api/absensi/submit/route.ts

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import haversine from "haversine-distance";

interface Location {
  latitude: number;
  longitude: number;
}
const OFFICE_COORDINATES: Location = {
  latitude: -7.33535,
  longitude: 112.800833,
};
const MAX_DISTANCE_METERS = 15;

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { photo, location } = body;

    if (!photo || !location || !location.latitude || !location.longitude) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const distance = haversine(OFFICE_COORDINATES, location);
    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json(
        {
          message: `Absensi Gagal. Anda berada ${Math.round(
            distance
          )}m dari kantor. Batas radius adalah ${MAX_DISTANCE_METERS}m.`,
        },
        { status: 403 } // 403 Forbidden - ini kode status yang tepat.
      );
    }
    const photoUrl = "https://via.placeholder.com/400x300.png?text=Foto+Absen";

    await prisma.absensi.create({
      data: {
        userId: session.user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        photoUrl: photoUrl,
      },
    });

    return NextResponse.json(
      { message: "Absensi berhasil direkam" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit Absensi Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

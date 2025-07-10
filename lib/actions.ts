/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions.ts (Kembali ke versi asli)

"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "./auth";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

interface ActionResult {
  success: boolean;
  message: string;
}

export async function createKantorAction(
  prevState: { message: string | null }, // Tipe state sebelumnya
  formData: FormData
): Promise<{ message: string | null }> {
  const nama = formData.get("nama")?.toString();
  const regional = formData.get("regional")?.toString();
  const timezone = formData.get("timezone")?.toString();
  const latitude = parseFloat(formData.get("latitude")?.toString() || "0");
  const longitude = parseFloat(formData.get("longitude")?.toString() || "0");
  const radius = parseInt(formData.get("radius")?.toString() || "15", 10);

  if (!nama || !regional || !timezone) {
    return { message: "Semua field wajib diisi." };
  }

  try {
    await prisma.kantor.create({
      data: {
        nama,
        regional,
        timezone,
        latitude,
        longitude,
        radius,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { message: `Gagal: Regional "${regional}" sudah terdaftar.` };
    }
    console.error(error);
    return { message: "Terjadi kesalahan pada server." };
  }

  // Jika sukses, jangan kembalikan pesan, karena kita akan redirect
  revalidatePath("/admin/kantor");
  redirect("/admin/kantor");
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await getAuthSession();
  if (!session?.user) {
    return {
      success: false,
      message: "Anda harus login untuk melakukan aksi ini.",
    };
  }

  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString();

  if (!name || name.length < 3) {
    return {
      success: false,
      message: "Nama harus diisi (minimal 3 karakter).",
    };
  }
  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return {
      success: false,
      message: "Nomor telepon tidak valid (10-15 digit angka).",
    };
  }

  try {
    // KEMBALI GUNAKAN .update KARENA INI YANG PALING BENAR
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name,
        phone: phone, // Error ini akan hilang setelah `prisma generate`
      },
    });

    revalidatePath("/profil");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error) {
    console.error("Update Profile Error:", error);
    if ((error as any).code === "P2002") {
      return {
        success: false,
        message: "Nomor telepon ini sudah digunakan oleh akun lain.",
      };
    }
    return { success: false, message: "Terjadi kesalahan di server." };
  }
}

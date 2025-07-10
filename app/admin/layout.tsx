// app/admin/layout.tsx

import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

// Ini adalah komponen layout utama untuk semua halaman di bawah /admin
const AdminLayout = async ({ children }: { children: ReactNode }) => {
  // 1. Proteksi di level layout (SANGAT PENTING!)
  const session = await getAuthSession();

  // Jika tidak ada sesi ATAU role bukan SUPERADMIN, tendang keluar!
  if (session?.user.role !== "SUPERADMIN") {
    redirect("/sign-in"); // atau ke halaman "unauthorized"
  }

  return (
    <div className="flex min-h-screen">
      {/* 2. Sidebar Sederhana */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav>
          <ul>
            <li>
              <Link
                href="/admin/kantor"
                className="block py-2 px-3 rounded hover:bg-gray-700"
              >
                Manajemen Kantor
              </Link>
            </li>
            <li>
              <Link
                href="/admin/jadwal"
                className="block py-2 px-3 rounded hover:bg-gray-700"
              >
                Manajemen Jadwal
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard"
                className="block py-2 px-3 rounded hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            {/* Tambahkan link lain di sini nanti */}
          </ul>
        </nav>
      </aside>

      {/* 3. Konten Utama Halaman */}
      <main className="flex-1 p-8 bg-gray-100">
        {children} {/* Di sinilah page.tsx akan dirender */}
      </main>
    </div>
  );
};

export default AdminLayout;

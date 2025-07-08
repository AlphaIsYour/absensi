/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(auth)/sign-in/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

const SignInPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="mt-2 text-sm text-gray-600">
              Masuk untuk melakukan absensi
            </p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span>Masuk dengan Google</span>
          </button>

          <p className="px-8 text-center text-sm text-gray-500">
            Dengan masuk, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi
            kami.
          </p>
        </div>
      </main>
    );
  }

  return null;
};

export default SignInPage;

/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(auth)/sign-in/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import LandingNavbar from "@/app/dashboard/components/LandingNavbar";

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
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen w-full">
        <Image
          src={"/background/bg2.jpg"}
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="z-0"
          priority
        />

        <div className="relative z-10 flex flex-col min-h-screen bg-transparent bg-opacity-50">
          <LandingNavbar />

          <main className="flex-grow flex items-center justify-center p-4">
            <div className="w-70 sm:w-full max-w-md p-4 sm:p-8 space-y-2 sm:space-y-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Selamat Datang
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Masuk untuk melakukan absensi
                </p>
                <input />

                <p className="mt-2 text-sm text-gray-600">Atau masuk dengan</p>
              </div>

              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-md font-medium text-gray-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FcGoogle className="w-6 h-6 mr-3" />
                <span>Masuk dengan Google</span>
              </button>

              <p className="px-8 text-center text-xs text-gray-500">
                Dengan masuk, Anda menyetujui Ketentuan Layanan & Kebijakan
                Privasi kami.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
};

export default SignInPage;

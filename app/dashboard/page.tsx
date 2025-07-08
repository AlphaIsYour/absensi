// app/(dashboard)/page.tsx

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import CameraComponent from "./components/CameraComponent";

const DashboardPage = async () => {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Halo, {session.user.name}!</h1>
        <p className="text-gray-600 mt-2">
          Pastikan untuk memposisikan wajah Anda di depan kamera.
        </p>
      </div>

      <CameraComponent />
    </div>
  );
};

export default DashboardPage;

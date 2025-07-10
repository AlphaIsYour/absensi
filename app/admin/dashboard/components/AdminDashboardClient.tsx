// app/admin/dashboard/components/AdminDashboardClient.tsx
"use client";

import { useState } from "react";
import { UserWithAbsensiStatus, SummaryStats } from "../page";
import SummaryCard from "@/app/admin/dashboard/components/SummaryCard";
import AttendanceTable from "@/app/admin/dashboard/components/AttendanceTable";
import DetailModal from "@/app/admin/dashboard/components/DetailModal";

const AdminDashboardClient = ({
  usersData,
  summaryData,
}: {
  usersData: UserWithAbsensiStatus[];
  summaryData: SummaryStats;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserWithAbsensiStatus | null>(null);

  const handleViewDetail = (user: UserWithAbsensiStatus) => {
    if (user.absensiDetail) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      {/* --- BLOK LAYOUT INI YANG DIPERBARUI --- */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Kolom Kiri: Lebar tetap, tidak akan menyusut */}
        <div className="lg:w-[350px] lg:flex-shrink-0">
          <SummaryCard stats={summaryData} />
        </div>

        {/* Kolom Kanan: Mengisi sisa ruang, dengan min-width 0 untuk mencegah overflow */}
        <div className="flex-1 min-w-0">
          <AttendanceTable users={usersData} onViewDetail={handleViewDetail} />
        </div>
      </div>
      {/* ------------------------------------- */}

      {/* Modal untuk "Lihat Detail" (tidak ada perubahan) */}
      {selectedUser && (
        <DetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
        />
      )}
    </>
  );
};

export default AdminDashboardClient;

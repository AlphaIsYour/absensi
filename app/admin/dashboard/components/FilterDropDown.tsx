// app/admin/dashboard/components/FilterDropdown.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Kantor } from "@prisma/client";

interface FilterDropdownProps {
  kantorList: Kantor[];
  selectedKantorId?: string;
}

const FilterDropdown = ({
  kantorList,
  selectedKantorId,
}: FilterDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKantorId = e.target.value;
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!newKantorId) {
      current.delete("kantorId");
    } else {
      current.set("kantorId", newKantorId);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/admin/dashboard${query}`);
  };

  return (
    <div>
      <label
        htmlFor="kantorFilter"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Filter berdasarkan Kantor
      </label>
      <select
        id="kantorFilter"
        name="kantorFilter"
        className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        onChange={handleFilterChange}
        value={selectedKantorId || ""}
      >
        <option value="">Semua Kantor</option>
        {kantorList.map((kantor) => (
          <option key={kantor.id} value={kantor.id}>
            {kantor.regional} - {kantor.nama}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;

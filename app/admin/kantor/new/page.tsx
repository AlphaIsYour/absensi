// app/admin/kantor/new/page.tsx (SUDAH DIPERBAIKI)

import KantorForm from "./KantorForm";
import { createKantorAction } from "@/lib/actions"; // 1. Import action

const NewKantorPage = () => {
  // 2. Tidak ada lagi definisi 'createKantor' di sini

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tambah Kantor Baru</h2>
      {/* 3. Lewatkan action sebagai prop */}
      <KantorForm formAction={createKantorAction} />
    </div>
  );
};

export default NewKantorPage;

// app/admin/jadwal/DeleteJadwalButton.tsx
"use client";

interface DeleteButtonProps {
  id: string;
  deleteAction: (id: string) => Promise<void>;
}

const DeleteJadwalButton = ({ id, deleteAction }: DeleteButtonProps) => {
  const handleDelete = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus jadwal ini? Pastikan tidak ada user yang sedang menggunakan jadwal ini."
      )
    ) {
      deleteAction(id);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900 ml-4"
    >
      Hapus
    </button>
  );
};

export default DeleteJadwalButton;

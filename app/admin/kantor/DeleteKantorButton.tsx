// app/admin/kantor/DeleteKantorButton.tsx
"use client";

// Props yang diterima komponen ini adalah ID kantor dan Server Action-nya
interface DeleteButtonProps {
  id: string;
  deleteAction: (id: string) => Promise<void>;
}

const DeleteKantorButton = ({ id, deleteAction }: DeleteButtonProps) => {
  const handleDelete = () => {
    // Tampilkan konfirmasi browser
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus kantor ini? Aksi ini tidak dapat dibatalkan."
      )
    ) {
      // Jika user klik "OK", panggil Server Action
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

export default DeleteKantorButton;

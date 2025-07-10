// types/index.d.ts

import { User, Kantor, JadwalKerja } from "@prisma/client";

// Ini adalah tipe data lengkap untuk profil user yang akan kita gunakan di mana-mana
export type UserProfileWithRelations = User & {
  kantor: Kantor | null;
  jadwalKerja: JadwalKerja | null;
};

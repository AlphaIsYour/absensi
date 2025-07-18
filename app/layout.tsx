// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "./AuthProvider"; // Import provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Website Absensi",
  description: "Absensi Keren dengan Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true" className={inter.className}>
        <AuthProvider> {children}</AuthProvider>
      </body>
    </html>
  );
}

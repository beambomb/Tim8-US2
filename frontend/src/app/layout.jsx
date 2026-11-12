import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "../components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CariKos - Platform Pencarian & Sewa Kos Mahasiswa",
  description:
    "Temukan kos impian berkualitas, terverifikasi, dan harga transparan di sekitar lingkungan kampus seluruh Indonesia.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-neutral-900 text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

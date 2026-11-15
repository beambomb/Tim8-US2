"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Apakah semua kos di CariKos sudah terverifikasi?",
    a: "Ya. Setiap pengajuan kos baru dari pemilik melalui tahap pemeriksaan Administrator atas kelengkapan foto, lokasi koordinat, dan detail fasilitas sebelum berstatus Approved dan tampil di katalog.",
  },
  {
    q: "Bagaimana cara mencari kos dekat kampus tertentu?",
    a: "Buka halaman Katalog Kos, pilih kampus pada bagian Radius Kampus / GPS (UGM tersedia secara default, atau klik Tambah Kampus untuk mencari kampus apa saja seperti Unhas, Undip, maupun ITS), lalu sesuaikan jarak 1–10 km.",
  },
  {
    q: "Bagaimana alur pengajuan sewa hingga kamar terkonfirmasi?",
    a: "Setelah login sebagai Pencari Kos, pilih tanggal mulai dan durasi sewa di halaman detail kos. Ketika Pemilik Kos menyetujui permohonan Anda, kuota kamar tersedia otomatis berkurang dan notifikasi langsung masuk ke akun Anda.",
  },
  {
    q: "Apakah pencari dan pemilik bisa chat langsung atau menghubungi CS?",
    a: "Bisa. Pencari Kos dapat mengirim pesan real-time langsung ke pemilik dari halaman detail kos, sementara Pencari maupun Pemilik dapat menghubungi Admin Support melalui tombol Bantuan di pojok kanan bawah.",
  },
  {
    q: "Bagaimana cara mendaftarkan properti kos baru untuk pemilik?",
    a: "Daftar atau masuk menggunakan akun Pemilik Kos, lalu buka menu Portal Pemilik dan pilih Tambah Kos Baru untuk mengisi spesifikasi kamar, titik koordinat lokasi, serta mengunggah foto kos.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleIndex = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section
      id="faq"
      className="pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-4" data-reveal="0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-base text-[#475569] leading-relaxed">
            Ringkasan hal penting seputar pencarian kampus, verifikasi properti, pengajuan booking, dan dukungan admin.
          </p>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-3" data-reveal="80">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            return (
              <div
                key={item.q}
                className="rounded-xl bg-[#FFFFFF] overflow-hidden"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleIndex(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#EFF6FF]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]"
                  >
                    <span className="text-[15px] font-semibold text-[#0F172A]">
                      {item.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[#EEF2F7] text-[#475569]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={panelId}
                    className="px-5 pb-4 pt-0.5 text-sm sm:text-base text-[#475569] leading-relaxed"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

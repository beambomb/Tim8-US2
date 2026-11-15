'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/features/chat/services/chatService';

const QUICK_FAQS = [
  {
    q: 'Bagaimana cara ajukan sewa kos?',
    a: 'Buka detail kos yang diinginkan, pilih tanggal mulai & durasi sewa, lalu kirim permohonan booking.',
  },
  {
    q: 'Berapa lama verifikasi properti pemilik?',
    a: 'Setelah draf diajukan di Portal Pemilik, admin memverifikasi kelengkapan data dan foto sebelum kos tayang.',
  },
];

export default function SupportButton() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [supportError, setSupportError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const handleOpenSupportChat = async () => {
    setConnecting(true);
    setSupportError(null);
    try {
      const res = await chatService.getSupportContact();
      const adminId = res?.data?.id || res?.data?._id;
      if (!adminId) {
        setSupportError('Kontak admin belum tersedia saat ini.');
        return;
      }
      setOpen(false);
      router.push(`/chat/${adminId}?topic=support`);
    } catch (err) {
      setSupportError(
        err.response?.data?.message ||
          'Gagal menghubungi layanan bantuan. Pastikan Anda terhubung ke server.'
      );
    } finally {
      setConnecting(false);
    }
  };

  const isAdmin = Boolean(!loading && isAuthenticated && user?.role === 'ADMIN');
  const canChatSupport = Boolean(
    !loading &&
      isAuthenticated &&
      (user?.role === 'PENCARI_KOS' || user?.role === 'PEMILIK_KOS')
  );

  return (
    <aside
      ref={containerRef}
      aria-label="Bantuan dan Dukungan"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3"
    >
      {open && (
        <div
          id="support-popover"
          role="dialog"
          aria-label="Pusat Bantuan CariKos"
          className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#FFFFFF] border border-[#CBD5E1] p-4 shadow-xl shadow-slate-900/10 text-[#0F172A] flex flex-col gap-3" // taste-skill-ignore: floating dialog overlay
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                Pusat Bantuan CariKos
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Butuh bantuan sewa atau verifikasi kos?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup Pusat Bantuan"
              className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {QUICK_FAQS.map((item) => (
              <div
                key={item.q}
                className="rounded-lg bg-[#F5F7FA] p-2.5 flex flex-col gap-0.5"
              >
                <p className="text-xs font-semibold text-[#0F172A]">{item.q}</p>
                <p className="text-xs text-[#475569] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {supportError && (
            <p className="text-xs text-[#991B1B] bg-[#FEF2F2] rounded-lg px-2.5 py-2">
              {supportError}
            </p>
          )}

          {canChatSupport ? (
            <button
              type="button"
              onClick={handleOpenSupportChat}
              disabled={connecting}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {connecting
                ? 'Menghubungkan ke Admin...'
                : 'Chat Admin Support Sekarang'}
            </button>
          ) : isAdmin ? (
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold text-center transition-colors"
            >
              Buka Kotak Pesan Masuk
            </Link>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold text-center transition-colors"
            >
              Masuk untuk Chat Admin Support
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setSupportError(null);
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-controls="support-popover"
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#FFFFFF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        title="Bantuan & Dukungan"
        aria-label="Bantuan & Dukungan"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 sm:w-7 sm:h-7"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.177 7.152.521 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm0 3.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </aside>
  );
}

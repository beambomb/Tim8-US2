'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useChat } from '@/features/chat/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

const formatInboxTime = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
};

const getRoleLabel = (role) => {
  if (role === 'PEMILIK_KOS') return 'Pemilik Kos';
  if (role === 'ADMIN') return 'Admin CariKos';
  return 'Pencari Kos';
};

export default function ChatInboxPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { inbox, isLoading, error, refetch } = useChat();

  const unreadConversationCount = inbox.filter((item) => {
    const lastMsg = item.lastMessage;
    return Boolean(lastMsg && !lastMsg.dibaca && !lastMsg.isSender);
  }).length;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7FA]">
      <Navbar />

      <main className="pt-20 pb-12 bg-[#F5F7FA] flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Pesan Masuk</h1>
              </div>

              {isAuthenticated && !isLoading && !error && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full bg-[#F5F7FA] text-[13px] font-medium text-[#475569] tabular-nums">
                    {inbox.length} percakapan
                  </span>
                  {unreadConversationCount > 0 && (
                    <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[13px] font-semibold text-[#1D4ED8] tabular-nums">
                      {unreadConversationCount} belum dibaca
                    </span>
                  )}
                </div>
              )}
            </div>

            {!authLoading && !isAuthenticated ? (
              <div className="p-8 rounded-xl bg-[#F5F7FA] text-center">
                <p className="text-base font-semibold text-[#0F172A]">
                  Masuk untuk melihat pesan Anda
                </p>
                <Link
                  href="/auth/login?redirect=/chat"
                  className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors"
                >
                  Masuk ke Akun
                </Link>
              </div>
            ) : authLoading || isLoading ? (
              <div className="space-y-3" aria-label="Memuat daftar percakapan">
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F7FA]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#E2E8F0] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-44 bg-[#E2E8F0] rounded" />
                      <div className="h-3.5 w-3/4 bg-[#E2E8F0] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-[#FEF2F2] text-center">
                <p className="text-sm font-medium text-[#B91C1C]">{error}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#FFFFFF] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            ) : inbox.length === 0 ? (
              <div className="p-10 rounded-xl bg-[#F5F7FA] text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-[#475569]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-base font-semibold text-[#0F172A]">
                  Belum ada obrolan
                </p>
                <p className="text-base mt-1 text-[#475569] max-w-md mx-auto">
                  Mulai hubungi pemilik kos dari halaman detail properti untuk menanyakan ketersediaan kamar atau jadwal survei.
                </p>
                <Link
                  href="/kos"
                  className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors"
                >
                  Jelajahi Katalog Kos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {inbox.map((item, idx) => {
                  const partner = item.partner || item.user || {};
                  const partnerId = partner.id || partner._id || item._id;
                  const partnerName =
                    partner.nama || partner.name || 'Pengguna CariKos';
                  const lastMsg = item.lastMessage;
                  const isUnread = Boolean(
                    lastMsg && !lastMsg.dibaca && !lastMsg.isSender
                  );
                  const kosName =
                    lastMsg?.kos?.nama || lastMsg?.kosId?.nama || null;
                  const kosId = lastMsg?.kos?._id || lastMsg?.kos?.id || null;
                  const targetHref = kosId
                    ? `/chat/${partnerId}?kosId=${kosId}`
                    : `/chat/${partnerId}`;

                  if (!partnerId) return null;

                  return (
                    <Link
                      key={partnerId || idx}
                      href={targetHref}
                      className={`flex items-center gap-4 p-4 sm:p-5 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2 ${
                        isUnread
                          ? 'bg-[#EFF6FF] hover:bg-[#DBEAFE]/60'
                          : 'bg-[#F5F7FA] hover:bg-[#EEF2F7]'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${
                          isUnread
                            ? 'bg-[#1D4ED8] text-white'
                            : 'bg-[#EEF2F7] text-[#1D4ED8]'
                        }`}
                        aria-hidden="true"
                      >
                        {partnerName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-sm sm:text-base font-semibold text-[#0F172A] truncate">
                              {partnerName}
                            </h2>
                            <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[13px] font-medium text-[#475569] shrink-0">
                              {getRoleLabel(partner.role)}
                            </span>
                          </div>

                          {lastMsg?.createdAt && (
                            <span className="text-[13px] text-[#475569] tabular-nums shrink-0">
                              {formatInboxTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>

                        {kosName && (
                          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1D4ED8] mb-1 truncate">
                            <svg
                              className="w-3.5 h-3.5 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            <span className="truncate">{kosName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <p
                            className={`text-sm truncate ${
                              isUnread
                                ? 'text-[#0F172A] font-medium'
                                : 'text-[#475569]'
                            }`}
                          >
                            {lastMsg?.isSender ? 'Anda: ' : ''}
                            {lastMsg?.pesan || lastMsg?.message || 'Mulai percakapan'}
                          </p>

                          {isUnread && (
                            <span className="bg-[#1D4ED8] text-white text-[13px] font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                              Belum dibaca
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

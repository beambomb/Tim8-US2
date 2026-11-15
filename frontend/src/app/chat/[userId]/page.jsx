'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useChat } from '@/features/chat/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

const formatRoleLabel = (role) => {
  if (role === 'PEMILIK_KOS') return 'Pemilik Kos';
  if (role === 'ADMIN') return 'Admin CariKos';
  if (role === 'PENCARI_KOS') return 'Pencari Kos';
  return null;
};

const formatCurrencyIDR = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const extractPartnerProfile = (
  messages,
  userId,
  currentUserId,
  kosContext,
  isSupportTopic = false
) => {
  for (const msg of messages) {
    const candidates = [msg.senderId, msg.receiverId, msg.sender, msg.receiver];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'object') {
        const candidateId = candidate._id || candidate.id;
        if (
          candidateId &&
          String(candidateId) === String(userId) &&
          String(candidateId) !== String(currentUserId)
        ) {
          return {
            id: candidateId,
            nama: candidate.nama || candidate.name || 'Mitra Obrolan',
            role: candidate.role || null,
          };
        }
      }
    }
  }

  if (kosContext?.ownerId && typeof kosContext.ownerId === 'object') {
    const ownerObjId = kosContext.ownerId._id || kosContext.ownerId.id;
    if (!ownerObjId || String(ownerObjId) === String(userId)) {
      return {
        id: ownerObjId || userId,
        nama: kosContext.ownerId.nama || 'Pemilik Kos',
        role: 'PEMILIK_KOS',
      };
    }
  }

  if (isSupportTopic) {
    return {
      id: userId,
      nama: 'Admin Support CariKos',
      role: 'ADMIN',
    };
  }

  return {
    id: userId,
    nama: 'Mitra Obrolan',
    role: null,
  };
};

const extractActiveKos = (kosContext, messages) => {
  if (kosContext && typeof kosContext === 'object' && kosContext.nama) {
    return kosContext;
  }
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const kosRef = messages[i]?.kosId;
    if (kosRef && typeof kosRef === 'object' && kosRef.nama) {
      return kosRef;
    }
  }
  return null;
};

function ChatConversationContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = params?.userId;
  const kosIdParam = searchParams?.get('kosId') || null;
  const isSupportTopic = searchParams?.get('topic') === 'support';

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const currentUserId = user?._id || user?.id;

  const {
    messages,
    kosContext,
    isLoading,
    isSending,
    error,
    isConnected,
    sendMessage,
  } = useChat(userId, kosIdParam);

  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const partnerProfile = extractPartnerProfile(
    messages,
    userId,
    currentUserId,
    kosContext,
    isSupportTopic
  );
  const activeKos = extractActiveKos(kosContext, messages);

  const partnerRoleLabel = formatRoleLabel(partnerProfile.role);
  const activeKosId = activeKos?._id || activeKos?.id || kosIdParam || null;
  const formattedKosPrice = formatCurrencyIDR(activeKos?.harga);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setSendError(null);
    setInputText('');

    const result = await sendMessage(trimmed, activeKosId);
    if (!result?.success) {
      setSendError(result?.error || 'Gagal mengirim pesan.');
      setInputText(trimmed);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-[#0F172A]">Masuk untuk Mengirim Pesan</h1>
          <p className="text-sm text-[#475569] mt-2">
            Anda perlu masuk ke akun CariKos untuk membuka percakapan ini.
          </p>
          <Link
            href={`/auth/login?redirect=/chat/${userId}${kosIdParam ? `?kosId=${kosIdParam}` : ''}`}
            className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors"
          >
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-[calc(100dvh-5rem)] flex flex-col gap-3">
      {/* Header Chat */}
      <header className="bg-[#FFFFFF] rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="p-2 rounded-xl hover:bg-[#EEF2F7] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
            aria-label="Kembali ke Inbox"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            className="w-10 h-10 rounded-full bg-[#EEF2F7] text-[#1D4ED8] flex items-center justify-center font-bold text-sm shrink-0"
            aria-hidden="true"
          >
            {partnerProfile.nama.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0F172A] truncate">
                {partnerProfile.nama}
              </h1>
              {partnerRoleLabel && (
                <span className="px-2 py-0.5 rounded-full bg-[#F5F7FA] text-[11px] font-medium text-[#475569] shrink-0">
                  {partnerRoleLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isConnected ? 'bg-[#047857]' : 'bg-[#D97706]'
                }`}
                aria-hidden="true"
              />
              <span className="text-xs text-[#475569]">
                {isConnected ? 'Terhubung Real-time' : 'Mode Standar (HTTP)'}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/chat"
          className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] shrink-0 whitespace-nowrap"
        >
          Semua Chat
        </Link>
      </header>

      {/* Kartu Konteks Kos */}
      {activeKos && (
        <div className="bg-[#FFFFFF] rounded-xl px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {activeKos.nama}
              </p>
              <p className="text-xs text-[#475569] truncate tabular-nums">
                {[
                  formattedKosPrice ? `${formattedKosPrice} / bulan` : null,
                  activeKos.lokasi || null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>

          {activeKosId && (
            <Link
              href={`/kos/${activeKosId}`}
              className="px-3 py-1.5 rounded-lg bg-[#F5F7FA] hover:bg-[#EEF2F7] text-xs font-semibold text-[#1D4ED8] shrink-0 transition-colors"
            >
              Lihat Kos
            </Link>
          )}
        </div>
      )}

      {/* Area Pesan */}
      <div className="flex-1 bg-[#EEF2F7] rounded-2xl p-4 sm:p-5 overflow-y-auto space-y-3">
        {authLoading || isLoading ? (
          <div className="space-y-3 py-4" aria-label="Memuat riwayat pesan">
            <div className="flex justify-start">
              <div className="h-12 w-56 rounded-2xl bg-[#FFFFFF]" />
            </div>
            <div className="flex justify-end">
              <div className="h-12 w-48 rounded-2xl bg-[#DBEAFE]" />
            </div>
            <div className="flex justify-start">
              <div className="h-16 w-64 rounded-2xl bg-[#FFFFFF]" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-[#B91C1C] bg-[#FEF2F2] rounded-xl">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm font-semibold text-[#0F172A]">
              Belum ada pesan dengan {partnerProfile.nama}
            </p>
            <p className="text-xs text-[#475569] mt-1">
              Kirim pesan pertama Anda melalui kolom di bawah untuk memulai percakapan.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderObjId =
              msg.senderId?._id ||
              msg.senderId?.id ||
              msg.senderId ||
              msg.sender?._id ||
              msg.sender;
            const isMe = Boolean(
              currentUserId &&
                senderObjId &&
                String(senderObjId) === String(currentUserId)
            );

            return (
              <div
                key={msg._id || idx}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? 'bg-[#1D4ED8] text-white rounded-br-sm'
                      : 'bg-[#FFFFFF] text-[#0F172A] rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {msg.pesan || msg.message}
                  </p>
                  <div
                    className={`text-[11px] mt-1 text-right tabular-nums ${
                      isMe ? 'text-[#EFF6FF]' : 'text-[#475569]'
                    }`}
                  >
                    {msg.isOptimistic
                      ? 'Mengirim...'
                      : msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Baru saja'}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Peringatan Error Kirim */}
      {sendError && (
        <div className="px-4 py-2 rounded-xl bg-[#FEF2F2] text-xs font-medium text-[#B91C1C] shrink-0">
          {sendError}
        </div>
      )}

      {/* Input Form Kirim Pesan */}
      <form
        onSubmit={handleSend}
        className="bg-[#FFFFFF] rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shrink-0"
      >
        <label htmlFor="chat-message-input" className="sr-only">
          Tulis pesan Anda
        </label>
        <input
          id="chat-message-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan Anda..."
          className="flex-1 bg-[#F5F7FA] border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#475569] focus:outline-none focus:border-[#1D4ED8]" // taste-skill-ignore: form field border
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#CBD5E1] disabled:text-[#475569] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
        >
          <span>{isSending ? 'Mengirim' : 'Kirim'}</span>
          <svg
            className="w-4 h-4 rotate-90"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default function ChatConversationPage() {
  return (
    <div className="min-h-dvh bg-[#F5F7FA]">
      <Suspense fallback={<div className="h-16 bg-[#FFFFFF]" />}>
        <Navbar />
      </Suspense>
      <main className="pt-16 min-h-dvh bg-[#F5F7FA]">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-[#FFFFFF] rounded-2xl p-6 space-y-4">
                <div className="h-10 w-56 bg-[#EEF2F7] rounded-xl" />
                <div className="h-72 bg-[#EEF2F7] rounded-2xl" />
              </div>
            </div>
          }
        >
          <ChatConversationContent />
        </Suspense>
      </main>
    </div>
  );
}

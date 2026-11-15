'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChat } from '@/features/chat/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

function ChatConversationContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const { user } = useAuth();
  const { messages, isLoading, error, isConnected, sendMessage } = useChat(userId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll ke pesan terbawah saat daftar pesan bertambah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    await sendMessage(textToSend);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header Chat */}
      <div className="bg-white border border-gray-200 rounded-t-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            title="Kembali ke Inbox"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            U
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Percakapan</h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-400'
                  }`}
              />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Terhubung (Real-time)' : 'Mode Standar (HTTP)'}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/chat"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Lihat Semua Chat
        </Link>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 bg-gray-50 border-x border-gray-200 p-4 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-2" />
            Memuat riwayat pesan...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <p>Belum ada pesan dengan pengguna ini.</p>
            <p className="text-xs text-gray-400 mt-1">Kirim pesan pertama Anda di bawah.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe =
              msg.senderId === user?._id ||
              msg.sender?._id === user?._id ||
              msg.sender === user?._id;

            return (
              <div
                key={msg._id || idx}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {msg.message || msg.pesan}
                  </p>
                  <div
                    className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'
                      }`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
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

      {/* Input Form Kirim Pesan */}
      <form
        onSubmit={handleSend}
        className="bg-white border border-gray-200 rounded-b-xl p-3 flex items-center gap-2 shadow-sm"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan Anda..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
        >
          <span>Kirim</span>
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default function ChatConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400 text-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-2" />
          <p>Menyiapkan ruang obrolan...</p>
        </div>
      }
    >
      <ChatConversationContent />
    </Suspense>
  );
}
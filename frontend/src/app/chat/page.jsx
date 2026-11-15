'use client';

import Link from 'next/link';
import { useChat } from '@/features/chat/hooks/useChat';
import { useAuth } from '@/context/AuthContext';

export default function ChatInboxPage() {
  const { user } = useAuth();
  const { inbox, isLoading, error } = useChat();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daftar obrolan dengan pemilik atau pencari kos
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-2"></div>
            <p>Memuat percakapan...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50">{error}</div>
        ) : inbox.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-base font-medium text-gray-600">Belum ada obrolan</p>
            <p className="text-sm mt-1 text-gray-400">
              Mulai hubungi pemilik kos dari halaman detail kos untuk memulai obrolan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {inbox.map((item) => {
              const partner =
                item.user?._id === user?._id || item.user?.id === user?._id
                  ? item.lastMessage?.sender
                  : item.user;

              const partnerId = partner?._id || partner?.id || item._id;
              const partnerName = partner?.nama || partner?.name || 'Pengguna CariKos';

              return (
                <Link
                  key={partnerId}
                  href={`/chat/${partnerId}`}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {partnerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">
                        {partnerName}
                      </h2>
                      {item.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {item.lastMessage?.message || item.lastMessage?.pesan || 'Mulai percakapan'}
                    </p>
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
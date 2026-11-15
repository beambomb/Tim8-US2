'use client';

import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/features/chat/hooks/useNotifications';

export default function NavbarNotifications() {
  const {
    notifications,
    unreadCount,
    latestNotification,
    clearLatestNotification,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#475569] hover:text-[#1D4ED8] hover:bg-[#EEF2F7] rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] focus-visible:outline-offset-2"
        aria-label="Notifikasi"
        aria-expanded={isOpen}
        aria-haspopup="true"
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center px-1.5 py-0.5 text-[11px] leading-none font-bold text-white bg-[#DC2626] rounded-full min-w-[18px] tabular-nums">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Toast Alert Real-Time */}
      {latestNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-[#FFFFFF] border border-[#CBD5E1] shadow-xl shadow-slate-900/10 rounded-2xl p-4 flex items-start gap-3" // taste-skill-ignore: floating notification toast
        >
          <svg
            className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#0F172A] truncate">
              {latestNotification.title || latestNotification.judul || 'Pemberitahuan Baru'}
            </h4>
            <p className="text-xs text-[#475569] mt-1 leading-relaxed">
              {latestNotification.message || latestNotification.pesan}
            </p>
          </div>
          <button
            type="button"
            onClick={() => clearLatestNotification?.()}
            aria-label="Tutup notifikasi"
            className="p-1 text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] rounded-lg transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Dropdown Riwayat Notifikasi */}
      {isOpen && (
        <div
          className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-20 sm:top-auto sm:mt-2 sm:w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden" // taste-skill-ignore: floating notification popover
        >
          <div className="px-4 py-3.5 bg-[#F5F7FA] flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[#0F172A] text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-semibold cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 space-y-2">
                <div className="h-10 bg-[#F5F7FA] rounded-xl" />
                <div className="h-10 bg-[#F5F7FA] rounded-xl" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#475569]">
                Belum ada notifikasi masuk.
              </div>
            ) : (
              notifications.map((item, idx) => {
                const itemId = item._id || item.id;
                const isRead = Boolean(item.isRead || item.dibaca);

                return (
                  <button
                    type="button"
                    key={itemId || idx}
                    onClick={() => {
                      if (!isRead && itemId) {
                        markAsRead(itemId);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8] ${
                      isRead
                        ? 'bg-[#FFFFFF] hover:bg-[#F5F7FA]'
                        : 'bg-[#EFF6FF] hover:bg-[#DBEAFE]/60'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isRead ? 'bg-transparent' : 'bg-[#1D4ED8]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0F172A]">
                        {item.title || item.judul || 'Notifikasi Sistem'}
                      </p>
                      <p className="text-xs text-[#475569] mt-0.5 line-clamp-2">
                        {item.message || item.pesan}
                      </p>
                      <span className="text-[11px] text-[#475569] mt-1 block tabular-nums">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Baru saja'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

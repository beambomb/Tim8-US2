'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { chatService } from '@/features/chat/services/chatService';

export default function NavbarNotifications() {
    const { unreadNotifications, latestNotification, clearLatestNotification } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await chatService.getNotifications();
            const notifList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
            setNotifications(notifList);

            const unread = notifList.filter((n) => !n.isRead && !n.dibaca).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Gagal memuat notifikasi:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (latestNotification) {
            setNotifications((prev) => [latestNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            const timer = setTimeout(() => {
                clearLatestNotification?.();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [latestNotification, clearLatestNotification]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await chatService.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true, dibaca: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Gagal menandai notifikasi dibaca:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await chatService.markAllNotificationsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true, dibaca: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Gagal menandai semua dibaca:', err);
        }
    };

    const totalUnread = Math.max(unreadCount, unreadNotifications || 0);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tombol Lonceng */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
                aria-label="Notifikasi"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {totalUnread > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[18px]">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Floating Toast Alert Real-Time */}
            {latestNotification && (
                <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-white border border-blue-200 shadow-xl rounded-xl p-4 flex items-start gap-3 animate-bounce">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                            {latestNotification.title || latestNotification.judul || 'Pemberitahuan Baru'}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                            {latestNotification.message || latestNotification.pesan}
                        </p>
                    </div>
                    <button
                        onClick={() => clearLatestNotification?.()}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Dropdown Riwayat Notifikasi */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
                        {totalUnread > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-gray-400">
                                Tidak ada notifikasi baru
                            </div>
                        ) : (
                            notifications.map((item, idx) => {
                                const isRead = item.isRead || item.dibaca;
                                return (
                                    <div
                                        key={item._id || idx}
                                        onClick={() => !isRead && handleMarkAsRead(item._id)}
                                        className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                                            }`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isRead ? 'bg-transparent' : 'bg-blue-600'
                                                }`}
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-900">
                                                {item.title || item.judul || 'Notifikasi Sistem'}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {item.message || item.pesan}
                                            </p>
                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString([], {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : 'Baru saja'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
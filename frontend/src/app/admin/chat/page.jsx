'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { Modal, roleLabel } from '@/components/admin/UI';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/features/admin/services/adminService';
import ChatInboxView from '@/features/chat/components/ChatInboxView';

export default function AdminChatInboxPage() {
  const { user } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const openUserPicker = async () => {
    setPickerOpen(true);
    setSearchQuery('');
    if (users.length > 0) return;

    setLoadingUsers(true);
    setUserError('');
    try {
      const res = await adminService.getUsers();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setUserError(
        err?.response?.data?.message || 'Gagal memuat daftar pengguna.'
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const currentUserId = String(user?._id || user?.id || '');
  const filteredUsers = users.filter((u) => {
    if (String(u._id) === currentUserId) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.nama?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (roleLabel[u.role] || u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Pesan Masuk"
      subtitle="Kelola pesan bantuan atau mulai obrolan dengan pengguna CariKos."
      headerAction={
        <button
          type="button"
          onClick={openUserPicker}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
        >
          <span>Mulai Chat Baru</span>
        </button>
      }
    >
      <ChatInboxView
        basePath="/admin/chat"
        embedded
        emptyDescription="Belum ada pesan masuk. Klik 'Mulai Chat Baru' untuk menghubungi pengguna atau pemilik kos."
        emptyActionHref={null}
        emptyActionLabel={null}
      />

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Mulai Obrolan dengan Pengguna"
        size="md"
      >
        <div className="space-y-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau role pengguna..."
            aria-label="Cari pengguna untuk chat"
            className="w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />

          {userError && (
            <p className="rounded-xl bg-[#FFEDEA] p-3 text-xs font-medium text-[#831C1E]">
              {userError}
            </p>
          )}

          {loadingUsers ? (
            <p className="py-6 text-center text-sm text-[#475569]">
              Memuat daftar pengguna...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#475569]">
              Tidak ada pengguna yang cocok.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
              {filteredUsers.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">
                      {u.nama}
                    </p>
                    <p className="truncate text-xs text-[#475569]">
                      {u.email} · {roleLabel[u.role] || u.role}
                    </p>
                  </div>
                  <Link
                    href={`/admin/chat/${u._id}`}
                    onClick={() => setPickerOpen(false)}
                    className="shrink-0 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors"
                  >
                    Chat
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </AdminShell>
  );
}

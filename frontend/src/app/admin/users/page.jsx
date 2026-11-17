"use client";

import { useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RefreshButton from "@/components/ui/RefreshButton";
import {
  Panel,
  Loading,
  Alert,
  Button,
  roleLabel,
} from "@/components/admin/UI";
import { useAuth } from "@/context/AuthContext";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";

function formatDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Users() {
  const { user } = useAuth();
  const {
    users,
    filtered,
    query,
    setQuery,
    loading,
    busy,
    error,
    message,
    refetch,
    updateRole,
    deleteUser,
  } = useAdminUsers();

  const [pendingAction, setPendingAction] = useState(null);

  const handleRoleChange = (targetUser, nextRole) => {
    if (nextRole === targetUser.role) return;
    setPendingAction({
      type: "role",
      user: targetUser,
      nextRole,
    });
  };

  const handleDeleteUser = (targetUser) => {
    setPendingAction({
      type: "delete",
      user: targetUser,
    });
  };

  const executePendingAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.type === "role") {
      await updateRole(pendingAction.user, pendingAction.nextRole);
    } else if (pendingAction.type === "delete") {
      await deleteUser(pendingAction.user);
    }
    setPendingAction(null);
  };

  return (
    <AdminShell
      title="Manajemen Pengguna"
      subtitle="Cari akun dan ubah peran pengguna yang terdaftar."
      headerAction={
        <RefreshButton
          onClick={refetch}
          isLoading={loading}
          label="Muat ulang daftar pengguna"
          variant="app"
        />
      }
    >
      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau email..."
          aria-label="Cari pengguna"
          className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] w-full sm:w-80 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
        />
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-medium text-[#475569]">
                <th className="py-3 pr-4 font-medium">Pengguna</th>
                <th className="py-3 pr-4 font-medium">Nomor HP</th>
                <th className="py-3 pr-4 font-medium">Terdaftar</th>
                <th className="py-3 pr-4 font-medium">Role</th>
                <th className="py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf =
                  String(u._id) === String(user?._id || user?.id);
                const registeredAt = formatDate(u.createdAt);

                return (
                  <tr
                    key={u._id}
                    className="border-b border-[#F1F5F9] last:border-b-0"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-[#0F172A]">{u.nama}</p>
                      <p className="text-[#475569]">{u.email}</p>
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">
                      {u.noHp ? (
                        <span className="tabular-nums text-[#0F172A]">
                          {u.noHp}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap">
                      {registeredAt ? (
                        <span className="tabular-nums text-[#475569]">
                          {registeredAt}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        aria-label={`Role ${u.nama}`}
                        value={u.role}
                        disabled={busy === u._id || isSelf}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-sm text-[#0F172A] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:bg-[#F5F7FA] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
                      >
                        <option value="PENCARI_KOS">Pencari Kos</option>
                        <option value="PEMILIK_KOS">Pemilik Kos</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                      {isSelf && (
                        <p className="text-xs text-[#475569] mt-1">Akun Anda</p>
                      )}
                    </td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        {!isSelf && (
                          <Link
                            href={`/admin/chat/${u._id}`}
                            aria-label={`Chat ${u.nama}`}
                            className="inline-flex items-center justify-center rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors"
                          >
                            Chat
                          </Link>
                        )}
                        <Button
                          variant="dangerOutline"
                          size="sm"
                          aria-label={`Hapus ${u.nama}`}
                          disabled={busy === u._id || isSelf}
                          onClick={() => handleDeleteUser(u)}
                        >
                          {busy === u._id ? "Menghapus..." : "Hapus"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length && (
            <p className="text-center py-8 text-sm text-[#475569]">
              Tidak ada pengguna yang cocok.
            </p>
          )}

          <p className="text-xs text-[#475569] tabular-nums mt-4">
            Menampilkan {filtered.length} dari {users.length} akun.
          </p>
        </Panel>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.type === "delete"
            ? "Hapus Pengguna"
            : "Ubah Peran Pengguna"
        }
        message={
          pendingAction?.type === "delete"
            ? `Hapus pengguna ${pendingAction.user.nama} (${pendingAction.user.email})?\n\nSeluruh riwayat chat, notifikasi, booking, ulasan, favorit, dan properti kos milik pengguna ini juga akan dihapus permanen.`
            : pendingAction?.type === "role"
              ? `Ubah role ${pendingAction.user.nama} menjadi ${roleLabel[pendingAction.nextRole]}?`
              : ""
        }
        confirmLabel={
          pendingAction?.type === "delete" ? "Ya, Hapus Pengguna" : "Ya, Ubah Role"
        }
        cancelLabel="Batal"
        variant={pendingAction?.type === "delete" ? "danger" : "primary"}
        isLoading={Boolean(pendingAction && busy === pendingAction.user._id)}
        onConfirm={executePendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </AdminShell>
  );
}

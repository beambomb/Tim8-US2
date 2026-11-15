"use client";

import AdminShell from "@/components/admin/AdminShell";
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
  } = useAdminUsers();

  const handleRoleChange = async (targetUser, nextRole) => {
    if (nextRole === targetUser.role) return;
    if (
      !window.confirm(
        `Ubah role ${targetUser.nama} menjadi ${roleLabel[nextRole]}?`
      )
    ) {
      return;
    }
    await updateRole(targetUser, nextRole);
  };

  return (
    <AdminShell
      title="Manajemen Pengguna"
      subtitle="Cari akun dan ubah peran pengguna yang terdaftar."
    >
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau email..."
          aria-label="Cari pengguna"
          className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] w-full sm:w-80 outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-colors"
        />
        <Button variant="outline" onClick={refetch} disabled={loading}>
          Muat ulang
        </Button>
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
                <th className="py-3 font-medium">Role</th>
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
                    <td className="py-4">
                      <select
                        aria-label={`Role ${u.nama}`}
                        value={u.role}
                        disabled={busy === u._id || isSelf}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-sm text-[#0F172A] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 disabled:bg-[#F5F7FA] disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors"
                      >
                        <option value="PENCARI_KOS">Pencari Kos</option>
                        <option value="PEMILIK_KOS">Pemilik Kos</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                      {isSelf && (
                        <p className="text-xs text-[#475569] mt-1">Akun Anda</p>
                      )}
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
    </AdminShell>
  );
}

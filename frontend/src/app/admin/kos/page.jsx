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
  Badge,
  Button,
  Modal,
} from "@/components/admin/UI";
import { useAdminKos } from "@/features/admin/hooks/useAdminKos";

const STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "Approved", label: "Disetujui" },
  { key: "Pending", label: "Menunggu" },
  { key: "Rejected", label: "Ditolak" },
];

function getVerificationMeta(status) {
  if (status === "Approved") {
    return { label: "Disetujui", variant: "success" };
  }
  if (status === "Rejected") {
    return { label: "Ditolak", variant: "danger" };
  }
  return { label: "Menunggu", variant: "warning" };
}

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

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function AdminKosPage() {
  const {
    kosList,
    filtered,
    counts,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    tipeFilter,
    setTipeFilter,
    loading,
    deletingId,
    error,
    actionMessage,
    selected,
    refetch,
    openDetail,
    closeDetail,
    deleteKos,
  } = useAdminKos();

  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleDeleteKos = (targetKos) => {
    if (!targetKos) return;
    setConfirmTarget(targetKos);
  };

  const executeDeleteKos = async () => {
    if (!confirmTarget) return;
    await deleteKos(confirmTarget);
    setConfirmTarget(null);
  };

  const detailMeta = getVerificationMeta(selected?.statusVerifikasi);
  const detailCreatedAt = formatDate(selected?.createdAt);
  const selectedOwnerId = selected?.ownerId?._id || selected?.ownerId?.id;
  const hasCoordinates =
    selected?.latitude != null && selected?.longitude != null;

  return (
    <AdminShell
      title="Semua Kos Terdaftar"
      subtitle="Pantau seluruh properti kos yang terdaftar beserta status verifikasi, harga, dan pemiliknya."
      headerAction={
        <RefreshButton
          onClick={refetch}
          isLoading={loading}
          label="Muat ulang daftar kos"
          variant="app"
        />
      }
    >
      <div className="flex flex-col gap-4 mb-5">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter status verifikasi kos"
        >
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#EEF2F7] text-[#475569]"
                  }`}
                >
                  {counts[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama kos, lokasi, atau pemilik..."
            aria-label="Cari kos terdaftar"
            className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] w-full sm:w-80 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
          />
          <select
            aria-label="Filter tipe kos"
            value={tipeFilter}
            onChange={(e) => setTipeFilter(e.target.value)}
            className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#0F172A] w-full sm:w-44 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="Putra">Putra</option>
            <option value="Putri">Putri</option>
            <option value="Campur">Campur</option>
          </select>
          <span className="text-xs text-[#475569] tabular-nums sm:ml-auto">
            Menampilkan {filtered.length} dari {kosList.length} kos
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-4">
          <Alert type="success">{actionMessage}</Alert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Panel className="text-center py-10">
          <p className="text-sm font-medium text-[#0F172A]">
            {kosList.length === 0
              ? "Belum ada kos yang terdaftar di sistem."
              : "Tidak ada kos yang sesuai dengan filter pencarian."}
          </p>
          {(query || statusFilter !== "ALL" || tipeFilter !== "ALL") && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("ALL");
                  setTipeFilter("ALL");
                }}
              >
                Reset filter
              </Button>
            </div>
          )}
        </Panel>
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#475569]">
                <th className="py-3.5 px-5 font-medium">Properti Kos</th>
                <th className="py-3.5 px-4 font-medium">Pemilik</th>
                <th className="py-3.5 px-4 font-medium">Tipe</th>
                <th className="py-3.5 px-4 font-medium">Harga/bulan</th>
                <th className="py-3.5 px-4 font-medium">Kamar</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const statusMeta = getVerificationMeta(item.statusVerifikasi);
                const availableRooms = Number(item.jumlahKamarTersedia ?? 0);
                const totalRooms = Number(item.jumlahKamar ?? 0);

                return (
                  <tr
                    key={item._id}
                    className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]/70 transition-colors"
                  >
                    <td className="py-4 px-5 max-w-xs">
                      <p className="font-semibold text-[#0F172A] truncate">
                        {item.nama || "Tanpa Nama"}
                      </p>
                      <p className="text-xs text-[#475569] truncate mt-0.5">
                        {item.lokasi || "-"}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#0F172A]">
                        {item.ownerId?.nama || "-"}
                      </p>
                      <p className="text-xs text-[#475569]">
                        {item.ownerId?.email || "-"}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant="neutral">{item.tipe || "-"}</Badge>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#0F172A] tabular-nums">
                      {formatPrice(item.harga)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap tabular-nums">
                      <span
                        className={
                          availableRooms > 0
                            ? "text-[#0F172A] font-medium"
                            : "text-[#B45309] font-medium"
                        }
                      >
                        {availableRooms}/{totalRooms}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant={statusMeta.variant}>
                        {statusMeta.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetail(item)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      <Modal
        open={!!selected}
        onClose={closeDetail}
        title={selected?.nama || "Detail Properti Kos"}
      >
        {selected && (
          <>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={detailMeta.variant}>{detailMeta.label}</Badge>
              {selected.tipe && <Badge variant="neutral">{selected.tipe}</Badge>}
            </div>

            <p className="mt-2 text-sm text-[#475569]">{selected.lokasi}</p>

            {selected.statusVerifikasi === "Rejected" &&
              selected.alasanPenolakan && (
                <div className="mt-4">
                  <Alert>
                    Alasan penolakan: {selected.alasanPenolakan}
                  </Alert>
                </div>
              )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] p-4 text-sm">
              <div>
                <dt className="text-xs text-[#475569]">Harga per bulan</dt>
                <dd className="mt-0.5 font-semibold text-[#0F172A] tabular-nums">
                  {formatPrice(selected.harga)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#475569]">Ketersediaan kamar</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                  {selected.jumlahKamarTersedia ?? 0} dari{" "}
                  {selected.jumlahKamar ?? 0} kamar
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#475569]">Pemilik</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A]">
                  {selected.ownerId?.nama || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#475569]">Kontak pemilik</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A]">
                  {selected.ownerId?.email || "-"}
                  {selected.ownerId?.noHp ? ` (${selected.ownerId.noHp})` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#475569]">Terdaftar pada</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                  {detailCreatedAt || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#475569]">Koordinat</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                  {hasCoordinates
                    ? `${selected.latitude}, ${selected.longitude}`
                    : "-"}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-sm text-[#0F172A]">
              <span className="font-semibold">Fasilitas:</span>{" "}
              {selected.fasilitas?.length ? (
                <span className="text-[#475569]">
                  {selected.fasilitas.join(", ")}
                </span>
              ) : (
                <span className="text-[#64748B]">Tidak dicantumkan</span>
              )}
            </p>

            <h3 className="text-sm font-semibold text-[#0F172A] mt-5">
              Foto properti
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {selected.fotoUrls?.length ? (
                selected.fotoUrls.map((url, idx) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={idx}
                    className="block rounded-lg overflow-hidden border border-[#E2E8F0]"
                  >
                    <img
                      src={url}
                      alt={`Foto ${selected.nama || "kos"} ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-32 object-cover"
                    />
                  </a>
                ))
              ) : (
                <p className="text-sm text-[#64748B]">Tidak ada foto.</p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 mt-6">
              {selectedOwnerId && (
                <Link
                  href={`/admin/chat/${selectedOwnerId}?kosId=${selected._id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#EEF2F7] transition-colors"
                >
                  Chat pemilik
                </Link>
              )}
              {selected.statusVerifikasi === "Pending" && (
                <Link
                  href="/admin/submissions"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Tinjau pengajuan
                </Link>
              )}
              {selected.statusVerifikasi === "Approved" && (
                <Link
                  href={`/kos/${selected._id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Lihat halaman publik
                </Link>
              )}
              <Button
                variant="danger"
                disabled={deletingId === selected._id}
                onClick={() => handleDeleteKos(selected)}
              >
                {deletingId === selected._id ? "Menghapus..." : "Hapus kos"}
              </Button>
              <Button variant="outline" onClick={closeDetail}>
                Tutup
              </Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        title="Hapus Properti Kos"
        message={
          confirmTarget
            ? `Hapus properti "${confirmTarget.nama}"?\n\nSeluruh booking, ulasan, favorit, notifikasi, dan foto Cloudinary milik kos ini juga akan dihapus permanen.`
            : ""
        }
        confirmLabel="Ya, Hapus Permanen"
        cancelLabel="Batal"
        variant="danger"
        isLoading={Boolean(confirmTarget && deletingId === confirmTarget._id)}
        onConfirm={executeDeleteKos}
        onCancel={() => setConfirmTarget(null)}
      />
    </AdminShell>
  );
}

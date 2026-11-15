"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import RefreshButton from "@/components/ui/RefreshButton";
import {
  Panel,
  Loading,
  Alert,
  Button,
  Badge,
  Modal,
} from "@/components/admin/UI";
import { useAdminSubmissions } from "@/features/admin/hooks/useAdminSubmissions";

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

export default function Submissions() {
  const {
    submissions,
    isLoading,
    error,
    actionLoadingId,
    selected,
    detailLoading,
    actionError,
    refetch,
    openDetail,
    closeDetail,
    approveKos,
    rejectKos,
  } = useAdminSubmissions();

  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const handleOpen = (id) => {
    setReason("");
    setMessage("");
    openDetail(id);
  };

  const handleClose = () => {
    setReason("");
    closeDetail();
  };

  const handleDecision = async (type) => {
    if (!selected) return;
    if (
      type === "approve" &&
      !window.confirm(`Setujui kos ${selected.nama}?`)
    ) {
      return;
    }

    const result =
      type === "approve"
        ? await approveKos(selected._id)
        : await rejectKos(selected._id, reason);

    if (result.success) {
      setReason("");
      setMessage(
        type === "approve"
          ? "Pengajuan berhasil disetujui."
          : "Pengajuan berhasil ditolak."
      );
    }
  };

  const detailCreatedAt = formatDate(selected?.createdAt);
  const hasCoordinates =
    selected?.latitude != null && selected?.longitude != null;

  return (
    <AdminShell
      title="Verifikasi Pengajuan Kos"
      subtitle="Periksa informasi kos sebelum menerima atau menolak pengajuan."
      headerAction={
        <RefreshButton
          onClick={refetch}
          isLoading={isLoading}
          label="Muat ulang pengajuan"
          variant="app"
        />
      }
    >
      <p className="text-sm text-[#475569] tabular-nums mb-4">
        {submissions.length} pengajuan menunggu
      </p>

      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      {(error || (!selected && actionError)) && (
        <div className="mb-4">
          <Alert>{error || actionError}</Alert>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : submissions.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#475569]">
            Belum ada pengajuan kos yang menunggu verifikasi.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4">
          {submissions.map((k) => {
            const submittedAt = formatDate(k.createdAt);
            return (
              <Panel key={k._id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Badge variant="warning">Pending</Badge>
                    <h2 className="text-lg font-semibold text-[#0F172A] mt-3">
                      {k.nama}
                    </h2>
                    <p className="text-sm text-[#475569] mt-1">
                      {k.lokasi} · {k.tipe}
                    </p>
                    <p className="text-sm text-[#475569] mt-1">
                      Pemilik:{" "}
                      {k.ownerId?.nama || (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </p>
                    {submittedAt && (
                      <p className="text-xs text-[#475569] tabular-nums mt-1">
                        Diajukan: {submittedAt}
                      </p>
                    )}
                    <p className="text-base font-semibold text-[#0F172A] tabular-nums mt-2">
                      {formatPrice(k.harga)}/bulan
                    </p>
                  </div>
                  <Button onClick={() => handleOpen(k._id)}>
                    Tinjau pengajuan
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal
        open={detailLoading || !!selected}
        onClose={handleClose}
        title={selected?.nama || "Memuat detail pengajuan"}
      >
        {detailLoading ? (
          <div className="mt-4">
            <Loading label="Memuat detail pengajuan..." />
          </div>
        ) : (
          selected && (
            <>
              <p className="mt-1.5 text-sm text-[#475569]">{selected.lokasi}</p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FA] p-4 text-sm">
                <div>
                  <dt className="text-xs text-[#475569]">Harga per bulan</dt>
                  <dd className="mt-0.5 font-semibold text-[#0F172A] tabular-nums">
                    {formatPrice(selected.harga)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Tipe kos</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A]">
                    {selected.tipe || (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Jumlah kamar</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                    {selected.jumlahKamar ?? (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Kamar tersedia</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                    {selected.jumlahKamarTersedia ?? (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Pemilik</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A]">
                    {selected.ownerId?.nama || (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Email pemilik</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A]">
                    {selected.ownerId?.email || (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Tanggal pengajuan</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                    {detailCreatedAt || (
                      <span className="text-[#64748B]">-</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#475569]">Koordinat</dt>
                  <dd className="mt-0.5 font-medium text-[#0F172A] tabular-nums">
                    {hasCoordinates ? (
                      `${selected.latitude}, ${selected.longitude}`
                    ) : (
                      <span className="text-[#64748B]">-</span>
                    )}
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
                  selected.fotoUrls.map((url, i) => (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={i}
                      className="block rounded-lg overflow-hidden border border-[#E2E8F0]"
                    >
                      <img
                        src={url}
                        alt={`Foto kos ${i + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-[#64748B]">Tidak ada foto.</p>
                )}
              </div>

              <label className="block text-sm font-semibold text-[#0F172A] mt-6">
                Alasan penolakan
                <textarea
                  className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-3 text-sm font-normal text-[#0F172A] placeholder:text-[#64748B] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Wajib diisi jika pengajuan ditolak"
                />
              </label>

              {actionError && (
                <div className="mt-3">
                  <Alert>{actionError}</Alert>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 mt-5">
                <Button variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <Button
                  variant="danger"
                  disabled={!!actionLoadingId || !reason.trim()}
                  onClick={() => handleDecision("reject")}
                >
                  Tolak pengajuan
                </Button>
                <Button
                  disabled={!!actionLoadingId}
                  onClick={() => handleDecision("approve")}
                >
                  Setujui kos
                </Button>
              </div>
            </>
          )
        )}
      </Modal>
    </AdminShell>
  );
}

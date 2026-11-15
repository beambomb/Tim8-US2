'use client';

import { useRouter } from 'next/navigation';
import { useOwnerKosForm } from '../hooks/useOwnerKosForm';

const AVAILABLE_FACILITIES = [
  'WiFi Cepat',
  'AC',
  'Kamar Mandi Dalam',
  'Kasur Springbed',
  'Lemari Pakaian',
  'Meja Belajar',
  'Parkir Motor',
  'Parkir Mobil',
  'Dapur Bersama',
  'CCTV 24 Jam',
  'Keamanan 24 Jam',
  'Mesin Cuci Bersama',
  'Water Heater',
  'Listrik Termasuk',
];

const PRESET_COORDINATES = [
  { name: 'Pogung (Dekat UGM)', lat: -7.766, lng: 110.374 },
  { name: 'Karangmalang (Dekat UNY)', lat: -7.774, lng: 110.386 },
  { name: 'Seturan (Dekat UPN)', lat: -7.761, lng: 110.408 },
  { name: 'Kaliurang (Dekat UII)', lat: -7.687, lng: 110.413 },
];

export default function OwnerKosForm({
  kosId = null,
  initialData = null,
  isEdit = false,
  controller = null,
}) {
  const router = useRouter();
  const internalForm = useOwnerKosForm({
    kosId,
    initialData,
    isEdit,
    skipInitialFetch: Boolean(controller),
  });
  const form = controller || internalForm;

  const {
    formData,
    pendingFiles,
    isDragging,
    isSubmitting,
    isUploading,
    formError,
    formSuccess,
    setFormError,
    handleChange,
    handleFacilityToggle,
    handlePresetCoords,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemovePending,
    handleRemoveSavedPhoto,
    handleSubmit,
  } = form;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-[#0F172A]">
      {/* Alert Notices */}
      {formError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-[#FFEDEA] border border-[#FECACA] text-[#831C1E] text-xs flex items-center justify-between gap-3"
        >
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            aria-label="Tutup pesan galat"
            className="p-1 rounded hover:bg-[#FECACA]/50 text-[#831C1E] transition-colors cursor-pointer shrink-0"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {formSuccess && (
        <div
          role="status"
          className="p-4 rounded-lg bg-[#DCFAE5] border border-[#A7F3D0] text-[#04250E] text-xs flex items-center justify-between"
        >
          <span>{formSuccess} Mengalihkan ke inventaris...</span>
        </div>
      )}

      {/* Section 1: Informasi Dasar */}
      <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
          Informasi utama properti
        </h2>

        {/* Nama Kos */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kos-nama" className="text-xs font-medium text-[#475569]">
            Nama kos <span className="text-[#C4242A]">*</span>
          </label>
          <input
            id="kos-nama"
            type="text"
            required
            placeholder="Contoh: Kos Pogung Asri Jaya"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Grid: Tipe Kos & Harga Sewa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-tipe" className="text-xs font-medium text-[#475569]">
              Tipe kos <span className="text-[#C4242A]">*</span>
            </label>
            <select
              id="kos-tipe"
              value={formData.tipe}
              onChange={(e) => handleChange('tipe', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
              <option value="Campur">Campur</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-harga" className="text-xs font-medium text-[#475569]">
              Harga sewa per bulan (Rp) <span className="text-[#C4242A]">*</span>
            </label>
            <input
              id="kos-harga"
              type="number"
              required
              min="1"
              step="any"
              placeholder="Contoh: 950000"
              value={formData.harga}
              onChange={(e) => handleChange('harga', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        {/* Grid: Kapasitas Kamar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-kamar-total" className="text-xs font-medium text-[#475569]">
              Total jumlah kamar kapasitas <span className="text-[#C4242A]">*</span>
            </label>
            <input
              id="kos-kamar-total"
              type="number"
              required
              min="1"
              placeholder="Contoh: 10"
              value={formData.jumlahKamar}
              onChange={(e) => handleChange('jumlahKamar', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kos-kamar-tersedia" className="text-xs font-medium text-[#475569]">
                Kamar siap huni saat ini
              </label>
              <input
                id="kos-kamar-tersedia"
                type="number"
                min="0"
                max={formData.jumlahKamar || 999}
                placeholder="Jumlah kamar kosong"
                value={formData.jumlahKamarTersedia}
                onChange={(e) => handleChange('jumlahKamarTersedia', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Lokasi & Geospasial */}
      <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 flex flex-col gap-5">
        <h2 className="text-base font-semibold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
          Lokasi dan koordinat peta
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="kos-lokasi" className="text-xs font-medium text-[#475569]">
            Alamat lengkap atau area kos <span className="text-[#C4242A]">*</span>
          </label>
          <input
            id="kos-lokasi"
            type="text"
            required
            placeholder="Contoh: Jl. Pogung Dalangan No. 45, Mlati, Sleman, Yogyakarta"
            value={formData.lokasi}
            onChange={(e) => handleChange('lokasi', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Quick coordinate presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[#475569]">
            Gunakan preset koordinat cepat (Yogyakarta):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COORDINATES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetCoords(p)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-lat" className="text-xs font-medium text-[#475569]">
              Latitude <span className="text-[#C4242A]">*</span>
            </label>
            <input
              id="kos-lat"
              type="number"
              step="any"
              required
              placeholder="-7.766000"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-lng" className="text-xs font-medium text-[#475569]">
              Longitude <span className="text-[#C4242A]">*</span>
            </label>
            <input
              id="kos-lng"
              type="number"
              step="any"
              required
              placeholder="110.374000"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#CBD5E1] text-sm text-[#0F172A] tabular-nums placeholder-[#64748B] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Fasilitas Kos */}
      <div className="rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
          Daftar fasilitas tersedia
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {AVAILABLE_FACILITIES.map((facility) => {
            const isChecked = formData.fasilitas.includes(facility);
            return (
              <label
                key={facility}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  isChecked
                    ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE] font-medium'
                    : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility)}
                  className="w-3.5 h-3.5 rounded border-[#CBD5E1] bg-white text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)]"
                />
                <span className="truncate">{facility}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Foto Properti (Multi-Image Dropzone with Drag & Drop) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl bg-[#FFFFFF] border p-6 flex flex-col gap-4 transition-colors ${
          isDragging ? 'border-[var(--accent)] bg-[#EFF6FF]/40' : 'border-[#E2E8F0]'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">
              Galeri foto properti
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Klik atau seret hingga 5 foto berformat JPG, PNG, atau WebP (maks. 5 MB per file)
            </p>
          </div>
          <span className="text-xs font-medium text-[#0F172A] tabular-nums shrink-0 ml-3">
            {formData.fotoUrls.length + pendingFiles.length} / 5 foto
          </span>
        </div>

        {/* Existing & Pending Image Previews Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Saved URLs */}
          {formData.fotoUrls.map((url, idx) => (
            <div
              key={`saved-${idx}`}
              className="relative aspect-video rounded-lg overflow-hidden bg-[#EEF2F7] border border-[#E2E8F0] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto kos ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveSavedPhoto(url)}
                aria-label={`Hapus foto kos ${idx + 1}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#C4242A] text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                title="Hapus foto ini"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Pending Local Files */}
          {pendingFiles.map((p, idx) => (
            <div
              key={`pending-${idx}`}
              className="relative aspect-video rounded-lg overflow-hidden bg-[#EEF2F7] border border-[var(--accent)] group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt={`Preview baru ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#0F172A] text-white">
                Siap Unggah
              </span>
              <button
                type="button"
                onClick={() => handleRemovePending(idx)}
                aria-label={`Batalkan foto baru ${idx + 1}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#C4242A] text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                title="Batalkan foto ini"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Upload Button & Drag-and-Drop Tile */}
          {formData.fotoUrls.length + pendingFiles.length < 5 && (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors px-2 text-center ${
                isDragging
                  ? 'border-[var(--accent)] bg-[#EFF6FF] text-[var(--accent)]'
                  : 'border-[#CBD5E1] hover:border-[var(--accent)] bg-[#F5F7FA] text-[#475569] hover:text-[var(--accent)]'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[11px] font-medium">
                {isDragging ? 'Lepas foto di sini' : 'Tambah atau Seret Foto'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/owner/kos')}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] text-[#0F172A] hover:bg-[#EEF2F7] border border-[#CBD5E1] transition-colors cursor-pointer disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting && (
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          <span>
            {isUploading
              ? 'Mengunggah Foto...'
              : isSubmitting
              ? 'Menyimpan...'
              : isEdit
              ? 'Simpan Perubahan Kos'
              : 'Daftarkan & Ajukan Verifikasi'}
          </span>
        </button>
      </div>
    </form>
  );
}

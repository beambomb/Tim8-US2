'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ownerService } from '../services/ownerService';

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

export default function OwnerKosForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Form Fields State
  const [formData, setFormData] = useState({
    nama: initialData?.nama || '',
    harga: initialData?.harga || '',
    lokasi: initialData?.lokasi || '',
    latitude: initialData?.latitude !== undefined ? initialData.latitude : -7.766,
    longitude: initialData?.longitude !== undefined ? initialData.longitude : 110.374,
    tipe: initialData?.tipe || 'Putra',
    jumlahKamar: initialData?.jumlahKamar || '',
    jumlahKamarTersedia:
      initialData?.jumlahKamarTersedia !== undefined ? initialData.jumlahKamarTersedia : '',
    fasilitas: initialData?.fasilitas || [],
    fotoUrls: initialData?.fotoUrls || [],
  });

  // Local pending file uploads: { file, previewUrl }
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Facility toggle handler
  const handleFacilityToggle = (facilityName) => {
    setFormData((prev) => {
      const exists = prev.fasilitas.includes(facilityName);
      return {
        ...prev,
        fasilitas: exists
          ? prev.fasilitas.filter((f) => f !== facilityName)
          : [...prev.fasilitas, facilityName],
      };
    });
  };

  // Preset coordinate selector
  const handlePresetCoords = (preset) => {
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
  };

  // Dropzone file selection handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalAllowed = 5 - (formData.fotoUrls.length + pendingFiles.length);
    if (totalAllowed <= 0) {
      setFormError('Maksimal foto yang diperbolehkan adalah 5 foto.');
      return;
    }

    const validFiles = files.slice(0, totalAllowed).filter((file) => {
      if (!file.type.startsWith('image/')) {
        setFormError('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran setiap file gambar maksimal 5 MB.');
        return false;
      }
      return true;
    });

    const newPending = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingFiles((prev) => [...prev, ...newPending]);
    setFormError(null);
  };

  // Remove local pending file preview
  const handleRemovePending = (index) => {
    setPendingFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Remove already saved photo URL
  const handleRemoveSavedPhoto = (urlToRemove) => {
    setFormData((prev) => ({
      ...prev,
      fotoUrls: prev.fotoUrls.filter((url) => url !== urlToRemove),
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Frontend Validations
    if (!formData.nama.trim()) {
      setFormError('Nama kos wajib diisi.');
      return;
    }
    if (!formData.harga || Number(formData.harga) <= 0) {
      setFormError('Harga sewa bulanan harus berupa angka valid di atas 0.');
      return;
    }
    if (!formData.lokasi.trim()) {
      setFormError('Alamat lokasi kos wajib diisi.');
      return;
    }
    if (formData.latitude === '' || formData.longitude === '') {
      setFormError('Koordinat latitude dan longitude wajib diisi.');
      return;
    }
    if (!formData.jumlahKamar || Number(formData.jumlahKamar) <= 0) {
      setFormError('Jumlah kamar total harus berupa angka minimal 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalFotoUrls = [...formData.fotoUrls];

      // 1. Upload pending files if any
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        const filesToUpload = pendingFiles.map((p) => p.file);
        try {
          const uploadRes = await ownerService.uploadImages(filesToUpload);
          if (uploadRes.data?.urls) {
            finalFotoUrls = [...finalFotoUrls, ...uploadRes.data.urls];
          }
        } catch (uploadErr) {
          console.warn('Upload Cloudinary gagal, melanjutkan proses dengan foto yang ada:', uploadErr);
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Prepare payload
      const payload = {
        nama: formData.nama.trim(),
        harga: Number(formData.harga),
        lokasi: formData.lokasi.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        tipe: formData.tipe,
        fasilitas: formData.fasilitas,
        jumlahKamar: Number(formData.jumlahKamar),
        fotoUrls: finalFotoUrls,
      };

      if (isEdit) {
        if (formData.jumlahKamarTersedia !== '') {
          payload.jumlahKamarTersedia = Number(formData.jumlahKamarTersedia);
        }
        await ownerService.updateKos(initialData._id, payload);
        setFormSuccess('Data kos berhasil diperbarui.');
      } else {
        await ownerService.createKos(payload);
        setFormSuccess('Kos baru berhasil diajukan untuk verifikasi.');
      }

      // Redirect after brief delay
      setTimeout(() => {
        router.push('/owner/kos');
      }, 1000);
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data properti kos.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-[#F1F5F9]">
      {/* Alert Notices */}
      {formError && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{formError}</span>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-slate-400 hover:text-white"
          >
            x
          </button>
        </div>
      )}

      {formSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{formSuccess} Mengalihkan ke inventaris...</span>
        </div>
      )}

      {/* Section 1: Informasi Dasar */}
      <div className="rounded-xl bg-[#141D30] border border-slate-800 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 pb-3 border-b border-slate-800">
          Informasi Utama Properti
        </h2>

        {/* Nama Kos */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kos-nama" className="text-xs font-medium text-[#94A3B8]">
            Nama Kos <span className="text-rose-400">*</span>
          </label>
          <input
            id="kos-nama"
            type="text"
            required
            placeholder="Contoh: Kos Pogung Asri Jaya"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Grid: Tipe Kos & Harga Sewa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-tipe" className="text-xs font-medium text-[#94A3B8]">
              Tipe Kos <span className="text-rose-400">*</span>
            </label>
            <select
              id="kos-tipe"
              value={formData.tipe}
              onChange={(e) => handleChange('tipe', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
              <option value="Campur">Campur</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-harga" className="text-xs font-medium text-[#94A3B8]">
              Harga Sewa per Bulan (Rp) <span className="text-rose-400">*</span>
            </label>
            <input
              id="kos-harga"
              type="number"
              required
              min="100000"
              step="50000"
              placeholder="Contoh: 950000"
              value={formData.harga}
              onChange={(e) => handleChange('harga', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] font-mono tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid: Kapasitas Kamar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-kamar-total" className="text-xs font-medium text-[#94A3B8]">
              Total Jumlah Kamar Kapasitas <span className="text-rose-400">*</span>
            </label>
            <input
              id="kos-kamar-total"
              type="number"
              required
              min="1"
              placeholder="Contoh: 10"
              value={formData.jumlahKamar}
              onChange={(e) => handleChange('jumlahKamar', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] font-mono tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kos-kamar-tersedia" className="text-xs font-medium text-[#94A3B8]">
                Kamar Siap Huni Saat Ini
              </label>
              <input
                id="kos-kamar-tersedia"
                type="number"
                min="0"
                max={formData.jumlahKamar || 999}
                placeholder="Jumlah kamar kosong"
                value={formData.jumlahKamarTersedia}
                onChange={(e) => handleChange('jumlahKamarTersedia', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] font-mono tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Lokasi & Geospasial */}
      <div className="rounded-xl bg-[#141D30] border border-slate-800 p-6 flex flex-col gap-5">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 pb-3 border-b border-slate-800">
          Lokasi & Koordinat Peta
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="kos-lokasi" className="text-xs font-medium text-[#94A3B8]">
            Alamat Lengkap / Area Kos <span className="text-rose-400">*</span>
          </label>
          <input
            id="kos-lokasi"
            type="text"
            required
            placeholder="Contoh: Jl. Pogung Dalangan No. 45, Mlati, Sleman, Yogyakarta"
            value={formData.lokasi}
            onChange={(e) => handleChange('lokasi', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Quick coordinate presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-[#94A3B8]">
            Gunakan Preset Koordinat Cepat (Yogyakarta):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COORDINATES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetCoords(p)}
                className="px-2.5 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-lat" className="text-xs font-medium text-[#94A3B8]">
              Latitude <span className="text-rose-400">*</span>
            </label>
            <input
              id="kos-lat"
              type="number"
              step="0.000001"
              required
              placeholder="-7.766000"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] font-mono tabular-nums focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="kos-lng" className="text-xs font-medium text-[#94A3B8]">
              Longitude <span className="text-rose-400">*</span>
            </label>
            <input
              id="kos-lng"
              type="number"
              step="0.000001"
              required
              placeholder="110.374000"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0F1D] border border-slate-700 text-sm text-[#F1F5F9] font-mono tabular-nums focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Fasilitas Kos */}
      <div className="rounded-xl bg-[#141D30] border border-slate-800 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300 pb-3 border-b border-slate-800">
          Daftar Fasilitas Tersedia
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {AVAILABLE_FACILITIES.map((facility) => {
            const isChecked = formData.fasilitas.includes(facility);
            return (
              <label
                key={facility}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  isChecked
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-[#0A0F1D] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <span className="truncate">{facility}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Foto Properti (Multi-Image Dropzone) */}
      <div className="rounded-xl bg-[#141D30] border border-slate-800 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
              Galeri Foto Properti
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Unggah hingga 5 foto berformat JPG/PNG/WebP (maks. 5MB per file)
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {formData.fotoUrls.length + pendingFiles.length} / 5 Foto
          </span>
        </div>

        {/* Existing & Pending Image Previews Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Saved URLs */}
          {formData.fotoUrls.map((url, idx) => (
            <div
              key={`saved-${idx}`}
              className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto kos ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveSavedPhoto(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hapus foto ini"
              >
                x
              </button>
            </div>
          ))}

          {/* Pending Local Files */}
          {pendingFiles.map((p, idx) => (
            <div
              key={`pending-${idx}`}
              className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-emerald-500/40 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt={`Preview baru ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-[#0A0F1D]/80 text-emerald-300">
                Siap Unggah
              </span>
              <button
                type="button"
                onClick={() => handleRemovePending(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Batalkan foto ini"
              >
                x
              </button>
            </div>
          ))}

          {/* Upload Button Tile */}
          {formData.fotoUrls.length + pendingFiles.length < 5 && (
            <label className="relative aspect-video rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-[#0A0F1D] flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[11px] font-medium">Tambah Foto</span>
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
          className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-[#141D30] border border-slate-700 transition-colors"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#0A0F1D] hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting && (
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
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

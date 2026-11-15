'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ownerService } from '../services/ownerService';
import { kosService } from '@/features/kos/services/kosService';

function mapKosToFormData(kos) {
  return {
    nama: kos?.nama || '',
    harga: kos?.harga ?? '',
    lokasi: kos?.lokasi || '',
    latitude: kos?.latitude !== undefined ? kos.latitude : -7.766,
    longitude: kos?.longitude !== undefined ? kos.longitude : 110.374,
    tipe: kos?.tipe || 'Putra',
    jumlahKamar: kos?.jumlahKamar ?? '',
    jumlahKamarTersedia:
      kos?.jumlahKamarTersedia !== undefined ? kos.jumlahKamarTersedia : '',
    fasilitas: Array.isArray(kos?.fasilitas) ? kos.fasilitas : [],
    fotoUrls: Array.isArray(kos?.fotoUrls) ? kos.fotoUrls : [],
  };
}

export function useOwnerKosForm({
  kosId = null,
  initialData: initialDataProp = null,
  isEdit = false,
  skipInitialFetch = false,
} = {}) {
  const router = useRouter();

  const [initialData, setInitialData] = useState(initialDataProp);
  const [formData, setFormData] = useState(() => mapKosToFormData(initialDataProp));
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isFetchingInitial, setIsFetchingInitial] = useState(
    Boolean(isEdit && kosId && !initialDataProp && !skipInitialFetch)
  );
  const [fetchError, setFetchError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const pendingFilesRef = useRef([]);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  // Revoke any remaining blob preview URLs and timers on unmount
  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Fetch initial kos data in edit mode via ownerService with kosService fallback
  useEffect(() => {
    if (!isEdit || !kosId || initialDataProp || skipInitialFetch) return;

    let ignore = false;

    const fetchTargetKos = async () => {
      await Promise.resolve();
      if (ignore) return;
      setIsFetchingInitial(true);
      setFetchError(null);

      try {
        const ownerRes = await ownerService.getOwnerKos();
        const found = ownerRes?.data?.find(
          (item) => String(item._id) === String(kosId)
        );

        if (found) {
          if (!ignore) {
            setInitialData(found);
            setFormData(mapKosToFormData(found));
          }
          return;
        }

        const publicRes = await kosService.getKosDetail(kosId);
        if (publicRes?.data && !ignore) {
          setInitialData(publicRes.data);
          setFormData(mapKosToFormData(publicRes.data));
          return;
        }

        if (!ignore) {
          setFetchError(
            'Data properti kos tidak ditemukan atau Anda tidak memiliki akses kepemilikan.'
          );
        }
      } catch (err) {
        if (!ignore) {
          setFetchError(
            err.response?.data?.message ||
              'Gagal memuat data kos yang akan diedit. Pastikan ID properti valid.'
          );
        }
      } finally {
        if (!ignore) {
          setIsFetchingInitial(false);
        }
      }
    };

    fetchTargetKos();

    return () => {
      ignore = true;
    };
  }, [isEdit, kosId, initialDataProp, skipInitialFetch]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFacilityToggle = useCallback((facilityName) => {
    setFormData((prev) => {
      const exists = prev.fasilitas.includes(facilityName);
      return {
        ...prev,
        fasilitas: exists
          ? prev.fasilitas.filter((f) => f !== facilityName)
          : [...prev.fasilitas, facilityName],
      };
    });
  }, []);

  const handlePresetCoords = useCallback((preset) => {
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
    }));
  }, []);

  const processFiles = useCallback(
    (fileListInput) => {
      const files = Array.from(fileListInput || []);
      if (!files.length) return;

      const totalAllowed = 5 - (formData.fotoUrls.length + pendingFiles.length);
      if (totalAllowed <= 0) {
        setFormError('Maksimal foto yang diperbolehkan adalah 5 foto.');
        return;
      }

      let validationMsg = null;
      const validFiles = files.slice(0, totalAllowed).filter((file) => {
        if (!file.type || !file.type.startsWith('image/')) {
          validationMsg = 'Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.';
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          validationMsg = 'Ukuran setiap file gambar maksimal 5 MB.';
          return false;
        }
        return true;
      });

      if (files.length > totalAllowed && !validationMsg) {
        validationMsg = `Hanya ${totalAllowed} foto tambahan yang dapat ditambahkan (maksimal 5 foto).`;
      }

      if (validFiles.length > 0) {
        const newPending = validFiles.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        }));
        setPendingFiles((prev) => [...prev, ...newPending]);
      }

      setFormError(validationMsg);
    },
    [formData.fotoUrls.length, pendingFiles.length]
  );

  const handleFileSelect = useCallback(
    (e) => {
      processFiles(e.target.files);
      if (e.target) {
        e.target.value = '';
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer?.files);
    },
    [processFiles]
  );

  const handleRemovePending = useCallback((index) => {
    setPendingFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleRemoveSavedPhoto = useCallback((urlToRemove) => {
    setFormData((prev) => ({
      ...prev,
      fotoUrls: prev.fotoUrls.filter((url) => url !== urlToRemove),
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

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
    if (
      formData.latitude === '' ||
      formData.longitude === '' ||
      Number.isNaN(Number(formData.latitude)) ||
      Number.isNaN(Number(formData.longitude))
    ) {
      setFormError('Koordinat latitude dan longitude wajib diisi dengan angka valid.');
      return;
    }
    if (!formData.jumlahKamar || Number(formData.jumlahKamar) <= 0) {
      setFormError('Jumlah kamar total harus berupa angka minimal 1.');
      return;
    }

    if (isEdit && formData.jumlahKamarTersedia !== '') {
      const availableCount = Number(formData.jumlahKamarTersedia);
      const totalCount = Number(formData.jumlahKamar);
      if (Number.isNaN(availableCount) || availableCount < 0) {
        setFormError('Jumlah kamar siap huni tidak boleh kurang dari 0.');
        return;
      }
      if (availableCount > totalCount) {
        setFormError(
          'Jumlah kamar siap huni tidak boleh melebihi total kapasitas kamar.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let finalFotoUrls = [...formData.fotoUrls];

      if (pendingFiles.length > 0) {
        setIsUploading(true);
        const filesToUpload = pendingFiles.map((p) => p.file);
        try {
          const uploadRes = await ownerService.uploadImages(filesToUpload);
          const uploadedUrls = uploadRes?.data?.urls;
          if (!Array.isArray(uploadedUrls) || uploadedUrls.length === 0) {
            throw new Error(
              'Server tidak mengembalikan URL foto yang berhasil diunggah.'
            );
          }
          finalFotoUrls = [...finalFotoUrls, ...uploadedUrls];
        } catch (uploadErr) {
          const uploadErrorMessage =
            uploadErr?.response?.data?.message ||
            uploadErr?.message ||
            'Gagal mengunggah foto ke Cloudinary. Perubahan data kos belum disimpan.';
          setFormError(uploadErrorMessage);
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

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
        const targetId = kosId || initialData?._id;
        if (!targetId) {
          throw new Error('ID properti kos yang akan diperbarui tidak ditemukan.');
        }
        if (formData.jumlahKamarTersedia !== '') {
          payload.jumlahKamarTersedia = Number(formData.jumlahKamarTersedia);
        }
        await ownerService.updateKos(targetId, payload);
        setFormSuccess('Data kos berhasil diperbarui.');
      } else {
        await ownerService.createKos(payload);
        setFormSuccess('Kos baru berhasil diajukan untuk verifikasi.');
      }

      // Revoke uploaded local previews after successful persistence
      pendingFiles.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      setPendingFiles([]);

      redirectTimerRef.current = setTimeout(() => {
        router.push('/owner/kos');
      }, 1000);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan saat menyimpan data properti kos.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    initialData,
    formData,
    pendingFiles,
    isFetchingInitial,
    fetchError,
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
  };
}

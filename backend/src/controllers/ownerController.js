import * as ownerService from '../services/ownerService.js';
import { uploadMultipleFiles, deleteCloudinaryImages } from '../services/uploadService.js';

export const getOwnerKos = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const data = await ownerService.getOwnerKosService(ownerId);
    res.status(200).json({ success: true, message: 'Berhasil mengambil data kos', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createKos = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { nama, harga, lokasi, latitude, longitude, tipe, fasilitas, jumlahKamar, fotoUrls } = req.body;

    if (
      !nama ||
      harga == null ||
      !lokasi ||
      latitude == null ||
      longitude == null ||
      !tipe ||
      jumlahKamar == null
    ) {
      return res.status(400).json({ success: false, message: 'Harap isi seluruh field wajib' });
    }

    if (Number(harga) <= 0 || !Number.isInteger(Number(jumlahKamar)) || Number(jumlahKamar) < 1) {
      return res.status(400).json({ success: false, message: 'Harga dan jumlah kamar harus bernilai positif' });
    }

    const newKos = await ownerService.createKosService(ownerId, {
      nama, harga, lokasi, latitude, longitude, tipe, fasilitas, jumlahKamar, fotoUrls
    });

    res.status(201).json({ success: true, message: 'Kos berhasil diajukan dan menunggu verifikasi', data: newKos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKos = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const updatedKos = await ownerService.updateKosService(ownerId, id, req.body);

    if (!updatedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan atau tidak memiliki akses' });
    }

    res.status(200).json({ success: true, message: 'Data kos berhasil diperbarui', data: updatedKos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteKos = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const deletedKos = await ownerService.deleteKosService(ownerId, id);

    if (!deletedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan atau tidak memiliki akses' });
    }

    res.status(200).json({ success: true, message: 'Kos berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { jumlahKamarTersedia } = req.body;

    const numericAvailability = Number(jumlahKamarTersedia);
    if (!Number.isInteger(numericAvailability) || numericAvailability < 0) {
      return res.status(400).json({ success: false, message: 'Jumlah kamar tersedia tidak boleh negatif' });
    }

    const updatedKos = await ownerService.updateAvailabilityService(ownerId, id, numericAvailability);

    if (!updatedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Ketersediaan kamar berhasil diperbarui', data: updatedKos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitKosForVerification = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const updatedKos = await ownerService.submitKosForVerificationService(ownerId, id);

    if (!updatedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Pengajuan verifikasi terkirim', data: updatedKos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getKosStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const kosStatus = await ownerService.getKosStatusService(ownerId, id);

    if (!kosStatus) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: kosStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadImages = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah' });
    }

    const urls = await uploadMultipleFiles(files, 'carikos');
    res.status(200).json({
      success: true,
      message: 'Gambar berhasil diunggah',
      data: { urls }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadKosImages = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah' });
    }

    const urls = await uploadMultipleFiles(files, 'carikos');
    const updatedKos = await ownerService.addKosImagesService(ownerId, id, urls);

    if (!updatedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan atau tidak memiliki akses' });
    }

    res.status(200).json({
      success: true,
      message: 'Foto kos berhasil diunggah dan disimpan',
      data: updatedKos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteKosImage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Harap sertakan imageUrl yang ingin dihapus' });
    }

    const updatedKos = await ownerService.removeKosImageService(ownerId, id, imageUrl);

    if (!updatedKos) {
      return res.status(404).json({ success: false, message: 'Kos tidak ditemukan atau tidak memiliki akses' });
    }

    await deleteCloudinaryImages([imageUrl]);

    res.status(200).json({
      success: true,
      message: 'Foto kos berhasil dihapus',
      data: updatedKos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
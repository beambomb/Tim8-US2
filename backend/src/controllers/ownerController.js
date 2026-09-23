import * as ownerService from '../services/ownerService.js';

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

    if (!nama || !harga || !lokasi || !latitude || !longitude || !tipe || !jumlahKamar) {
      return res.status(400).json({ success: false, message: 'Harap isi seluruh field wajib' });
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

    const updatedKos = await ownerService.updateAvailabilityService(ownerId, id, jumlahKamarTersedia);

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
// Simulasi penyimpanan data sementara (In-Memory Database)
let kosData = [
  {
    id: 1,
    nama: "Kos Mawar Indah",
    harga: 850000,
    lokasi: "Jl. Kaliurang KM 5, Yogyakarta",
    tipe: "Putri",
    fasilitas: ["Wi-Fi", "Kamar Mandi Dalam", "Kasur", "Lemari"],
    jumlahKamar: 10,
    jumlahKamarTersedia: 3,
    statusVerifikasi: "Approved",
    alasanPenolakan: null
  }
];

// 1. Menampilkan daftar seluruh kos milik pemilik kos
export const getOwnerKos = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar kos milik pemilik",
      data: kosData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kos",
      error: error.message
    });
  }
};

// 2. Mendaftarkan / membuat data kos baru
export const createKos = (req, res) => {
  try {
    const { nama, harga, lokasi, tipe, fasilitas, jumlahKamar } = req.body;

    const newKos = {
      id: kosData.length + 1,
      nama,
      harga,
      lokasi,
      tipe,
      fasilitas,
      jumlahKamar,
      jumlahKamarTersedia: jumlahKamar,
      statusVerifikasi: "Pending",
      alasanPenolakan: null
    };

    kosData.push(newKos);

    res.status(201).json({
      success: true,
      message: "Data kos berhasil didaftarkan dan menunggu verifikasi admin",
      data: newKos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mendaftarkan kos baru",
      error: error.message
    });
  }
};

// 3. Mengubah / memperbarui data kos
export const updateKos = (req, res) => {
  try {
    const { id } = req.params;
    const { nama, harga, lokasi, tipe, fasilitas, jumlahKamar } = req.body;

    const kosIndex = kosData.findIndex(item => item.id === parseInt(id));

    if (kosIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    kosData[kosIndex] = {
      ...kosData[kosIndex],
      nama: nama || kosData[kosIndex].nama,
      harga: harga || kosData[kosIndex].harga,
      lokasi: lokasi || kosData[kosIndex].lokasi,
      tipe: tipe || kosData[kosIndex].tipe,
      fasilitas: fasilitas || kosData[kosIndex].fasilitas,
      jumlahKamar: jumlahKamar || kosData[kosIndex].jumlahKamar
    };

    res.status(200).json({
      success: true,
      message: `Data kos dengan ID ${id} berhasil diperbarui`,
      data: kosData[kosIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui data kos",
      error: error.message
    });
  }
};

// 4. Menghapus data kos
export const deleteKos = (req, res) => {
  try {
    const { id } = req.params;
    const kosIndex = kosData.findIndex(item => item.id === parseInt(id));

    if (kosIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    kosData = kosData.filter(item => item.id !== parseInt(id));

    res.status(200).json({
      success: true,
      message: `Kos dengan ID ${id} berhasil dihapus`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kos",
      error: error.message
    });
  }
};

// 5. Memperbarui jumlah / status ketersediaan kamar
export const updateAvailability = (req, res) => {
  try {
    const { id } = req.params;
    const { jumlahKamarTersedia } = req.body;

    const kos = kosData.find(item => item.id === parseInt(id));

    if (!kos) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    kos.jumlahKamarTersedia = jumlahKamarTersedia;

    res.status(200).json({
      success: true,
      message: `Ketersediaan kamar untuk kos ID ${id} berhasil diperbarui`,
      data: {
        id: kos.id,
        nama: kos.nama,
        jumlahKamarTersedia: kos.jumlahKamarTersedia
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengubah ketersediaan kamar",
      error: error.message
    });
  }
};

// 6. Mengirimkan pengajuan verifikasi kos ke administrator
export const submitKosForVerification = (req, res) => {
  try {
    const { id } = req.params;
    const kos = kosData.find(item => item.id === parseInt(id));

    if (!kos) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    kos.statusVerifikasi = "Pending";

    res.status(200).json({
      success: true,
      message: `Pengajuan verifikasi untuk kos ID ${id} berhasil dikirim ke administrator`,
      data: {
        id: kos.id,
        statusVerifikasi: kos.statusVerifikasi
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengajukan verifikasi kos",
      error: error.message
    });
  }
};

// 7. Mengecek status verifikasi kos (Pending / Approved / Rejected)
export const getKosStatus = (req, res) => {
  try {
    const { id } = req.params;
    const kos = kosData.find(item => item.id === parseInt(id));

    if (!kos) {
      return res.status(404).json({
        success: false,
        message: `Kos dengan ID ${id} tidak ditemukan`
      });
    }

    res.status(200).json({
      success: true,
      message: `Status verifikasi untuk kos ID ${id}`,
      data: {
        id: kos.id,
        nama: kos.nama,
        statusVerifikasi: kos.statusVerifikasi,
        alasanPenolakan: kos.alasanPenolakan
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengecek status verifikasi",
      error: error.message
    });
  }
};
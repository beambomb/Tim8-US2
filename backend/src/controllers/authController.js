import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";

export const register = async (req, res) => {
  try {
    const { nama, email, password, role, noHp } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = role === "PEMILIK_KOS" ? "PEMILIK_KOS" : "PENCARI_KOS";

    const newUser = new User({
      nama,
      email,
      password: hashedPassword,
      noHp: noHp || null,
      role: assignedRole,
    });
    await newUser.save();

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser._id,
        nama: newUser.nama,
        email: newUser.email,
        noHp: newUser.noHp,
        role: newUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Kredensial tidak valid" });
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        nama: user.nama,
        email: user.email,
        noHp: user.noHp,
        role: user.role,
        savedCampuses: user.savedCampuses || [],
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// 3. Fungsi Get Me (Profil)
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data profil berhasil diambil",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

export const addSavedCampus = async (req, res) => {
  try {
    const { id, shortName, nama, kota, latitude, longitude, source } = req.body;
    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (!nama || !Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res.status(400).json({
        success: false,
        message: "Nama kampus dan koordinat yang valid wajib diisi",
      });
    }

    const campusId = String(
      id || `custom_${nama.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`
    );

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const exists = (user.savedCampuses || []).some(
      (item) => item.id === campusId
    );
    if (!exists) {
      if ((user.savedCampuses || []).length >= 12) {
        return res.status(400).json({
          success: false,
          message: "Maksimal 12 kampus tersimpan per akun",
        });
      }
      user.savedCampuses.push({
        id: campusId,
        shortName: String(shortName || nama).slice(0, 40),
        nama: String(nama).slice(0, 120),
        kota: String(kota || "").slice(0, 80),
        latitude: latNum,
        longitude: lngNum,
        source: source === "preset" ? "preset" : "nominatim",
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      savedCampuses: user.savedCampuses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menyimpan kampus", error: error.message });
  }
};

export const removeSavedCampus = async (req, res) => {
  try {
    const campusId = decodeURIComponent(req.params.campusId || "");
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.savedCampuses = (user.savedCampuses || []).filter(
      (item) => item.id !== campusId
    );
    await user.save();

    res.status(200).json({
      success: true,
      savedCampuses: user.savedCampuses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus kampus", error: error.message });
  }
};

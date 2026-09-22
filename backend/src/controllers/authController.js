import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. Fungsi Registrasi
export const register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru ke database
    const newUser = new User({
      nama,
      email,
      password: hashedPassword,
      role: role || "PENCARI_KOS",
    });
    await newUser.save();

    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser._id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// 2. Fungsi Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    // Bandingkan password input dengan password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Kredensial tidak valid" });
    }

    // Buat JSON Web Token (JWT) yang berisi payload ID dan role user
    const jwtSecret = process.env.JWT_SECRET || "rahasia_jwt_carikos_123";
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login berhasil",
      token,
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

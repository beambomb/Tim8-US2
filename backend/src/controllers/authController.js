import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const jwtSecret = process.env.JWT_SECRET || "rahasia_jwt_carikos_123";
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

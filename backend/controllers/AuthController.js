import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/AdminModel.js";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

const JWT_SECRET = process.env.JWT_SECRET;

// admin register
export const register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;

  // validasi input
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Nama, Email, dan Password wajib diisi" });
  }

  // validasi password
  if (confPassword && password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan Konfirmasi Password tidak cocok" });
  }

  try {
    // validasi email
    const existingAdmin = await Admin.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ msg: "Email sudah terdaftar. Gunakan email lain." });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword,
    });

    res.status(201).json({ msg: "Registrasi Admin berhasil. Silakan login." });
  } catch (error) {
    console.error("Error registrasi admin:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// admin login
export const login = async (req, res) => {
  const { email, password } = req.body;

  // validasi input
  if (!email || !password) {
    return res.status(400).json({ msg: "Email dan Password wajib diisi" });
  }

  try {
    // validasi email
    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!admin) {
      return res.status(404).json({ msg: "Email atau Password tidak cocok" });
    }

    // verifikasi password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Email atau Password tidak cocok" });
    }

    // payload
    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d", // expired: 1 hari
    });

    res.status(200).json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      msg: "Login berhasil",
    });
  } catch (error) {
    console.error("Error login admin:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// admin profile
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      attributes: ["id", "name", "email", "createdAt"],
      where: {
        id: req.admin.id,
      },
    });

    if (!admin) {
      return res.status(404).json({ msg: "Data Admin tidak ditemukan" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error mengambil profile admin:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

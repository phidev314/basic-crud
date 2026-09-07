import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";

dotenv.config(); // untuk membaca file .env dan environment variables di dalamnya

const JWT_SECRET = process.env.JWT_SECRET;

// registrasi pengguna (dengan assign role otomatis / default 'admin' jika via endpoint auth portal)
export const register = async (req, res) => {
  const { name, email, password, confPassword, roleName = "admin" } = req.body;

  // validasi input wajib
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Nama, Email, dan Password wajib diisi" });
  }

  // validasi kecocokan password dan konfirmasi password
  if (confPassword && password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan Konfirmasi Password tidak cocok" });
  }

  try {
    // cek apakah email sudah terdaftar
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "Email sudah terdaftar. Gunakan email lain." });
    }

    // cari role berdasarkan nama role (misal: 'admin', 'user', 'finance')
    let role = await Role.findOne({
      where: { name: roleName.toLowerCase() },
    });

    // jika role belum ada, buatkan otomatis
    if (!role) {
      role = await Role.create({
        name: roleName.toLowerCase(),
        description: `Role ${roleName}`,
      });
    }

    // hash password menggunakan bcrypt sebelum disimpan ke database
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword,
      roleId: role.id,
    });

    res.status(201).json({
      msg: `Registrasi berhasil untuk role ${role.name}. Silakan login.`,
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Error registrasi user:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// login pengguna & verifikasi role
export const login = async (req, res) => {
  const { email, password } = req.body;

  // validasi input
  if (!email || !password) {
    return res.status(400).json({ msg: "Email dan Password wajib diisi" });
  }

  try {
    // cari user beserta rolenya berdasarkan email
    const user = await User.findOne({
      where: {
        email: email.toLowerCase(),
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!user || !user.password) {
      return res.status(404).json({ msg: "Email atau Password tidak cocok" });
    }

    // verifikasi kesesuaian password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Email atau Password tidak cocok" });
    }

    const roleName = user.role ? user.role.name : "user";

    // payload token jwt
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      roleId: user.roleId,
    };

    // buat token jwt dengan masa berlaku 1 hari
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d", // expired: 1 hari
    });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role || { id: user.roleId, name: roleName },
    };

    res.status(200).json({
      token,
      user: userData,
      admin: userData, // backward compatibility untuk frontend
      msg: "Login berhasil",
    });
  } catch (error) {
    console.error("Error login user:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// get user profile (me)
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.admin?.id;
    const user = await User.findOne({
      attributes: ["id", "name", "email", "gender", "avatar", "roleId", "createdAt"],
      where: {
        id: userId,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: "Data Pengguna tidak ditemukan" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error mengambil profile:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


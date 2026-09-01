import { Op } from "sequelize";
import User from "../models/UserModel.js";
import Address from "../models/AddressModel.js";
import fs from "fs";
import path from "path";

// get all users (dengan server-side pagination, search, filter gender, sorting, dan relasi addresses)
export const getUsers = async (req, res) => {
  try {
    const {
      search = "",
      gender,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const whereCondition = {};

    // 1. Pencarian server-side berdasarkan nama atau email
    if (search && search.trim() !== "") {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { email: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    // 2. Filter server-side berdasarkan jenis kelamin (gender)
    if (gender && gender !== "all" && gender !== "") {
      whereCondition.gender = gender;
    }

    // 3. Validasi kolom sorting yang aman
    const allowedSortFields = ["id", "name", "email", "gender", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Eksekusi query dengan hitung total data
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Address,
          as: "addresses",
          attributes: ["id", "label", "street", "city", "province", "postalCode", "isPrimary"],
        },
      ],
      order: [[sortField, sortOrder]],
      limit: parsedLimit,
      offset: offset,
      distinct: true, // memastikan count menghitung User, bukan baris join Address
    });

    const totalPages = Math.ceil(count / parsedLimit);

    res.status(200).json({
      totalItems: count,
      totalPages: totalPages || 1,
      currentPage: parsedPage,
      limit: parsedLimit,
      data: rows,
    });
  } catch (error) {
    console.error("Error getUsers:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// get user by id (beserta data alamat / address yang berelasi)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Address,
          as: "addresses",
          order: [
            ["isPrimary", "DESC"],
            ["createdAt", "DESC"],
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getUserById:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// create user (mendukung form JSON & Multipart/form-data upload avatar)
export const createUser = async (req, res) => {
  const { name, email, gender, street, city, province, postalCode, addressLabel } = req.body;

  // validasi input wajib
  if (!name || name.trim() === "") {
    return res.status(400).json({ msg: "Nama pengguna wajib diisi" });
  }

  if (!email || email.trim() === "") {
    return res.status(400).json({ msg: "Email pengguna wajib diisi" });
  }

  if (!gender || gender.trim() === "") {
    return res.status(400).json({ msg: "Jenis kelamin pengguna wajib diisi" });
  }

  try {
    // cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email: email.trim() } });
    if (existingUser) {
      // Hapus file gambar yang sempat terupload jika ada
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    let avatarPath = null;
    if (req.file) {
      avatarPath = `/uploads/users/${req.file.filename}`;
    } else if (req.body.avatar && typeof req.body.avatar === "string") {
      avatarPath = req.body.avatar.trim();
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim(),
      gender: gender.trim(),
      avatar: avatarPath,
    });

    // Jika disertakan alamat awal saat registrasi
    if (street && street.trim() && city && city.trim() && province && province.trim()) {
      await Address.create({
        userId: newUser.id,
        label: addressLabel ? addressLabel.trim() : "Rumah",
        street: street.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode ? postalCode.trim() : null,
        isPrimary: true,
      });
    }

    // Ambil data user lengkap dengan relasi alamat
    const fullUser = await User.findByPk(newUser.id, {
      include: [
        {
          model: Address,
          as: "addresses",
        },
      ],
    });

    res.status(201).json({
      msg: "Pengguna berhasil ditambahkan",
      data: fullUser,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error("Error createUser:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal menambahkan pengguna", error: error.message });
  }
};

// update user (mendukung upload avatar baru & update informasi)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, gender } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    // Cek duplikasi email jika email diubah
    if (email && email.trim() !== user.email) {
      const emailCheck = await User.findOne({ where: { email: email.trim() } });
      if (emailCheck && emailCheck.id !== user.id) {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).json({ msg: "Email sudah digunakan oleh pengguna lain" });
      }
    }

    let updatedAvatar = user.avatar;
    if (req.file) {
      // Hapus avatar lama jika file lokal
      if (user.avatar && user.avatar.startsWith("/uploads/users/")) {
        const oldPath = path.resolve(`.${user.avatar}`);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }
      updatedAvatar = `/uploads/users/${req.file.filename}`;
    } else if (req.body.avatar !== undefined) {
      updatedAvatar = req.body.avatar;
    }

    await user.update({
      name: name !== undefined ? name.trim() : user.name,
      email: email !== undefined ? email.trim() : user.email,
      gender: gender !== undefined ? gender.trim() : user.gender,
      avatar: updatedAvatar,
    });

    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Address,
          as: "addresses",
        },
      ],
    });

    res.status(200).json({
      msg: "Pengguna berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error("Error updateUser:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal memperbarui pengguna", error: error.message });
  }
};

// upload khusus foto avatar user
export const uploadAvatar = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ msg: "Harap pilih file gambar untuk diupload" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    // Hapus avatar lama jika ada
    if (user.avatar && user.avatar.startsWith("/uploads/users/")) {
      const oldPath = path.resolve(`.${user.avatar}`);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    const avatarPath = `/uploads/users/${req.file.filename}`;
    await user.update({ avatar: avatarPath });

    res.status(200).json({
      msg: "Foto profil berhasil diperbarui",
      avatar: avatarPath,
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error("Error uploadAvatar:", error.message);
    res.status(500).json({ msg: "Gagal mengupload foto profil", error: error.message });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    // Hapus file avatar jika ada
    if (user.avatar && user.avatar.startsWith("/uploads/users/")) {
      const oldPath = path.resolve(`.${user.avatar}`);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    await user.destroy();
    res.status(200).json({ msg: "Pengguna beserta data alamat berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteUser:", error.message);
    res.status(500).json({ msg: "Gagal menghapus pengguna", error: error.message });
  }
};

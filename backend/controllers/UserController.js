import User from "../models/UserModel.js";

// get all users (dengan pagination, search, filter, sorting)
export const getUsers = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1); // halaman saat ini (default: halaman 1)
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // jumlah data per halaman (default: 10, max: 100)
    const offset = (parsedPage - 1) * parsedLimit; // offset (jumlah data yang dilewati)

    const whereCondition = {};

    // pencarian nama atau email
    if (search.trim()) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { email: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    // eksekusi query berdasarkan whereCondition dan pagination
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: parsedLimit,
      offset: offset,
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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: {
        id,
      },
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

// create user
export const createUser = async (req, res) => {
  const { name, email, gender, phoneNumber } = req.body;

  // validasi input
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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim(),
      gender: gender.trim(),
      phoneNumber: phoneNumber || null,
    });

    res.status(201).json({ msg: "Pengguna berhasil ditambahkan", data: newUser });
  } catch (error) {
    console.error("Error createUser:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal menambahkan pengguna", error: error.message });
  }
};

// update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, gender } = req.body;

  try {
    // cari user yang akan diupdate
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    // update data user
    await user.update({
      name: name !== undefined ? name.trim() : user.name,
      email: email !== undefined ? email.trim() : user.email,
      gender: gender !== undefined ? gender.trim() : user.gender
    });

    // ambil data user terupdate
    const updatedUser = await User.findByPk(id);

    res.status(200).json({ msg: "Pengguna berhasil diperbarui", data: updatedUser });
  } catch (error) {
    console.error("Error updateUser:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal memperbarui pengguna", error: error.message });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // cari user yang akan dihapus
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ msg: `Pengguna dengan ID #${id} tidak ditemukan` });
    }

    await user.destroy();
    res.status(200).json({ msg: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Error deleteUser:", error.message);
    res.status(500).json({ msg: "Gagal menghapus pengguna", error: error.message });
  }
};

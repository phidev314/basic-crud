import Address from "../models/AddressModel.js";
import User from "../models/UserModel.js";

// get all addresses (mendukung filter opsional berdasarkan userId & relasi data user)
export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    const whereCondition = {};

    // filter berdasarkan pemilik alamat jika userId disertakan pada query url
    if (userId) {
      whereCondition.userId = userId;
    }

    const addresses = await Address.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
      order: [
        ["isPrimary", "DESC"], // alamat utama selalu ditampilkan paling atas
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error getAddresses:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// get address by id
export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
    });

    if (!address) {
      return res.status(404).json({ msg: `Alamat dengan ID #${id} tidak ditemukan` });
    }

    res.status(200).json(address);
  } catch (error) {
    console.error("Error getAddressById:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// create address (dengan penanganan alamat utama / isPrimary)
export const createAddress = async (req, res) => {
  const { userId, label, street, city, province, postalCode, isPrimary } = req.body;
  const targetUserId = userId || req.params.userId;

  // validasi input data wajib
  if (!targetUserId) {
    return res.status(400).json({ msg: "ID Pengguna (userId) wajib disertakan" });
  }

  if (!street || street.trim() === "") {
    return res.status(400).json({ msg: "Alamat jalan wajib diisi" });
  }

  if (!city || city.trim() === "") {
    return res.status(400).json({ msg: "Kota / Kabupaten wajib diisi" });
  }

  if (!province || province.trim() === "") {
    return res.status(400).json({ msg: "Provinsi wajib diisi" });
  }

  try {
    // pastikan user pemilik alamat ada di database
    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ msg: `Pengguna dengan ID #${targetUserId} tidak ditemukan` });
    }

    const primaryFlag = isPrimary === true || isPrimary === "true" || isPrimary === 1;

    // jika alamat baru diset sebagai alamat utama, reset alamat lain milik user ini menjadi non-utama
    if (primaryFlag) {
      await Address.update(
        { isPrimary: false },
        { where: { userId: targetUserId } }
      );
    }

    const newAddress = await Address.create({
      userId: targetUserId,
      label: label ? label.trim() : "Rumah",
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode ? postalCode.trim() : null,
      isPrimary: primaryFlag,
    });

    res.status(201).json({
      msg: "Alamat berhasil ditambahkan",
      data: newAddress,
    });
  } catch (error) {
    console.error("Error createAddress:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal menambahkan alamat", error: error.message });
  }
};

// update address
export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const { label, street, city, province, postalCode, isPrimary } = req.body;

  try {
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ msg: `Alamat dengan ID #${id} tidak ditemukan` });
    }

    const primaryFlag = isPrimary === true || isPrimary === "true" || isPrimary === 1;

    // jika status diubah menjadi alamat utama, nonaktifkan status utama alamat lain milik user
    if (primaryFlag && !address.isPrimary) {
      await Address.update(
        { isPrimary: false },
        { where: { userId: address.userId } }
      );
    }

    await address.update({
      label: label !== undefined ? label.trim() : address.label,
      street: street !== undefined ? street.trim() : address.street,
      city: city !== undefined ? city.trim() : address.city,
      province: province !== undefined ? province.trim() : address.province,
      postalCode: postalCode !== undefined ? (postalCode ? postalCode.trim() : null) : address.postalCode,
      isPrimary: isPrimary !== undefined ? primaryFlag : address.isPrimary,
    });

    const updatedAddress = await Address.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      msg: "Alamat berhasil diperbarui",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updateAddress:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal memperbarui alamat", error: error.message });
  }
};

// delete address (jika alamat utama dihapus, otomatis alihkan status utama ke alamat pertama yang tersisa)
export const deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ msg: `Alamat dengan ID #${id} tidak ditemukan` });
    }

    const wasPrimary = address.isPrimary;
    const userId = address.userId;

    await address.destroy();

    // jika yang dihapus adalah alamat utama, otomatis jadikan salah satu alamat tersisa sebagai utama
    if (wasPrimary) {
      const firstRemaining = await Address.findOne({ where: { userId } });
      if (firstRemaining) {
        await firstRemaining.update({ isPrimary: true });
      }
    }

    res.status(200).json({
      msg: "Alamat berhasil dihapus",
      deletedId: Number(id),
    });
  } catch (error) {
    console.error("Error deleteAddress:", error.message);
    res.status(500).json({ msg: "Gagal menghapus alamat", error: error.message });
  }
};

// set primary address
export const setPrimaryAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ msg: `Alamat dengan ID #${id} tidak ditemukan` });
    }

    // set semua alamat milik user ini menjadi isPrimary = false
    await Address.update(
      { isPrimary: false },
      { where: { userId: address.userId } }
    );

    // set alamat yang dipilih menjadi isPrimary = true
    await address.update({ isPrimary: true });

    res.status(200).json({
      msg: "Alamat berhasil dijadikan sebagai alamat utama",
      data: address,
    });
  } catch (error) {
    console.error("Error setPrimaryAddress:", error.message);
    res.status(500).json({ msg: "Gagal mengubah alamat utama", error: error.message });
  }
};

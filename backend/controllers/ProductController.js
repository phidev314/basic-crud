import { Op } from "sequelize"; // modul untuk filtering atau sorting
import Product from "../models/ProductModel.js";
import ProductCategory from "../models/ProductCategoryModel.js";

// get all products (dengan pagination, search, filter kategori & range harga, sorting)
export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1); // halaman saat ini (default: halaman 1)
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // jumlah data per halaman (default: 10, max: 100)
    const offset = (parsedPage - 1) * parsedLimit; // offset (jumlah data yang dilewati)

    // filter kondisi pencarian dengan default value kosong (belum terisi)
    const whereConditions = {};

    // pencarian nama atau deskripsi
    if (search.trim()) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    // filter kategori
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    // filter rentang harga
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    } else if (minPrice !== undefined) {
      whereConditions.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice !== undefined) {
      whereConditions.price = { [Op.lte]: parseFloat(maxPrice) };
    }

    // eksekusi query berdasarkan whereConditions dan pagination
    const { count, rows } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [[sortBy, order.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
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
    console.error("Error getProducts:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id },
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getProductById:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan pada server", error: error.message });
  }
};

// create product
export const createProduct = async (req, res) => {
  const { name, price, stock, description, imageUrl, categoryId } = req.body;

  // validasi input wajib
  if (!name || name.trim() === "") {
    return res.status(400).json({ msg: "Nama produk wajib diisi" });
  }

  // validasi harga
  if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ msg: "Harga produk harus berupa angka positif" });
  }

  // validasi stok
  if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
    return res.status(400).json({ msg: "Stok produk harus berupa angka positif" });
  }

  try {
    // validasi apakah categoryId valid jika diberikan
    if (categoryId) {
      const categoryExists = await ProductCategory.findByPk(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ msg: `Kategori dengan ID #${categoryId} tidak ditemukan` });
      }
    }

    const newProduct = await Product.create({
      name: name.trim(),
      price: Number(price),
      stock: stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : 0,
      description: description || null,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
    });

    // ambil data produk yang baru dibuat beserta relasi kategorinya
    const createdProductWithCategory = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      msg: "Produk berhasil ditambahkan",
      data: createdProductWithCategory,
    });
  } catch (error) {
    console.error("Error createProduct:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal menambahkan produk", error: error.message });
  }
};

// update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, description, imageUrl, categoryId } = req.body;

  try {
    // cari produk yang akan diupdate
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    // validasi categoryId jika diubah
    if (categoryId !== undefined && categoryId !== null) {
      const categoryExists = await ProductCategory.findByPk(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ msg: `Kategori dengan ID #${categoryId} tidak ditemukan` });
      }
    }

    // update data produk
    await product.update({
      name: name !== undefined ? name.trim() : product.name,
      price: price !== undefined ? Number(price) : product.price,
      stock: stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : product.stock,
      description: description !== undefined ? description : product.description,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
    });

    // ambil data produk terupdate beserta relasi kategori
    const updatedProductWithCategory = await Product.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      msg: "Produk berhasil diperbarui",
      data: updatedProductWithCategory,
    });
  } catch (error) {
    console.error("Error updateProduct:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal memperbarui produk", error: error.message });
  }
};

// delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    await product.destroy();

    res.status(200).json({
      msg: `Produk "${product.name}" berhasil dihapus`,
      deletedId: Number(id),
    });
  } catch (error) {
    console.error("Error deleteProduct:", error.message);
    res.status(500).json({ msg: "Gagal menghapus produk", error: error.message });
  }
};

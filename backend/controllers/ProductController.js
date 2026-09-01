import { Op } from "sequelize";
import Product from "../models/ProductModel.js";
import ProductCategory from "../models/ProductCategoryModel.js";
import User from "../models/UserModel.js";
import Address from "../models/AddressModel.js";
import fs from "fs";
import path from "path";

// get all products (dengan server-side pagination, search, filter kategori, range harga, status stok, dan sorting)
export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      categoryId,
      minPrice,
      maxPrice,
      stockStatus,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const offset = (parsedPage - 1) * parsedLimit;

    const whereConditions = {};

    // 1. pencarian server-side nama atau deskripsi
    if (search && search.trim()) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    // 2. filter server-side kategori
    if (categoryId && categoryId !== "all" && categoryId !== "") {
      whereConditions.categoryId = categoryId;
    }

    // 3. filter server-side rentang harga
    if (minPrice !== undefined && maxPrice !== undefined && minPrice !== "" && maxPrice !== "") {
      whereConditions.price = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    } else if (minPrice !== undefined && minPrice !== "") {
      whereConditions.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice !== undefined && maxPrice !== "") {
      whereConditions.price = { [Op.lte]: parseFloat(maxPrice) };
    }

    // 4. filter server-side status stok
    if (stockStatus) {
      if (stockStatus === "in_stock") {
        whereConditions.stock = { [Op.gt]: 5 };
      } else if (stockStatus === "low_stock") {
        whereConditions.stock = { [Op.and]: [{ [Op.gt]: 0 }, { [Op.lte]: 5 }] };
      } else if (stockStatus === "out_of_stock") {
        whereConditions.stock = { [Op.lte]: 0 };
      }
    }

    // 5. validasi kolom sorting yang aman
    const allowedSortFields = ["id", "name", "price", "stock", "createdAt", "updatedAt"];
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let orderClause = [["createdAt", "DESC"]];
    if (sortBy === "category") {
      orderClause = [[{ model: ProductCategory, as: "category" }, "name", sortOrder]];
    } else if (allowedSortFields.includes(sortBy)) {
      orderClause = [[sortBy, sortOrder]];
    }

    // eksekusi query dengan hitung total data
    const { count, rows } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: orderClause,
      limit: parsedLimit,
      offset: offset,
      distinct: true, // memastikan count menghitung Product, bukan baris join
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

// get product by id (beserta data kategori)
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

// create product (mendukung multipart/form-data upload foto produk via multer)
export const createProduct = async (req, res) => {
  const { name, price, stock, description, categoryId } = req.body;

  // validasi input data wajib produk
  if (!name || name.trim() === "") {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ msg: "Nama produk wajib diisi" });
  }

  if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ msg: "Harga produk harus berupa angka positif" });
  }

  if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ msg: "Stok produk harus berupa angka positif" });
  }

  try {
    // validasi apakah kategori produk yang dipilih valid
    if (categoryId) {
      const categoryExists = await ProductCategory.findByPk(categoryId);
      if (!categoryExists) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ msg: `Kategori dengan ID #${categoryId} tidak ditemukan` });
      }
    }

    // tangani path file foto produk dari multer atau string url
    let finalImageUrl = null;
    if (req.file) {
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    } else if (req.body.imageUrl && typeof req.body.imageUrl === "string") {
      finalImageUrl = req.body.imageUrl.trim();
    }

    const newProduct = await Product.create({
      name: name.trim(),
      price: Number(price),
      stock: stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : 0,
      description: description ? description.trim() : null,
      imageUrl: finalImageUrl,
      categoryId: categoryId ? Number(categoryId) : null,
    });

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
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("Error createProduct:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal menambahkan produk", error: error.message });
  }
};

// update product (mendukung upload gambar baru dan penghapusan file gambar lama dari disk)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, description, categoryId } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const categoryExists = await ProductCategory.findByPk(categoryId);
      if (!categoryExists) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ msg: `Kategori dengan ID #${categoryId} tidak ditemukan` });
      }
    }

    let finalImageUrl = product.imageUrl;
    if (req.file) {
      // hapus file gambar lama jika tersimpan di folder lokal uploads/products/
      if (product.imageUrl && product.imageUrl.startsWith("/uploads/products/")) {
        const oldPath = path.resolve(`.${product.imageUrl}`);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      finalImageUrl = req.body.imageUrl;
    }

    await product.update({
      name: name !== undefined ? name.trim() : product.name,
      price: price !== undefined ? Number(price) : product.price,
      stock: stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : product.stock,
      description: description !== undefined ? description : product.description,
      imageUrl: finalImageUrl,
      categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : product.categoryId,
    });

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
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("Error updateProduct:", error.message);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ msg: error.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ msg: "Gagal memperbarui produk", error: error.message });
  }
};

// delete product (hapus produk beserta file gambarnya dari disk)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    // hapus file gambar fisik dari folder uploads jika ada
    if (product.imageUrl && product.imageUrl.startsWith("/uploads/products/")) {
      const oldPath = path.resolve(`.${product.imageUrl}`);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
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

// penyesuaian stok produk di sisi server (menambah 'add' atau mengurangi 'subtract' stok secara aman)
export const adjustProductStock = async (req, res) => {
  const { id } = req.params;
  const { type, amount = 1 } = req.body;

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ msg: "Jumlah penyesuaian stok harus berupa angka bulat positif lebih dari 0." });
  }

  if (type !== "add" && type !== "subtract") {
    return res.status(400).json({ msg: "Tipe penyesuaian harus bernilai 'add' (penambahan) atau 'subtract' (pengurangan)." });
  }

  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ msg: `Produk dengan ID #${id} tidak ditemukan` });
    }

    const currentStock = Number(product.stock) || 0;
    let newStock = currentStock;

    if (type === "add") {
      newStock = currentStock + parsedAmount;
    } else if (type === "subtract") {
      // validasi: stok tidak boleh berkurang hingga minus
      if (currentStock < parsedAmount) {
        return res.status(400).json({
          msg: `Gagal mengurangi stok. Stok saat ini (${currentStock} unit) lebih kecil dari jumlah pengurangan (${parsedAmount} unit).`,
        });
      }
      newStock = Math.max(0, currentStock - parsedAmount);
    }

    await product.update({ stock: newStock });

    res.status(200).json({
      msg: `Stok produk "${product.name}" berhasil ${type === "add" ? "ditambahkan" : "dikurangi"} menjadi ${newStock} unit.`,
      data: {
        id: product.id,
        name: product.name,
        previousStock: currentStock,
        adjustmentType: type,
        amount: parsedAmount,
        stock: newStock,
        category: product.category,
      },
    });
  } catch (error) {
    console.error("Error adjustProductStock:", error.message);
    res.status(500).json({ msg: "Gagal memproses penyesuaian stok pada server", error: error.message });
  }
};

// kalkulasi keranjang belanja secara server-side (memvalidasi harga asli di DB, cek ketersediaan stok, dan hitung subtotal)
export const calculateCart = async (req, res) => {
  const { items = [] } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ msg: "Format keranjang belanja tidak valid." });
  }

  try {
    let subtotal = 0;
    let totalItems = 0;
    const validatedItems = [];

    // validasi setiap item berdasarkan data produk aktual di database
    for (const item of items) {
      const productId = item.id || item.productId;
      if (!productId) continue;

      const product = await Product.findByPk(productId, {
        include: [
          {
            model: ProductCategory,
            as: "category",
            attributes: ["id", "name"],
          },
        ],
      });

      if (product) {
        const requestedQty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
        const actualPrice = Number(product.price);
        const itemSubtotal = actualPrice * requestedQty;
        const isStockSufficient = product.stock >= requestedQty;

        subtotal += itemSubtotal;
        totalItems += requestedQty;

        validatedItems.push({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: actualPrice,
          stock: product.stock,
          imageUrl: product.imageUrl,
          category: product.category?.name || "Umum",
          quantity: requestedQty,
          itemTotal: itemSubtotal,
          isAvailable: isStockSufficient,
        });
      }
    }

    const shippingFee = 0; // simulasi ongkir gratis
    const grandTotal = subtotal + shippingFee;

    res.status(200).json({
      subtotal,
      totalItems,
      shippingFee,
      grandTotal,
      items: validatedItems,
    });
  } catch (error) {
    console.error("Error calculateCart:", error.message);
    res.status(500).json({ msg: "Gagal menghitung kalkulasi keranjang belanja", error: error.message });
  }
};

// proses checkout pesanan: validasi pembeli & alamat, cek kecukupan stok, potong stok di DB, dan buat invoice/struk
export const checkoutOrder = async (req, res) => {
  const { userId, addressId, items = [], notes = "" } = req.body;

  // validasi input pesanan
  if (!userId) {
    return res.status(400).json({ msg: "Pengguna (userId) wajib dipilih untuk checkout." });
  }

  if (!addressId) {
    return res.status(400).json({ msg: "Alamat pengiriman wajib dipilih." });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Keranjang belanja kosong." });
  }

  try {
    // 1. validasi keberadaan user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "Pengguna tidak ditemukan." });
    }

    // 2. validasi alamat milik user
    const address = await Address.findOne({
      where: { id: addressId, userId },
    });
    if (!address) {
      return res.status(404).json({ msg: "Alamat pengiriman tidak valid untuk pengguna ini." });
    }

    // 3. validasi ketersediaan stok dan lakukan pemotongan stok di database
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.id || item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Produk dengan ID #${item.id || item.productId} tidak ditemukan.` });
      }

      const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
      if (product.stock < qty) {
        return res.status(400).json({
          msg: `Stok produk "${product.name}" tidak mencukupi. Sisa stok: ${product.stock}, diminta: ${qty}.`,
        });
      }

      // potong stok produk di database secara server-side
      await product.update({ stock: product.stock - qty });

      const itemTotal = Number(product.price) * qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: qty,
        imageUrl: product.imageUrl,
        total: itemTotal,
      });
    }

    // 4. generate order id unik
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. susun invoice / receipt pesanan lengkap
    const orderReceipt = {
      orderId,
      date: new Date().toISOString(),
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      shippingAddress: {
        id: address.id,
        label: address.label,
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
      },
      items: orderItems,
      subtotal,
      shippingFee: 0,
      grandTotal: subtotal,
      notes: notes || "Pesanan reguler",
      status: "Berhasil Diproses",
    };

    res.status(201).json({
      msg: "Pesanan berhasil dibuat dan checkout selesai!",
      data: orderReceipt,
    });
  } catch (error) {
    console.error("Error checkoutOrder:", error.message);
    res.status(500).json({ msg: "Gagal memproses checkout", error: error.message });
  }
};

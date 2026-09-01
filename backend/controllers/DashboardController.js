import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import ProductCategory from "../models/ProductCategoryModel.js";
import Address from "../models/AddressModel.js";

// get dashboard stats (agregasi statistik dashboard secara server-side)
export const getDashboardStats = async (req, res) => {
  try {
    // eksekusi kalkulasi agregasi sql di database secara paralel menggunakan promise.all
    const [
      totalUsers,
      maleUsers,
      femaleUsers,
      totalProducts,
      totalStockSum,
      totalCategories,
      recentUsers,
      recentProducts,
    ] = await Promise.all([
      User.count(), // menghitung total seluruh user
      User.count({ where: { gender: "Laki-laki" } }), // menghitung user laki-laki
      User.count({ where: { gender: "Perempuan" } }), // menghitung user perempuan
      Product.count(), // menghitung total produk
      Product.sum("stock"), // menghitung total stok produk yang tersedia
      ProductCategory.count(), // menghitung total kategori produk
      User.findAll({
        // mengambil 5 user terbaru beserta alamatnya
        attributes: ["id", "name", "email", "gender", "avatar", "createdAt"],
        include: [
          {
            model: Address,
            as: "addresses",
            attributes: ["id", "city", "province", "isPrimary"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      Product.findAll({
        // mengambil 5 produk terbaru beserta relasi kategorinya
        attributes: ["id", "name", "price", "stock", "imageUrl", "createdAt"],
        include: [
          {
            model: ProductCategory,
            as: "category",
            attributes: ["id", "name"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
    ]);

    res.status(200).json({
      stats: {
        totalUsers: totalUsers || 0,
        maleUsers: maleUsers || 0,
        femaleUsers: femaleUsers || 0,
        totalProducts: totalProducts || 0,
        totalStock: totalStockSum || 0,
        totalCategories: totalCategories || 0,
      },
      recentUsers,
      recentProducts,
    });
  } catch (error) {
    console.error("Error getDashboardStats:", error.message);
    res.status(500).json({
      msg: "Gagal memuat statistik dashboard dari server",
      error: error.message,
    });
  }
};

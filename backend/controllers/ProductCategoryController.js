import ProductCategory from "../models/ProductCategoryModel.js";
import Product from "../models/ProductModel.js";

// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.findAll({
      order: [["name", "ASC"]], // diurutkan berdasarkan name
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getCategories:", error.message);
    res.status(500).json({ msg: "Gagal memuat kategori", error: error.message });
  }
};

// get category by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ProductCategory.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "name", "price", "stock"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ msg: `Kategori dengan ID #${id} tidak ditemukan` });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error getCategoryById:", error.message);
    res.status(500).json({ msg: "Gagal memuat data kategori", error: error.message });
  }
};

// create category (sementara category akan diseeding dari file seeding, jadi create category sementara tidak dipakai)
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ msg: "Nama kategori wajib diisi" });
  }

  try {
    const newCategory = await ProductCategory.create({
      name: name.trim(),
      description: description || null,
    });
    res.status(201).json({ msg: "Kategori berhasil dibuat", data: newCategory });
  } catch (error) {
    console.error("Error createCategory:", error.message);
    res.status(500).json({ msg: "Gagal membuat kategori", error: error.message });
  }
};

// update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ msg: `Kategori dengan ID #${id} tidak ditemukan` });
    }

    await category.update({
      name: name !== undefined ? name.trim() : category.name,
      description: description !== undefined ? description : category.description,
    });

    res.status(200).json({ msg: "Kategori berhasil diperbarui", data: category });
  } catch (error) {
    console.error("Error updateCategory:", error.message);
    res.status(500).json({ msg: "Gagal memperbarui kategori", error: error.message });
  }
};

// delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ msg: `Kategori dengan ID #${id} tidak ditemukan` });
    }

    await category.destroy();
    res.status(200).json({ msg: `Kategori "${category.name}" berhasil dihapus` });
  } catch (error) {
    console.error("Error deleteCategory:", error.message);
    res.status(500).json({ msg: "Gagal menghapus kategori", error: error.message });
  }
};

import { http } from "./api";

export const productService = {
  // Ambil semua produk dengan opsi query params (search, categoryId, page, limit, dsb)
  getProducts: (params = {}) => {
    return http.get("/products", params);
  },

  // Ambil detail produk berdasarkan ID
  getProductById: (id) => {
    return http.get(`/products/${id}`);
  },

  // Tambah produk baru
  createProduct: (productData) => {
    return http.post("/products", productData);
  },

  // Perbarui produk berdasarkan ID
  updateProduct: (id, productData) => {
    return http.patch(`/products/${id}`, productData);
  },

  // Hapus produk berdasarkan ID
  deleteProduct: (id) => {
    return http.delete(`/products/${id}`);
  },

  // Ambil semua kategori produk
  getCategories: () => {
    return http.get("/categories");
  },

  // Tambah kategori baru
  createCategory: (categoryData) => {
    return http.post("/categories", categoryData);
  },
};

export default productService;

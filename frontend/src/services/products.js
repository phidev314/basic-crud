import { http } from "./api";

export const productService = {
  // Ambil semua produk dengan opsi query params (search, categoryId, minPrice, maxPrice, stockStatus, page, limit, sortBy, order)
  getProducts: (params = {}) => {
    return http.get("/products", params);
  },

  // Ambil detail produk berdasarkan ID
  getProductById: (id) => {
    return http.get(`/products/${id}`);
  },

  // Tambah produk baru (mendukung FormData gambar)
  createProduct: (productData) => {
    return http.post("/products", productData);
  },

  // Perbarui produk berdasarkan ID (mendukung FormData gambar)
  updateProduct: (id, productData) => {
    return http.patch(`/products/${id}`, productData);
  },

  // Hapus produk berdasarkan ID
  deleteProduct: (id) => {
    return http.delete(`/products/${id}`);
  },

  // Penyesuaian stok produk (Operasi Penambahan 'add' atau Pengurangan 'subtract')
  adjustStock: (id, { type, amount = 1 }) => {
    return http.post(`/products/${id}/adjust-stock`, { type, amount });
  },

  // Kalkulasi keranjang belanja secara server-side (menghitung subtotal, grand total, ketersediaan stok aktual)
  calculateCart: (items = []) => {
    return http.post("/products/calculate-cart", { items });
  },

  // Ambil semua kategori produk
  getCategories: () => {
    return http.get("/categories");
  },

  // Tambah kategori baru
  createCategory: (categoryData) => {
    return http.post("/categories", categoryData);
  },

  // Checkout Pesanan
  checkoutOrder: (checkoutData) => {
    return http.post("/products/checkout", checkoutData);
  },
};

export default productService;

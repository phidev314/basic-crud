import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  checkoutOrder,
  adjustProductStock,
  calculateCart,
} from "../controllers/ProductController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import {
  uploadProductImage,
  handleUploadError,
} from "../middleware/UploadMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk entitas produk (product), keranjang belanja, dan penyesuaian stok
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi bearer token admin
 * @note - endpoint dengan uploadProductImage mendukung multipart file upload untuk foto produk
 */

// endpoint publik (dapat diakses oleh siapa saja / pembeli toko)
router.get("/products", getProducts);
router.post("/products/calculate-cart", calculateCart);
router.get("/products/:id", getProductById);
router.post("/products/checkout", checkoutOrder);
router.post("/checkout", checkoutOrder);

// endpoint terproteksi admin (membutuhkan bearer token & upload foto produk)
router.post(
  "/products",
  verifyToken,
  uploadProductImage.single("image"),
  handleUploadError,
  createProduct
);

router.post("/products/:id/adjust-stock", verifyToken, adjustProductStock);

router.patch(
  "/products/:id",
  verifyToken,
  uploadProductImage.single("image"),
  handleUploadError,
  updateProduct
);

router.delete("/products/:id", verifyToken, deleteProduct);

export default router;

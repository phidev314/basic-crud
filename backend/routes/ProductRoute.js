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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

// endpoint publik (dapat diakses oleh siapa saja / pembeli toko)
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/products", getProducts);

/**
 * @swagger
 * /products/calculate-cart:
 *   post:
 *     summary: Calculate total cart price
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/products/calculate-cart", calculateCart);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/products/:id", getProductById);

/**
 * @swagger
 * /products/checkout:
 *   post:
 *     summary: Checkout order
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/products/checkout", checkoutOrder);

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Checkout order (alias)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/checkout", checkoutOrder);

// endpoint terproteksi admin (membutuhkan bearer token & upload foto produk)
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/products",
  verifyToken,
  uploadProductImage.single("image"),
  handleUploadError,
  createProduct
);

/**
 * @swagger
 * /products/{id}/adjust-stock:
 *   post:
 *     summary: Adjust product stock
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adjustment:
 *                 type: number
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/products/:id/adjust-stock", verifyToken, adjustProductStock);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  "/products/:id",
  verifyToken,
  uploadProductImage.single("image"),
  handleUploadError,
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/products/:id", verifyToken, deleteProduct);

export default router;

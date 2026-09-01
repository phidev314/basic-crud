import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk autentikasi
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi
 * @note - endpoint yang tidak menggunakan verifyToken artinya termasuk public api
 */

router.get("/products", getProducts);
router.get("/products/:id", getProductById);

router.post("/products", verifyToken, createProduct);
router.patch("/products/:id", verifyToken, updateProduct);
router.delete("/products/:id", verifyToken, deleteProduct);

export default router;

import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/ProductCategoryController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk autentikasi
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi
 * @note - endpoint yang tidak menggunakan verifyToken artinya termasuk public api
 */

router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", verifyToken, createCategory);
router.patch("/categories/:id", verifyToken, updateCategory);
router.delete("/categories/:id", verifyToken, deleteCategory);

export default router;

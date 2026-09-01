import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk autentikasi
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi
 * @note - endpoint yang tidak menggunakan verifyToken artinya termasuk public api
 */

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", verifyToken, createUser);
router.patch("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

export default router;
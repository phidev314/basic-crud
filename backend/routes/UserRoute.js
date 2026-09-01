import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import {
  uploadUserAvatar,
  handleUploadError,
} from "../middleware/UploadMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk entitas Pengguna (User)
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi Bearer token
 * @note - endpoint dengan uploadUserAvatar mendukung multipart file upload untuk foto profil
 */

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post(
  "/users",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  createUser
);
router.patch(
  "/users/:id",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  updateUser
);
router.post(
  "/users/:id/avatar",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  uploadAvatar
);
router.delete("/users/:id", verifyToken, deleteUser);

export default router;
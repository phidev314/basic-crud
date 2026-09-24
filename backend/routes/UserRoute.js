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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
router.get("/users/:id", getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *               role:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/users",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  createUser
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user data
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confPassword:
 *                 type: string
 *               role:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 */
router.patch(
  "/users/:id",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  updateUser
);

/**
 * @swagger
 * /users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
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
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 */
router.post(
  "/users/:id/avatar",
  verifyToken,
  uploadUserAvatar.single("avatar"),
  handleUploadError,
  uploadAvatar
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
router.delete("/users/:id", verifyToken, deleteUser);

export default router;
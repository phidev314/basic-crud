import express from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk autentikasi
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi
 * @note - endpoint yang tidak menggunakan verifyToken artinya termasuk public api
 */

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", verifyToken, getMe);

export default router;

import express from "express";
import { getDashboardStats } from "../controllers/DashboardController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics endpoint
 */

/**
 * @description - routing untuk agregasi statistik dashboard (server-side)
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Internal Server Error
 */
router.get("/dashboard/stats", getDashboardStats);

export default router;

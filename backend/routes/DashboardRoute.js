import express from "express";
import { getDashboardStats } from "../controllers/DashboardController.js";

const router = express.Router();

/**
 * @description - routing untuk agregasi statistik dashboard (server-side)
 */
router.get("/dashboard/stats", getDashboardStats);

export default router;

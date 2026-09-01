import express from "express";
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
} from "../controllers/AddressController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const router = express.Router();

/**
 * @description - routing untuk entitas alamat (address)
 * @note - endpoint yang menggunakan verifyToken artinya membutuhkan otorisasi bearer token
 * @note - endpoint yang tidak menggunakan verifyToken artinya termasuk public api
 */
router.get("/addresses", getAddresses);
router.get("/addresses/:id", getAddressById);
router.get("/users/:userId/addresses", getAddresses);
router.post("/addresses", verifyToken, createAddress);
router.post("/users/:userId/addresses", verifyToken, createAddress);
router.put("/addresses/:id", verifyToken, updateAddress);
router.patch("/addresses/:id/primary", verifyToken, setPrimaryAddress);
router.delete("/addresses/:id", verifyToken, deleteAddress);

export default router;

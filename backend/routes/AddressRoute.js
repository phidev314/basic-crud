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
/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management API
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses
 *     tags: [Addresses]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/addresses", getAddresses);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Addresses]
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
router.get("/addresses/:id", getAddressById);

/**
 * @swagger
 * /users/{userId}/addresses:
 *   get:
 *     summary: Get addresses by user ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/users/:userId/addresses", getAddresses);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
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
router.post("/addresses", verifyToken, createAddress);

/**
 * @swagger
 * /users/{userId}/addresses:
 *   post:
 *     summary: Create a new address for a user
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
router.post("/users/:userId/addresses", verifyToken, createAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Addresses]
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
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/addresses/:id", verifyToken, updateAddress);

/**
 * @swagger
 * /addresses/{id}/primary:
 *   patch:
 *     summary: Set an address as primary
 *     tags: [Addresses]
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
router.patch("/addresses/:id/primary", verifyToken, setPrimaryAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
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
router.delete("/addresses/:id", verifyToken, deleteAddress);

export default router;

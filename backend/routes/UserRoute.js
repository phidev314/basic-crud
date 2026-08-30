import express from "express";
import {
    getUsers, 
    getUsersById,
    createUser,
    deleteUser,
    updateUser,
} from "../Controller/UserController.js"

const router = express.Router()

router.get('/users', getUsers);
router.get('/users/:id', getUsersById);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
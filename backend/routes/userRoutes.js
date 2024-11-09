import express from "express";

const router = express.Router();

import {authUser,registerUser,logoutUser,getUserProfile,updateUserProfile,getUsers,
    deleteUser,getUserById,updateUser,updateUserXP,updateUserXPByName,getUserXPByName} from '../controllers/userController.js';

import { protect,admin } from "../middleware/authMiddleware.js";

router.route('/').post(registerUser).get(protect,admin,getUsers);
router.post('/logout',logoutUser);
router.post('/auth',authUser);
router.route('/profile').get(protect,getUserProfile).put(protect,updateUserProfile)
router.route('/:id').get(protect,admin,getUserById).delete(protect,admin,deleteUser).put(protect,admin,updateUser);
// Route to update totalXP by user ID
router.put('/xp/:userId', updateUserXP);

router.post('/:name/addXP', updateUserXPByName);
router.get('/:name/totalXP', getUserXPByName);



export default router;
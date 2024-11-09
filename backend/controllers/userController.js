import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

import generateToken from '../utils/generateToken.js';

// @desc Auth user & get Token
////@route POST /api/users/auth
//@access Public

const authUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});

    if(user && (await user.matchPassword(password))){

        generateToken(res,user._id);
        res.status(200).json({
            _id : user._id,
            name : user.name,
            email : user.email,
            //isAdmin : user.isAdmin
        })
    } else{
        res.status(404);
        throw new Error('Invalid Username or Password');
    }
});

// @desc Register User
//@route POST /api/users
//@access Public

const registerUser = asyncHandler(async (req,res)=>{
    const {name,email,password} = req.body;

    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error('User already exits');
    }

    const user = await User.create({name,email,password});

    if(user){
        generateToken(res,user._id);
        res.status(201).json({
            _id : user._id,
            name : user.name,
            email : user.email,
            //isAdmin : user.isAdmin
        });
    }else{
        res.status(400);
        throw new Error('User already exits');
    }

});

// @desc Log Out User / Clear cookie
//@route POST /api/users/logout
//@access Private

const logoutUser = asyncHandler(async (req,res)=>{
    res.cookie('jwt','',{
        httpOnly : true,
        expires : new Date(0)
    });

    res.status(200).json({
        message : "logged out successfully"
    })
});

// @desc User Profile
//@route GET /api/users/profile
//@access Private

const getUserProfile = asyncHandler(async (req,res)=>{
    //res.send('user Profile');
    const user = await User.findById(req.user._id);
    if(user){
        res.status(201).json({
            _id : user._id,
            name : user.name,
            email : user.email,
            //isAdmin : user.isAdmin
            totalXP : user.totalXP
        });
    }else{
        res.status(400);
        throw new Error('User already exits');
    }
});

// @desc update User Profile
//@route Put  /api/users/profile
//@access Private

const updateUserProfile = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id);

    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            user.password = req.body.password || user.password;
        }
        const updateUser = await user.save();
        res.status(200).json({
            _id : updateUser._id,
            name : updateUser.name,
            email : updateUser.email,
            //isAdmin : updateUser.isAdmin
        })
    }else{
        res.status(404);
        throw new Error('User not found');
    }

});

// @desc get Users
//@route GET  /api/users
//@access Private/Admin

const getUsers = asyncHandler(async (req,res)=>{
    const users = await User.find({});
    res.status(200).json(users);
});

// @desc get User by id
//@route GET  /api/users/:id
//@access Private/Admin

const getUserById = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.id);
    if(user){
        res.status(200).json(user);
    }else{
        res.status(404);
        throw new Error('Resource not founded');
    }
});

// @desc delete Users
//@route DELETE  /api/users/:ID
//@access Private/Admin

const deleteUser = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.id);
    if(user){
        if(user.isAdmin){
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        const deletedUser = await User.deleteOne({_id : user._id});
        res.status(200).json({
            message : "User deleted succesfully!"
        })
    }else{
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc update Users
//@route put  /api/users/:ID
//@access Private/Admin

const updateUser = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.id);
    if(user){
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);
        const updatedUser = await user.save();
        res.status(200).json({
            _id : updateUser._id,
            name : updateUser.name,
            email : updateUser.email,
            //isAdmin : updateUser.isAdmin
        });
    }else{
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc Update User XP by ID
// @route PUT /api/users/xp/:userId
// @access Private

const updateUserXP = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { xp } = req.body;

    const user = await User.findById(userId);  // Find user by _id
    if (user) {
        user.totalXP = (user.totalXP || 0) + xp;  // Add the new xp to the existing totalXP
        await user.save();

        res.status(200).json({
            message: "User XP updated successfully",
            totalXP: user.totalXP,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

const updateUserXPByName = asyncHandler(async (req,res) => {
    try {
        const { name } = req.params;
        const { xp } = req.body;
    
        // Ensure xp is an integer
        const xpToAdd = parseInt(xp, 10);
        if (isNaN(xpToAdd)) {
          return res.status(400).json({ message: 'Invalid XP value' });
        }
    
        // Find user by name
        const user = await User.findOne({ name });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Parse the existing totalXP to integer, add the new XP, and convert back to string
        const currentTotalXP = parseInt(user.totalXP || '0', 10);
        const updatedTotalXP = currentTotalXP + xpToAdd;
    
        // Save the updated totalXP as a string in the database
        user.totalXP = updatedTotalXP.toString();
        await user.save();
    
        res.json({
          message: 'XP updated successfully',
          totalXP: user.totalXP,
        });
      } catch (error) {
        console.error('Error updating XP:', error);
        res.status(500).json({ message: 'Server error' });
      }
  });

  const getUserXPByName = asyncHandler(async (req, res) => {
    try {
      const { name } = req.params;
  
      // Find the user by name
      const user = await User.findOne({ name });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the totalXP
      res.json({
        message: 'User XP fetched successfully',
        totalXP: user.totalXP,
      });
    } catch (error) {
      console.error('Error fetching user XP:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

export {authUser,registerUser,logoutUser,getUserProfile,updateUserProfile,getUsers,
    deleteUser,getUserById,updateUser,updateUserXP,updateUserXPByName,getUserXPByName
}





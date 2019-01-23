const express = require("express");
const router = express.Router();
import UserHandler from '../../models/handlers/UserHandler';

// Load User model
const User = require("../../models/databases/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => UserHandler.createUser(req, res));

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => UserHandler.loginUserByNameAndPassword(req,res));

module.exports = router
  
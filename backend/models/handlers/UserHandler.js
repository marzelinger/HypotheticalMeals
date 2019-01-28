// /models/handlers/UserHandler.js
// Maddie

import User from '../databases/User';
import isAdmin from '../../validation/isAdmin';
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");



// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

class UserHandler{
    // Creates a User in the Database
    // If the User exists, return error if it exists
    static createUser(req, res){
      //const user = getCurUser();
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  User.findOne({ email: req.body.email })
      .then(user => {
      if (user) {
        return res.status(400).json({ email: "Email already exists" });
      } 
  //we assume by here that the user that is creating this person has
  //the permission to because we checked it in the validateRegisterInput function

  const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          privileges : req.body.privileges,
          admin_creator: req.body.admin_creator,
          comment: req.body.comment
        });
  // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
  )
    }

    static loginUserByNameAndPassword(req,res){
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          console.log("admin of new user: "+ user.email+" is: "+ isAdmin(user).isValid);
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: isAdmin(user).isValid
          };
  // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  

    }

    static updateUserByID(req, res){
    }

    // Gets all Users in the database
    static getAllUsers(req, res){
        User.find((err, users) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: users });
          });
    }
    static getUserByID(req, res){
    }
    static deleteUserByID(req, res){
    }

}

export default UserHandler;

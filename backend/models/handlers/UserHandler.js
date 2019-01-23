// /models/handlers/UserHandler.js
// Maddie

import User from '../databases/User';
const bcrypt = require("bcryptjs");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

class UserHandler{

    // Creates a User in the Database
    // If the User exists, return error if it exists
    static createUser(req, res){
        // const user = new User();
        // const { name, email, password, date} = req.body;
        // User.find({ name : name }, (err, curr_user) => {
        //     if (err) return res.json({ success: false, error: err });
        //     if (curr_user.length != 0) {
        //         return res.json({ success: true, error: '422' });
        //     }
        //     user.name = name;
        //     user.email = email;
        //     user.password = password;
        //     user.date = date;
        //     //error on successful POST
        //     user.save(err => {
        //         if (err) return res.json({ success: false, error: err });
        //         return res.json({ success: true, data: user });
        //     });
        //     return res.json({ success: true, data: user });
            
        // });

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
  const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
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

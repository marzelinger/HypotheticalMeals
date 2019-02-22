// /models/handlers/UserHandler.js
// Maddie

import User from '../databases/User';
import isAdmin from '../../validation/isAdmin';
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
import printFuncBack from "../../printFuncBack";




// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

var client_id = "meta-alligators";


class UserHandler{
    // Creates a User in the Database
    // If the User exists, return error if it exists
    static createUser(req, res){
      // Form validation
      const { errors, isValid } = validateRegisterInput(req.body);
      // Check validation
      if (!isValid) {
        return res.status(400).json(errors);
      }
      User.findOne({ username: req.body.username })
      .then(user => {
      if (user) {
        return res.status(400).json({ username: "Username already exists" });
      } 
      const newUser = new User({
          username: req.body.username,
          password: req.body.password,
          privileges : req.body.privileges,
          admin_creator: req.body.admin_creator,
          isAdmin: req.body.isAdmin,
          isNetIDLogin: req.body.isNetIDLogin,
          comment: req.body.comment,

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
    //const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    // Find user by username
    User.findOne({ username }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ usernamenotfound: "Username not found" });
        
      }
    // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            username: user.username,
            admin: user.isAdmin
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
          printFuncBack("this is the payload token. " +JSON.stringify(payload));
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
    }

    static loginUserDukeNetID (req,res){
      const username = req.body.username;
      const isNetIDLogin = req.body.isNetIDLogin;
      // Find user by username
      printFuncBack("this is in the loginUserDukeNetID");
      printFuncBack("this is the request string: "+JSON.stringify(req.body));
      User.findOne({ username }).then(user => {
        // Check if user exists
        printFuncBack("user: "+user);

        if (!user) {
          printFuncBack("user was not true");

          //user doesn't exist, so create a new one.
          const newUser = new User({
            username: req.body.username,
            isNetIDLogin: req.body.isNetIDLogin,
            });
          newUser.save().then(newuser => {
            //res.json(user)
            printFuncBack("newuser is: "+JSON.stringify(newuser));

            const payload = {
              id: newuser.id,
              username: newuser.username,
              //admin: isAdmin(newuser).isValid
              admin: newuser.isAdmin
            };
  
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
          }).catch(err => console.log(err));
        }
        else if (user && isNetIDLogin){
          printFuncBack("user existed is: "+JSON.stringify(user));

          //for sure is the netid stuff and going to make payload and login.
          const payload = {
            id: user.id,
            username: user.username,
            admin: user.isAdmin
          };
          printFuncBack("this is the payload token in logging in user.. " +JSON.stringify(payload));

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
        }
      });
    }

  static async updateUserByID(req, res){
      try {
          printFuncBack("here in the update user by id");
          var target_id = req.params.user_id;
          printFuncBack("target id stuff "+target_id);

          if (!target_id) {
              return res.json({ success: false, error: 'No user id provided'});
          }
          var new_username = req.body.username;
          var new_isAdmin = req.body.isAdmin;
          var new_comment = req.body.comment;
          printFuncBack("new stuff: "+new_username+new_isAdmin+new_comment);

          let updated_user = await User.findOneAndUpdate({ _id: target_id},
              {$set: {username: new_username, isAdmin : new_isAdmin, comment: new_comment}}, {upsert: true, new: true});
          //let test_user = await User.find(target_id);
          printFuncBack("new updateduser: "+updated_user);
          printFuncBack("new stringifty: "+JSON.stringify(updated_user));


          if(!updated_user){
              return res.json({
                  success: true, error: 'This document does not exist'
              });
          }
          return res.json({
              success: true, data: updated_user
          });    
      }
      catch (err) {
          return res.json({ success: false, error: err});
      }
  }



    // Gets all Users in the database
    static getAllUsers(req, res){
        User.find((err, users) => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true, data: users });
          });
    }
}

export default UserHandler;

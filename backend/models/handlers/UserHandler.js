// /models/handlers/UserHandler.js
// Maddie

import User from '../databases/User';

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");


// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

class UserHandler{


//   static tokenConfig(){
//   if (localStorage.jwtToken) {
//     // Set auth token header auth
//     const token = localStorage.jwtToken;
//     setAuthToken(token);
//     // Decode token and get user info and exp
//     const decoded = jwt_decode(token);
//     // Set user and isAuthenticated
//     store.dispatch(setCurrentUser(decoded));
//     // Check for expired token
//     const currentTime = Date.now() / 1000; // to get in milliseconds
//     if (decoded.exp < currentTime) {
//       // Logout user
//       store.dispatch(logoutUser());
  
//       // Redirect to login
//       window.location.href = "./login";
//     }
//   }

// }




    // Creates a User in the Database
    // If the User exists, return error if it exists
    static createUser(req, res){
      //const user = getCurUser();
    // Form validation
  const { errors, isValid } = validateRegisterInput(req.body, user);
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
          priviledges : req.body.priviledges,
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
          const payload = {
            id: user.id,
            name: user.name,
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

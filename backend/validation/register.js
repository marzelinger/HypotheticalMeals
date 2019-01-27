//register.js file to pull in validator and is-empty dependencies
//then have the function of validateRegisterInput which has an input of data
//and it then checks that the data is correct etc. This is for creating a user.
//Maddie
//derived from: https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669

const Validator = require("validator");
const isEmpty = require("is-empty");
import isAdmin from "./isAdmin";

module.exports = function validateRegisterInput(data){
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.name = !isEmpty(data.name) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";
    // Name checks
    if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
    }
    // Email checks
    if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
    } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
    }    

    // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
    if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  }
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
    if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  // //check that the only person that is trying to register a user is an admin.
  // if(!isAdmin(user).isValid){
  //   errors.privileges = "Only admins may create new users.";
  // }
  return {
    errors,
    isValid: isEmpty(errors)
  };
}

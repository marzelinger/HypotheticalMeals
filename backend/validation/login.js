//login.js file 
//then have the function of validateRegisterInput which has an input of data
//and it then checks that the data is correct etc. This is for user login.
//Maddie
//derived from: https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669

const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  //data.email = !isEmpty(data.email) ? data.email : "";
  data.username = !isEmpty(data.username) ? data.username : "";
  data.password = !isEmpty(data.password) ? data.password : "";
// Email checks
  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is required";
  //} else if (!Validator.isUsername(data.username)) {
    //errors.username = "Username is invalid";
  }
// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};

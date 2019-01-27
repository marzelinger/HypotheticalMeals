
const isEmpty = require("is-empty");

module.exports = function isAdmin(user){
    let errors = {};

  if (user.priviledges.includes("Admin")){
    return {
        errors,
        isValid: isEmpty(errors)
    };  
  }
    errors.priviledges = "Only admins may create new users.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}

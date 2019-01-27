
const isEmpty = require("is-empty");

module.exports = function isAdmin(user){
    let errors = {};

    if (user == null){    
      errors.isEmpty = "this user is empty."
    return {
      errors,
      isValid: isEmpty(errors)
  }
  }
  if (user.privileges.includes("Admin")){
    return {
        errors,
        isValid: isEmpty(errors)
    };  
  }
    errors.privileges = "Only admins may create new users.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}

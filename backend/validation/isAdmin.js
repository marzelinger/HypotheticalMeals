import ADMIN from '../../client/src/resources/Constants';
const isEmpty = require("is-empty");

module.exports = function isAdmin(user){
    let errors = {};

    if (user == null){    
      errors.isEmpty = "This user is null."
    return {
      errors,
      isValid: isEmpty(errors)
  }
  }
  if (user.privileges.includes(ADMIN)){
    return {
        errors,
        isValid: isEmpty(errors)
    };  
  }
    errors.privileges = "This user is not an admin.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}

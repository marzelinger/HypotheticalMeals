
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

module.exports = function adminHasInit(){
    let errors = {};
    if(localStorage != null){
      if(localStorage.getItem("firstAdminCreated")!= null){
        errors.admin = "The initial admin has been created.";
          return{
          errors,
          isValid: isEmpty(errors)
          };
      }
    }
    return {
    errors,
    isValid: isEmpty(errors)
}
}


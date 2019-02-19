
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

module.exports = function currentUserIsAdmin(){
    let errors = {};
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
        const decoded = jwt_decode(localStorage.getItem("jwtToken"));
        const curUserIsAdmin = decoded.admin;

        if(curUserIsAdmin){
          return{
          errors,
          isValid: isEmpty(errors)
          };
        }
      }
    }
    errors.privileges = "Only admins may create new users.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}
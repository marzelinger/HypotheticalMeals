
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");

module.exports = function currentUserIsAdmin(){
    let errors = {};
    if(localStorage != null){
      if(localStorage.getItem("jwtToken")!= null){
        const decoded = jwt_decode(localStorage.getItem("jwtToken"));
        const curUserIsAdmin = decoded.admin;
        console.log("the decoded is: "+ decoded);
        console.log("curUser admin status is is: "+ curUserIsAdmin);

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
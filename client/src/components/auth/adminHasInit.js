
const jwt_decode = require('jwt-decode');
const isEmpty = require("is-empty");
const getAllUsers = require('../../actions/authActions');

module.exports = function adminHasInit(){
  //var response = getAllUsers();

    let errors = {};
    console.log("this is the adminHasinit flag: "+ localStorage.getItem("firstAdminCreated"));

     if(localStorage != null){
      console.log("first");

        if(localStorage.getItem("firstAdminCreated")!= null){

        console.log("second");
        
        console.log("this is the adminHasinit boolean: "+ localStorage.getItem("firstAdminCreated"));

        if(Boolean(localStorage.getItem("firstAdminCreated"))){
 
          console.log("this is admin will be true: ");
          console.log("third");

          return{
          errors,
          isValid: isEmpty(errors)
          };
      }
    }
    }
    console.log("this is admin will be false: ");

    errors.admin = "The initial admin has not been created.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}


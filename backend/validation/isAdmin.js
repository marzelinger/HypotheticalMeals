const isEmpty = require("is-empty");

module.exports = function isAdmin(user){
    let errors = {};
    ///console.log("this is the user being logged in: "+user);
    if (user == null){    
      errors.isEmpty = "This user is null."
    return {
      errors,
      isValid: isEmpty(errors)
  }
  }

  if (user.privileges.includes('Admin')){
    return {
        errors,
        isValid: isEmpty(errors)
    };  
  }
    //console.log("made it to this point in the isAdmin... the user is: "+user);
    errors.privileges = "This user is not an admin.";
    return {
    errors,
    isValid: isEmpty(errors)
}
}
